import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Copy, Share2 } from "lucide-react";
import App from "./App.jsx";
import {
  createFamily,
  familyExists,
  normalizeFamilyCode,
  importLocalDataToFamily,
  createFamilyStorage,
  migrateOldFamilyBlobIfNeeded,
} from "./familyStorage.js";

// Text shared when inviting someone to a family — includes the code AND the
// site link, since the code alone is useless to someone who doesn't already
// have this page open.
function familyInviteMessage(code) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return `Join our xPet family! Use code ${code} at ${url}`;
}

const bg = "#0F1B33";
const panel = "#16223F";
const ink = "#EAF0FB";
const sub = "#93A3C4";
const amber = "#FFB238";

function Screen({ children }) {
  return (
    <div
      style={{
        background: bg, color: ink, minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 20,
        fontFamily: "Inter, system-ui, sans-serif", boxSizing: "border-box",
      }}
    >
      <div style={{ background: panel, borderRadius: 18, padding: 22, width: "100%", maxWidth: 380 }}>
        {children}
      </div>
    </div>
  );
}

const btnPrimary = {
  background: amber, color: "#231400", border: "none", borderRadius: 14,
  padding: "13px 18px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%",
};
const btnGhost = {
  background: "transparent", color: ink, border: "1.5px solid #3A4A6B", borderRadius: 14,
  padding: "12px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
};
const btnGhostSmall = {
  background: "transparent", color: ink, border: "1.5px solid #3A4A6B", borderRadius: 12,
  padding: "10px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer", flex: 1,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit",
};
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12,
  border: "1.5px solid #3A4A6B", background: "#0F1B33", color: ink, fontSize: 18,
  letterSpacing: 3, textAlign: "center", fontWeight: 700, marginBottom: 12,
};

function FamilySetup({ onReady }) {
  const [mode, setMode] = useState("choose"); // "choose" | "createName" | "join" | "created"
  const [adminNameInput, setAdminNameInput] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [newCode, setNewCode] = useState(null);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  useEffect(() => {
    setHasLocalData(localStorage.getItem("profiles") !== null);
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(newCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (e) {
      console.error("copy failed:", e);
    }
  };
  const handleShareCode = async () => {
    try {
      await navigator.share({ title: "xPet family code", text: familyInviteMessage(newCode) });
    } catch (e) {
      // AbortError when the user just closes the share sheet — nothing to do
    }
  };

  const handleCreate = async () => {
    const adminName = adminNameInput.trim();
    if (!adminName) return;
    setBusy(true);
    try {
      const code = await createFamily(adminName);
      setNewCode(code);
      setMode("created");
    } catch (e) {
      console.error(e);
      alert("Couldn't create a family right now. Check your internet connection and try again.");
    }
    setBusy(false);
  };

  const handleJoin = async () => {
    const code = normalizeFamilyCode(joinInput);
    if (code.length < 4) { setJoinError("Enter the family code you were given."); return; }
    setBusy(true);
    setJoinError(null);
    try {
      const exists = await familyExists(code);
      if (!exists) {
        setJoinError("That family code wasn't found. Double-check it with whoever set it up.");
      } else {
        onReady(code);
      }
    } catch (e) {
      console.error(e);
      setJoinError("Couldn't check that code — check your internet connection and try again.");
    }
    setBusy(false);
  };

  const handleImport = async () => {
    setBusy(true);
    try {
      await importLocalDataToFamily(newCode);
      setImportDone(true);
    } catch (e) {
      console.error(e);
      alert("Import failed — check your internet connection and try again.");
    }
    setBusy(false);
  };

  if (mode === "created") {
    return (
      <Screen>
        <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>Family created! 🎉</h1>
        <p style={{ color: sub, fontSize: 14, margin: "0 0 6px" }}>Your family code is:</p>
        <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: 4, color: amber, textAlign: "center", margin: "0 0 6px" }}>
          {newCode}
        </p>
        <p style={{ color: sub, fontSize: 13, margin: "0 0 14px", textAlign: "center" }}>
          Admin: <span style={{ color: ink, fontWeight: 700 }}>{adminNameInput.trim()}</span>
        </p>
        <p style={{ color: sub, fontSize: 13, margin: "0 0 10px" }}>
          Write this down. Enter it on any other device to share progress and the leaderboard.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button style={btnGhostSmall} onClick={handleCopyCode}>
            <Copy size={14} /> {codeCopied ? "Copied!" : "Copy code"}
          </button>
          {canShare && (
            <button style={btnGhostSmall} onClick={handleShareCode}>
              <Share2 size={14} /> Share
            </button>
          )}
        </div>
        <p style={{ color: sub, fontSize: 12, margin: "0 0 18px" }}>
          {codeCopied ? "Code copied to your clipboard." : "Copy copies just the code. Share includes a link to this site."}
        </p>

        {hasLocalData && !importDone && (
          <div style={{ background: "#0F1B33", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <p style={{ fontSize: 13, margin: "0 0 10px", color: sub }}>
              This device already has saved progress. Import it into this family?
            </p>
            <button style={btnPrimary} onClick={handleImport} disabled={busy}>
              {busy ? "Importing…" : "Import existing progress"}
            </button>
          </div>
        )}
        {importDone && (
          <p style={{ color: "#3FB27F", fontSize: 13, marginBottom: 14 }}>✓ Progress imported!</p>
        )}

        <button style={btnGhost} onClick={() => onReady(newCode)} disabled={busy}>
          Continue →
        </button>
      </Screen>
    );
  }

  if (mode === "createName") {
    return (
      <Screen>
        <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>Who's setting this up?</h1>
        <p style={{ color: sub, fontSize: 13, margin: "0 0 14px" }}>
          You'll be shown as this family's admin.
        </p>
        <input
          value={adminNameInput}
          onChange={(e) => setAdminNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Your name"
          style={{ ...inputStyle, textTransform: "none", letterSpacing: 0, fontSize: 16 }}
          maxLength={30}
        />
        <button style={{ ...btnPrimary, marginBottom: 10 }} onClick={handleCreate} disabled={busy || !adminNameInput.trim()}>
          {busy ? "Creating…" : "Create family"}
        </button>
        <button style={btnGhost} onClick={() => setMode("choose")} disabled={busy}>← Back</button>
      </Screen>
    );
  }

  if (mode === "join") {
    return (
      <Screen>
        <h1 style={{ fontSize: 20, margin: "0 0 14px" }}>Join a family</h1>
        <input
          value={joinInput}
          onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
          placeholder="ABC123"
          style={inputStyle}
          maxLength={8}
        />
        {joinError && <p style={{ color: "#F2994A", fontSize: 13, marginBottom: 10 }}>{joinError}</p>}
        <button style={{ ...btnPrimary, marginBottom: 10 }} onClick={handleJoin} disabled={busy}>
          {busy ? "Checking…" : "Join"}
        </button>
        <button style={btnGhost} onClick={() => setMode("choose")} disabled={busy}>← Back</button>
      </Screen>
    );
  }

  return (
    <Screen>
      <h1 style={{ fontSize: 22, margin: "0 0 6px" }}>Welcome to xPet</h1>
      <p style={{ color: sub, fontSize: 14, margin: "0 0 20px" }}>
        Set up a family so progress and the leaderboard follow everyone across devices.
      </p>
      <button style={{ ...btnPrimary, marginBottom: 10 }} onClick={() => setMode("createName")} disabled={busy}>
        ✨ Create a new family
      </button>
      <button style={btnGhost} onClick={() => setMode("join")} disabled={busy}>
        🔑 Join a family with a code
      </button>
    </Screen>
  );
}

function Root() {
  const [code, setCode] = useState(() => localStorage.getItem("xpet_family_code"));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        await migrateOldFamilyBlobIfNeeded(code);
      } catch (e) {
        console.error("family data migration check failed:", e);
      }
      window.storage = createFamilyStorage(code);
      setReady(true);
    })();
  }, [code]);

  if (!code) {
    return (
      <FamilySetup
        onReady={(c) => {
          localStorage.setItem("xpet_family_code", c);
          setCode(c);
        }}
      />
    );
  }
  if (!ready) return null;
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
