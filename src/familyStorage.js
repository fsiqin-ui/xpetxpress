import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Storage model: a family's shared roster (currently just the "profiles" list)
// lives in one small document, families/{code}. Each individual profile's
// data (stats, coins, pets, ledger, etc.) lives in its OWN document, at
// families/{code}/members/{name} — one Firestore field per data type.
//
// Why per-member documents instead of one big shared blob:
// - A single document has a hard 1MB size ceiling. One blob holding everyone's
//   full history doesn't scale well past a handful of people.
// - Every save used to rewrite the ENTIRE family's data, even to update one
//   person's coin balance — that gets slower (and riskier) the more people
//   share a family code. Per-member documents mean saving Alice's progress
//   only ever touches Alice's document, regardless of how many other people
//   are in the family.

const FAMILY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1
const CACHE_TTL_MS = 5000;
const WRITE_DEBOUNCE_MS = 700;

export function generateFamilyCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += FAMILY_CODE_ALPHABET[Math.floor(Math.random() * FAMILY_CODE_ALPHABET.length)];
  }
  return code;
}

export function normalizeFamilyCode(code) {
  return (code || "").trim().toUpperCase();
}

function sharedRef(familyCode) {
  return doc(db, "families", familyCode);
}
function memberRef(familyCode, name) {
  return doc(db, "families", familyCode, "members", name);
}

export async function familyExists(code) {
  const snap = await getDoc(sharedRef(code));
  return snap.exists();
}

export async function createFamily() {
  let code = generateFamilyCode();
  while (await familyExists(code)) {
    code = generateFamilyCode();
  }
  await setDoc(sharedRef(code), { createdAt: Date.now() });
  return code;
}

// One-time upgrade for families created before this per-member-document
// version: the old format kept everyone's data in one big "data" field on
// the shared document. If that field is still present, split it out into
// the new shared/member documents, then remove it so this only ever runs once.
export async function migrateOldFamilyBlobIfNeeded(familyCode) {
  const ref = sharedRef(familyCode);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const oldBlob = data.data; // the old flat key->value map
  if (!oldBlob || typeof oldBlob !== "object") return; // nothing old to migrate

  const sharedFields = {};
  const memberFields = {}; // name -> { field: value }
  for (const [key, value] of Object.entries(oldBlob)) {
    const parsed = parseKey(key);
    if (parsed.shared) {
      sharedFields[parsed.field] = value;
    } else {
      if (!memberFields[parsed.name]) memberFields[parsed.name] = {};
      memberFields[parsed.name][parsed.field] = value;
    }
  }

  for (const [name, fields] of Object.entries(memberFields)) {
    await setDoc(memberRef(familyCode, name), fields, { merge: true });
  }
  const { data: _drop, ...rest } = data; // keep any other top-level fields, drop the old blob
  await setDoc(ref, { ...rest, ...sharedFields }, { merge: false });
}

// key format used throughout the app is either "profiles" (shared roster) or
// "type:name" (e.g. "balance:Alice") — everything with a colon belongs to
// that named member's own document.
function parseKey(key) {
  const idx = key.indexOf(":");
  if (idx === -1) return { shared: true, field: key };
  return { shared: false, field: key.slice(0, idx), name: key.slice(idx + 1) };
}

// --- Generic per-document cache + debounced batched writes -----------------
const cache = {}; // cacheKey -> { data, fetchedAt }
const pending = {}; // cacheKey -> { changes, deletions, timer }

function getPending(cacheKey) {
  if (!pending[cacheKey]) pending[cacheKey] = { changes: {}, deletions: new Set(), timer: null };
  return pending[cacheKey];
}

async function getFreshDoc(ref, cacheKey) {
  const entry = cache[cacheKey];
  if (entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS) return entry.data;
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  cache[cacheKey] = { data, fetchedAt: Date.now() };
  return data;
}

function mergedView(cacheKey, baseData) {
  const p = pending[cacheKey];
  if (!p) return baseData;
  const merged = { ...baseData, ...p.changes };
  for (const field of p.deletions) delete merged[field];
  return merged;
}

async function flushDoc(ref, cacheKey) {
  const p = pending[cacheKey];
  if (!p || (Object.keys(p.changes).length === 0 && p.deletions.size === 0)) return;
  const changes = p.changes;
  const deletions = p.deletions;
  p.changes = {};
  p.deletions = new Set();
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists() ? snap.data() : {};
    for (const [field, value] of Object.entries(changes)) data[field] = value;
    for (const field of deletions) delete data[field];
    tx.set(ref, data);
  });
  const snap = await getDoc(ref);
  cache[cacheKey] = { data: snap.exists() ? snap.data() : {}, fetchedAt: Date.now() };
}

function scheduleFlush(ref, cacheKey) {
  const p = getPending(cacheKey);
  if (p.timer) clearTimeout(p.timer);
  p.timer = setTimeout(() => {
    p.timer = null;
    flushDoc(ref, cacheKey);
  }, WRITE_DEBOUNCE_MS);
}

// Best-effort save if the tab is closing with unsaved changes.
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    for (const cacheKey of Object.keys(pending)) {
      const p = pending[cacheKey];
      if (p.timer || Object.keys(p.changes).length || p.deletions.size) {
        if (p.timer) clearTimeout(p.timer);
        // Fire-and-forget; browsers don't guarantee this completes before the tab closes.
      }
    }
  });
}

export async function importLocalDataToFamily(familyCode) {
  // Group this device's existing localStorage keys by which document they belong to.
  const sharedChanges = {};
  const memberChanges = {}; // name -> { field: value }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === "xpet_family_code") continue;
    const parsed = parseKey(key);
    if (parsed.shared) {
      sharedChanges[parsed.field] = localStorage.getItem(key);
    } else {
      if (!memberChanges[parsed.name]) memberChanges[parsed.name] = {};
      memberChanges[parsed.name][parsed.field] = localStorage.getItem(key);
    }
  }

  await runTransaction(db, async (tx) => {
    const ref = sharedRef(familyCode);
    const snap = await tx.get(ref);
    const data = snap.exists() ? snap.data() : {};
    for (const [field, value] of Object.entries(sharedChanges)) {
      if (!(field in data)) data[field] = value;
    }
    tx.set(ref, data);
  });

  for (const [name, fields] of Object.entries(memberChanges)) {
    const ref = memberRef(familyCode, name);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists() ? snap.data() : {};
      for (const [field, value] of Object.entries(fields)) {
        if (!(field in data)) data[field] = value;
      }
      tx.set(ref, data);
    });
  }
}

export function createFamilyStorage(familyCode) {
  return {
    async get(key) {
      const parsed = parseKey(key);
      const ref = parsed.shared ? sharedRef(familyCode) : memberRef(familyCode, parsed.name);
      const cacheKey = parsed.shared ? `shared:${familyCode}` : `member:${familyCode}:${parsed.name}`;
      const data = await getFreshDoc(ref, cacheKey);
      const merged = mergedView(cacheKey, data);
      return Object.prototype.hasOwnProperty.call(merged, parsed.field)
        ? { key, value: merged[parsed.field], shared: parsed.shared }
        : null;
    },
    async set(key, value) {
      const parsed = parseKey(key);
      const ref = parsed.shared ? sharedRef(familyCode) : memberRef(familyCode, parsed.name);
      const cacheKey = parsed.shared ? `shared:${familyCode}` : `member:${familyCode}:${parsed.name}`;
      const p = getPending(cacheKey);
      p.deletions.delete(parsed.field);
      p.changes[parsed.field] = value;
      if (cache[cacheKey]) {
        cache[cacheKey] = { data: { ...cache[cacheKey].data, [parsed.field]: value }, fetchedAt: cache[cacheKey].fetchedAt };
      }
      scheduleFlush(ref, cacheKey);
      return { key, value, shared: parsed.shared };
    },
    async delete(key) {
      const parsed = parseKey(key);
      const ref = parsed.shared ? sharedRef(familyCode) : memberRef(familyCode, parsed.name);
      const cacheKey = parsed.shared ? `shared:${familyCode}` : `member:${familyCode}:${parsed.name}`;
      const p = getPending(cacheKey);
      delete p.changes[parsed.field];
      p.deletions.add(parsed.field);
      if (cache[cacheKey]) {
        const nextData = { ...cache[cacheKey].data };
        delete nextData[parsed.field];
        cache[cacheKey] = { data: nextData, fetchedAt: cache[cacheKey].fetchedAt };
      }
      scheduleFlush(ref, cacheKey);
      return { key, deleted: true, shared: parsed.shared };
    },
    async list() {
      // Not used by the app (every lookup already knows the exact key it wants).
      return { keys: [], shared: false };
    },
  };
}
