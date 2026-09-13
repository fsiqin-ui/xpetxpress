import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, ArrowLeft, Trophy, RotateCcw, Delete, Zap, Sparkles, Lock, Volume2, VolumeX, Flame, Star, Check, X, Copy, Share2 } from "lucide-react";

// Ten levels, each a bit harder than the last
const LEVELS = [
  { level: 1, tables: [2, 3], maxMult: 5, label: "Warm-up" },
  { level: 2, tables: [2, 3, 4], maxMult: 8, label: "Getting going" },
  { level: 3, tables: [2, 3, 4, 5], maxMult: 10, label: "Building speed" },
  { level: 4, tables: [4, 5, 6], maxMult: 10, label: "Steady climb" },
  { level: 5, tables: [5, 6, 7], maxMult: 12, label: "Halfway point" },
  { level: 6, tables: [6, 7, 8], maxMult: 12, label: "Picking up pace" },
  { level: 7, tables: [7, 8, 9], maxMult: 12, label: "Getting tough" },
  { level: 8, tables: [8, 9, 10], maxMult: 12, label: "Advanced" },
  { level: 9, tables: [9, 10, 11, 12], maxMult: 12, label: "Expert" },
  { level: 10, tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], maxMult: 12, label: "Top Dog" },
];
const LEVEL_COLORS = ["#E4572E", "#2E8B57", "#3A7CA5", "#7B4B94", "#E08E45", "#2AA198", "#D45D79", "#B8960B", "#8B5E3C", "#B23A73"];

// Blue/orange instead of green/red for correct/wrong — stays distinguishable across
// the common forms of color blindness (protanopia, deuteranopia, tritanopia).
const FEEDBACK_RIGHT = "#3B82F6";
const FEEDBACK_WRONG = "#F2994A";

const ZODIAC_OPTIONS = [
  { id: "rat", name: "Rat" },
  { id: "ox", name: "Ox" },
  { id: "tiger", name: "Tiger" },
  { id: "rabbit", name: "Rabbit" },
  { id: "dragon", name: "Dragon" },
  { id: "snake", name: "Snake" },
  { id: "horse", name: "Horse" },
  { id: "goat", name: "Goat" },
  { id: "monkey", name: "Monkey" },
  { id: "rooster", name: "Rooster" },
  { id: "dog", name: "Dog" },
  { id: "pig", name: "Pig" },
];
const DEFAULT_AVATAR = "dog";

const ZODIAC_PALETTE = {
  rat: { main: "#A9A6B0", shade: "#8F8B99", cream: "#F1EEF3" },
  ox: { main: "#8B6B4A", shade: "#725637", cream: "#F1E4D4" },
  tiger: { main: "#EB9A3C", shade: "#D5822A", cream: "#FFF3E1" },
  rabbit: { main: "#F6EDE6", shade: "#E8D9CC", cream: "#FFFFFF", pink: "#F6A9BC" },
  dragon: { main: "#6FBF73", shade: "#57A65C", cream: "#EAF7E5", gold: "#F2C94C" },
  snake: { main: "#9BCB4A", shade: "#83B237", cream: "#EFF7DE" },
  horse: { main: "#A5673F", shade: "#8A5230", cream: "#F3E6D8" },
  goat: { main: "#EDE7DA", shade: "#D9D0BC", cream: "#FFFFFF" },
  monkey: { main: "#A9744F", shade: "#8F5E3C", cream: "#F1DFC9" },
  rooster: { main: "#E4573A", shade: "#C8432A", cream: "#FFE7B8", comb: "#D9432E" },
  dog: { main: "#C98A54", shade: "#B07540", cream: "#FFF3E4" },
  pig: { main: "#F4B8C4", shade: "#E29CAA", cream: "#FFE8EC" },
};

let zodiacGradId = 0;

// A shared cute "chibi" face — big head, big sparkly eyes, blush — with each
// zodiac animal's distinguishing ears/horns/snout layered around it. Built to
// match the same illustration formula as the pet mascots (ChibiDog).
function ZodiacAvatar({ id, size = 40 }) {
  const c = ZODIAC_PALETTE[id] || ZODIAC_PALETTE.dog;
  const idRef = useRef(null);
  if (!idRef.current) idRef.current = `z${zodiacGradId++}`;
  const gid = idRef.current;

  const behind = []; // ears/horns/mane, drawn before the head so they peek out from behind it
  const front = []; // patches/snouts/marks, drawn on top of the head

  switch (id) {
    case "rat":
      behind.push(<circle key="el" cx="30" cy="30" r="11" fill={c.main} />, <circle key="er" cx="70" cy="30" r="11" fill={c.main} />);
      front.push(<circle key="eli" cx="30" cy="30" r="5.5" fill={c.cream} />, <circle key="eri" cx="70" cy="30" r="5.5" fill={c.cream} />);
      break;
    case "ox":
      behind.push(
        <path key="hl" d="M 26 32 Q 14 26 16 14 Q 26 18 30 30" fill={c.shade} />,
        <path key="hr" d="M 74 32 Q 86 26 84 14 Q 74 18 70 30" fill={c.shade} />
      );
      front.push(<ellipse key="mz" cx="50" cy="72" rx="16" ry="11" fill={c.cream} />, <ellipse key="nr" cx="50" cy="74" rx="5" ry="3" fill="none" stroke={c.shade} strokeWidth="1.6" />);
      break;
    case "tiger":
      behind.push(<circle key="el" cx="30" cy="28" r="11" fill={c.main} />, <circle key="er" cx="70" cy="28" r="11" fill={c.main} />, <circle key="eli" cx="30" cy="30" r="5" fill={c.shade} />, <circle key="eri" cx="70" cy="30" r="5" fill={c.shade} />);
      front.push(
        <path key="s1" d="M 24 46 Q 32 42 38 46" stroke={c.shade} strokeWidth="2.4" fill="none" strokeLinecap="round" />,
        <path key="s2" d="M 62 46 Q 68 42 76 46" stroke={c.shade} strokeWidth="2.4" fill="none" strokeLinecap="round" />,
        <ellipse key="mz" cx="50" cy="74" rx="15" ry="10" fill={c.cream} />
      );
      break;
    case "rabbit":
      behind.push(
        <ellipse key="el" cx="36" cy="10" rx="8" ry="24" fill={c.main} transform="rotate(-8 36 10)" />,
        <ellipse key="er" cx="64" cy="10" rx="8" ry="24" fill={c.main} transform="rotate(8 64 10)" />,
        <ellipse key="eli" cx="36" cy="10" rx="4" ry="18" fill={c.pink} transform="rotate(-8 36 10)" />,
        <ellipse key="eri" cx="64" cy="10" rx="4" ry="18" fill={c.pink} transform="rotate(8 64 10)" />
      );
      front.push(<ellipse key="mz" cx="50" cy="73" rx="13" ry="9" fill="#fff" />);
      break;
    case "dragon":
      behind.push(
        <path key="hl" d="M 32 30 Q 26 14 36 12 Q 38 22 36 32" fill={c.gold} />,
        <path key="hr" d="M 68 30 Q 74 14 64 12 Q 62 22 64 32" fill={c.gold} />
      );
      front.push(
        <ellipse key="mz" cx="50" cy="73" rx="14" ry="9" fill={c.cream} />,
        <path key="wl" d="M 30 76 Q 22 78 20 84" stroke={c.gold} strokeWidth="2" fill="none" strokeLinecap="round" />,
        <path key="wr" d="M 70 76 Q 78 78 80 84" stroke={c.gold} strokeWidth="2" fill="none" strokeLinecap="round" />
      );
      break;
    case "snake":
      front.push(
        <ellipse key="mz" cx="50" cy="76" rx="10" ry="6" fill={c.cream} />,
        <path key="tongue" d="M 50 82 L 50 90 M 50 90 L 46 94 M 50 90 L 54 94" stroke="#D9432E" strokeWidth="2" fill="none" strokeLinecap="round" />
      );
      break;
    case "horse":
      behind.push(
        <path key="el" d="M 30 28 L 22 8 L 40 20 Z" fill={c.main} />,
        <path key="er" d="M 70 28 L 78 8 L 60 20 Z" fill={c.main} />,
        <path key="mane" d="M 42 8 Q 50 2 58 8 L 54 16 Q 50 12 46 16 Z" fill={c.shade} />
      );
      front.push(<ellipse key="mz" cx="50" cy="80" rx="13" ry="14" fill={c.cream} />);
      break;
    case "goat":
      behind.push(
        <path key="hl" d="M 34 26 Q 24 16 28 6 Q 38 12 38 24" fill={c.shade} />,
        <path key="hr" d="M 66 26 Q 76 16 72 6 Q 62 12 62 24" fill={c.shade} />,
        <ellipse key="el" cx="24" cy="46" rx="7" ry="12" fill={c.main} transform="rotate(-15 24 46)" />,
        <ellipse key="er" cx="76" cy="46" rx="7" ry="12" fill={c.main} transform="rotate(15 76 46)" />
      );
      front.push(<path key="beard" d="M 44 86 Q 50 96 56 86 Q 50 90 44 86 Z" fill={c.shade} />);
      break;
    case "monkey":
      behind.push(<circle key="el" cx="24" cy="48" r="13" fill={c.main} />, <circle key="er" cx="76" cy="48" r="13" fill={c.main} />, <circle key="eli" cx="24" cy="48" r="7" fill={c.cream} />, <circle key="eri" cx="76" cy="48" r="7" fill={c.cream} />);
      front.push(<ellipse key="mz" cx="50" cy="72" rx="19" ry="15" fill={c.cream} />);
      break;
    case "rooster":
      behind.push(
        <path key="comb" d="M 38 10 Q 40 2 46 8 Q 50 0 54 8 Q 60 2 62 10 Q 56 16 50 14 Q 44 16 38 10 Z" fill={c.comb} />
      );
      front.push(
        <path key="beak" d="M 43 70 L 57 70 L 50 80 Z" fill="#F2A93B" />,
        <ellipse key="wattle" cx="50" cy="84" rx="5" ry="7" fill={c.comb} />
      );
      break;
    case "dog":
      behind.push(
        <ellipse key="el" cx="26" cy="32" rx="10" ry="20" fill={c.shade} transform="rotate(-18 26 32)" />,
        <ellipse key="er" cx="74" cy="32" rx="10" ry="20" fill={c.shade} transform="rotate(18 74 32)" />
      );
      front.push(<ellipse key="mz" cx="50" cy="75" rx="15" ry="11" fill={c.cream} />);
      break;
    case "pig":
      behind.push(
        <path key="el" d="M 28 24 L 20 8 L 38 18 Z" fill={c.main} />,
        <path key="er" d="M 72 24 L 80 8 L 62 18 Z" fill={c.main} />
      );
      front.push(
        <ellipse key="snout" cx="50" cy="76" rx="14" ry="10" fill={c.shade} />,
        <ellipse key="n1" cx="45" cy="76" rx="2.4" ry="3.2" fill="#3A2E22" />,
        <ellipse key="n2" cx="55" cy="76" rx="2.4" ry="3.2" fill="#3A2E22" />
      );
      break;
    default:
      break;
  }

  const showNoseMouth = id !== "snake" && id !== "pig" && id !== "rooster";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${gid}-head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="45%" stopColor={c.main} />
          <stop offset="100%" stopColor={c.shade} />
        </linearGradient>
        <radialGradient id={`${gid}-sheen`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {behind}
      <circle cx="50" cy="55" r="32" fill={`url(#${gid}-head)`} />
      <circle cx="50" cy="55" r="32" fill={`url(#${gid}-sheen)`} />
      {front}
      {/* eyes */}
      <circle cx="38" cy="54" r="6.5" fill="#3A2E22" />
      <circle cx="62" cy="54" r="6.5" fill="#3A2E22" />
      <circle cx="35.5" cy="51.5" r="2" fill="#fff" />
      <circle cx="59.5" cy="51.5" r="2" fill="#fff" />
      {/* blush */}
      <ellipse cx="28" cy="64" rx="6" ry="3.6" fill="#FFAFAE" opacity="0.6" />
      <ellipse cx="72" cy="64" rx="6" ry="3.6" fill="#FFAFAE" opacity="0.6" />
      {showNoseMouth && (
        <>
          <ellipse cx="50" cy="66" rx="3.4" ry="2.6" fill="#3A2E22" />
          <path d="M 44 71 Q 50 76 56 71" stroke="#3A2E22" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
const QUESTIONS_PER_LEVEL = 8;

function levelDescription(cfg) {
  const tables = cfg.tables;
  const tablesText = tables.length > 1
    ? tables.slice(0, -1).join(", ") + " and " + tables[tables.length - 1]
    : String(tables[0]);
  const plural = tables.length > 1 ? "s" : "";
  return `Practice the ${tablesText} times table${plural}, multiplying up to ${cfg.maxMult}. ${QUESTIONS_PER_LEVEL} questions, fastest time wins.`;
}

// Cost in points to unlock a level, deducted from the profile's spendable balance —
// same 3x-attempts scaling as before, just framed as a purchase price now.
function levelUnlockCost(n) {
  return (n - 1) * 30;
}

const MAX_PROFILES = 20;

function generateQuestions(cfg) {
  return Array.from({ length: QUESTIONS_PER_LEVEL }, () => {
    const table = cfg.tables[Math.floor(Math.random() * cfg.tables.length)];
    const mult = Math.floor(Math.random() * cfg.maxMult) + 1;
    return { table, mult, answer: table * mult };
  });
}

function fmtTime(ms) {
  if (ms === undefined || ms === null) return "--";
  return (ms / 1000).toFixed(1) + "s";
}

function fmtLedgerDate(ts) {
  const d = new Date(ts + SGT_OFFSET_MS);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]}, ${h}:${m} ${ampm}`;
}

// Points are based on difficulty (level), accuracy, and speed — not on the topic itself,
// so adding new topics later (subtraction, division, ...) just needs a level/difficulty number.
function calcPoints({ level, mistakes, timeMs, questionCount }) {
  const basePoints = level * 10;
  const accuracyMult = mistakes === 0 ? 1 : mistakes <= 2 ? 0.8 : 0.6;
  const expectedMs = questionCount * (3000 + level * 300);
  const speedMult = Math.max(0.7, Math.min(1.3, expectedMs / timeMs));
  const points = Math.round(basePoints * accuracyMult * speedMult);
  return { points, accuracyMult, speedMult };
}

// Kid-friendly badges explaining why points went up or down — not the raw formula
function levelBadges({ mistakes, speedMult }) {
  const badges = [];
  if (mistakes === 0) badges.push({ icon: "🎯", text: "No mistakes", tone: "good" });
  else if (mistakes <= 2) badges.push({ icon: "⚠️", text: `${mistakes} retr${mistakes === 1 ? "y" : "ies"}`, tone: "warn" });
  else badges.push({ icon: "🔁", text: `${mistakes} retries`, tone: "warn" });

  if (speedMult >= 1.15) badges.push({ icon: "⚡", text: "Speed bonus", tone: "good" });
  else if (speedMult <= 0.85) badges.push({ icon: "🐢", text: "Took your time", tone: "warn" });

  return badges;
}

function sumPoints(events, sinceMs) {
  return (events || [])
    .filter((e) => !sinceMs || e.ts >= sinceMs)
    .reduce((sum, e) => sum + e.points, 0);
}

// Short pre-baked audio clips (base64 WAV) played via <audio> elements.
// This is more broadly compatible than the Web Audio API inside sandboxed/embedded views,
// where AudioContext is sometimes blocked or silently muted.
const SOUND_DATA = {
  correct: "data:audio/wav;base64,UklGRuQNAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YcANAAAAAHIAYAHXAQcB7P51/CT7K/yb/x0EdQeZB98Dkf2C99P0VPds/iAHUA2qDWsH/PwP84Hu+/F2/HEJ3xL4E6ALMv0q70DoL+y8+QcLERhxGnUQM/7g6yTi/+VF9toL1BwAIdwVAAA/6T/cft8W8uULGCGVJ8oblwJR56XWvNg67SQLPiS1LKggnQX/52XVWdZs6mQIhCLMLIQiZAhs6lnWZdX/550FqCC1LD4kJAvt7HjXnNSs5dACqh5yLNMl1w2D77/Y/9Ny4wAAjhwBLEEnfRAp8i3ajtNW4TD9VBpkK4goExPc9MLbS9NY32P6ARibKqcplBWc93zdNNN83Zz3lBWnKZsqARhj+ljfS9PC29z0ExOIKGQrVBow/VbhjtMt2inyfRBBJwEsjhwAAHLj/9O/2IPv1w3TJXIsqh7QAqzlnNR41+3sJAs+JLUsqCCdBf/nZdVZ1mzqZAiEIswshCJkCGzqWdZl1f/nnQWoILUsPiQkC+3seNec1Kzl0AKqHnIs0yXXDYPvv9j/03LjAACOHAEsQSd9ECnyLdqO01bhMP1UGmQriCgTE9z0wttL01jfY/oBGJsqpymUFZz3fN0003zdnPeUFacpmyoBGGP6WN9L08Lb3PQTE4goZCtUGjD9VuGO0y3aKfJ9EEEnASyOHAAAcuP/07/Yg+/XDdMlciyqHtACrOWc1HjX7ewkCz4ktSyoIJ0F/+dl1VnWbOpkCIQizCyEImQIbOpZ1mXV/+edBaggtSw+JCQL7ex415zUrOXQAqoecizTJdcNg++/2P/TcuMAAI4cASxBJ30QKfIt2o7TVuEw/VQaZCuIKBMT3PTC20vTWN9j+gEYmyqnKZQVnPd83TTTfN2c95QVpymbKgEYY/pY30vTwtvc9BMTiChkK1QaMP1W4Y7TLdop8n0QQScBLI4cAABy4//Tv9iD79cN0yVyLKoe0AKs5ZzUeNft7CQLPiS1LKggnQX/52XVWdZs6mQIhCLMLIQiZAhs6lnWZdX/550FqCC1LD4kJAvt7HjXnNSs5dACqh5yLNMl1w2D77/Y/9Ny4wAAjhwBLEEnfRAp8i3ajtNW4TD9VBpkK4goExPc9MLbS9NY32P6ARibKqcplBWc93zdNNN83Zz3lBWnKZsqARhj+ljfS9PC29z0ExOIKGQrVBow/VbhjtMt2inyfRBBJwEsjhwAAHLj/9O/2IPv1w3TJXIsqh7QAqzlnNR41+3sJAs+JLUsqCCdBf/nZdVZ1mzqZAiEIswshCJkCGzqWdZl1f/nnQWoILUsPiQkC+3seNec1Kzl0AKqHnIs0yXXDYPvv9j/03LjAACOHAEsQSd9ECnyLdqO01bhMP1UGmQriCgTE9z0wttL01jfY/oBGJsqpymUFZz3fN0003zdnPeUFacpmyoBGGP6WN9L08Lb3PQTE4goZCtUGjD9VuGO0y3aKfJ9EEEnASyOHAAAcuP/07/Yg+/XDdMlciyqHtACrOWc1HjX7ewkCz4ktSyoIJ0F/+dl1VnWbOpkCIQizCyEImQIbOpZ1mXV/+edBaggtSw+JCQL7ex415zUrOXQAqoecizTJdcNg++/2P/TcuMAAI4cASxBJ30QKfIt2o7TVuEw/VQaZCuIKBMT3PTC20vTWN9j+gEYmyqnKZQVnPd83TTTfN2c95QVpymbKgEYY/pY30vTwtvc9BMTiChkK1QaMP1W4Y7TLdop8n0QQScBLI4cAABy4//Tv9iD79cN0yXAK7UdrgJR5wDYRNsE778JJR+5JQsbjwTg7LfeHeDR7yoGzxh/H7sXowXX8VHlYOVg8VUD4RImGdET6wUr9rzr/Oqp80YBag3AEl0PaAXR+eXx4PCi9gAAeghgDG0KHwTC/Lr3+fZA+oX/HQQaBhEFFgL1/iz9Nf15/tT/YAAAAJoAOgETAKb93/yz/wUEGAWuAGj64vjL/hMHMAniAY73tPRL/bUJcQ2tAyb1ZPA3++ALzBEJBjrzA+yU+IoNLxbwCNXxoedr9agOihpaDADxUePC8TMPzB4/EMLwIt+l7SMP5CKSFCHxJtse6XMOwSZJGSHybNc65CENUipWHsbzs9QH4KkK3CoWIev2pNXY3X4HzikuIxz6ztbY20kEiCgXJVT9L9gH2g4BDSfOJpAAxdlp2NL9XSVSKMsDjtsA15n6eyOgKQIHh93O1Wb3aiG2Ki8Kr9/U1ED0LR+TK04NAuIU1CnxxRw2LFwQfeSO0yXuNxqeLFQTHedE0zrrhhfKLDIW3uk202rothS7LPIYvexk07rlyhFvLJEbte/N0y3jxg7pKwsew/Jx1MfgrwsnK10g4/VP1YreiAgsKoQiEPln1nrcVQX5KH0kR/y215naHAKOJ0Umgv872erY4P7vJdonvgLz2nDXpfseJDkp9gXd3CzWcPgcImIqJwn23h/VRfXsH1IrSww84UzUKfKSHQgsXw+q47TTHu8RG4MsXxI+5lbTK+xrGMIsRRX16DTTUumkFcYsEBjK607Tl+bBEo4suhq67qTT/uPEDxssQR3C8TXUiuGzDG0roB/c9ADVQN+QCYQq1SEG+AXWId1hBmMp3SM6+0LXMNspAwootiV0/rbYcdnu/3wmWyewAV7a5dez/LskzCjqBDjcj9Z7+ckiByoeCELecdVM9qggCitGC3ngi9Qr81se0ytgDtvi39Ma8OYbYSxnEWPlbtMe7UsZtCxWFA/oOdM86o8WzCwqF9rqP9N357UTpyzfGcLtgdPT5MAQRyxyHMPw/9NT4rUNrCvfHtfzuNT635gK1ioiIfz2qtXN3WwHxyk5Iy761dbN2zcEgSghJWb9N9j92fwABCfXJqIAztlh2MD9UyVaKN0DmNv51of6cCOnKRMHk93I1VX3XiG8KkAKvN/P1C70IB+XK18NEOIQ1Bjxtxw5LG0Qi+SM0xXuKRqgLGQTLOdD0yrrdxfLLEEW7uk201vophS6LAEZzexl06zluhFtLJ8bxu/Q0x/jtQ7lKxke1PJ11LrgngsiK2og9PVV1X7edggmKpAiIvlt1m/cQwXxKIckWfy+14/aCgKGJ04mlP9E2eLYzv7mJeIn0AL92mjXk/sTJEApCAbo3CXWXvgQImcqOAkD3xrVNPXgH1YrXAxJ4UjUF/KFHQsscA+447HTDu8CG4UsbxJN5lXTG+xcGMMsVRUE6TTTQumUFcYsHxja60/TiOaxEowsyRrL7qbT8OO0DxgsTh3T8TnUfeGiDGgrrR/u9AbVM99/CX4q4SEY+AzWFd1PBlwp6CNM+0rXJtsYAwIovyWG/r/YaNnc/3MmZCfCAWja3deh/LEk1Cj8BEPciNZp+b0iDSovCE7ea9U79psgDytYC4bghtQZ804e1itxDuji3NMJ8NgbYyx3EXHlbNMO7T0ZtSxmFB7oONMs6oAWyyw6F+rqQNNo56UTpizuGdPthNPE5LAQRCyAHNTwA9RF4qQNqCvsHunzvNTu34YK0SouIQ73sNXB3VoHwSlEIz/63NbC2yUEeSgrJXj9P9j02eoA+ybgJrQA19lY2K79SSViKO8Do9vy1nX6ZSOtKSUHnt3C1UP3UiHBKlIKyN/L1B30Ex+cK3ANHeIN1AfxqRw8LH0QmuSK0wTuGhqhLHQTO+dD0xrraBfLLFEW/ek300zolhS5LBAZ3exn053lqRFrLK0b1+/T0xLjpA7hKyYe5vJ51K3gjAsdK3YgBvZa1XLeZAggKpsiNPl01mTcMgXqKJIka/zG14Xa+AF+J1cmpv9N2dnYvP7cJeon4gIH22HXgvsIJEcpGgb03B/WTfgEIm0qSgkP3xXVIvXTH1srbgxW4UTUBvJ3HQ4sgQ/G467T/e70GocsfxJc5lPTCuxMGMQsZRUU6TTTM+mFFcUsLhjq61HTeeagEoss1xrc7qnT4uOjDxUsXB3k8T3UcOGQDGQruh//9AvVJ99tCXkq7SEp+BLWCt0+BlUp8yNe+1LXHNsGA/onySWY/sfYX9nK/2ombCfUAXLa1deP/KYk2ygOBU7cgtZX+bIiFCpBCFreZdUp9o8gFCtpC5PggtQI80Ee2iuCDvbi2dP478obZiyIEYDlatP+7C4Ztix2FC3oONMd6nAWyyxJF/rqQdNZ55UTpCz9GePthtO25J8QQiyOHOXwBtQ44pMNpCv5HvrzwdTh33UKzCo6ISD3ttW23UkHuilPI1H649a42xMEcSg1JYr9SNjq2dgA8ibpJsYA4dlQ2Jz9PyVqKAEErdvq1mP6WiO0KTcHqt281TH3RiHGKmMK1d/G1Az0Bh+gK4INKuIJ1PbwnBw/LI4QqOSI0/TtCxqjLIQTSudC0wrrWBfLLGEWDeo30zzohhS4LB8Z7exp047lmRFoLLwb5+/W0wTjkw7eKzMe9/J+1KDgewsYK4MgGPZg1WbeUwgaKqYiRvl71lncIAXjKJwkffzN13va5gF1J2EmuP9W2dDYqv7TJfIn9AIS21nXcPv+I04pLAb/3BjWO/j5IXMqXAkb3xDVPfXIHlcptwvH41rYfvO8Gd8lIw2s6PzbZPIDFRki7A027ePf7PGqEBQeFQ5b8QHkEvK9DOEZog0N9UToz/JICZIVmwxD+JvsHvRTBjYRBwv0+vbw9fXnA+AM7wgZ/UT1S/gMAp8IXgar/nT5FPvFAIQEXwOl/3b9Rf4XAJ8A",
  wrong: "data:audio/wav;base64,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",
  levelComplete: "data:audio/wav;base64,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",
  newRecord: "data:audio/wav;base64,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",
};
function playClip(key, volume = 0.5) {
  try {
    const audio = new Audio(SOUND_DATA[key]);
    audio.volume = volume;
    const p = audio.play();
    if (p && p.catch) p.catch((e) => console.error("sound blocked:", e));
  } catch (e) {
    console.error("sound failed:", e);
  }
}
const sounds = {
  correct: () => playClip("correct", 0.5),
  wrong: () => playClip("wrong", 0.4),
  levelComplete: () => playClip("levelComplete", 0.5),
  newRecord: () => playClip("newRecord", 0.55),
};

// Singapore time is fixed at UTC+8, no daylight saving, so this is a constant offset.
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

function sgtShiftedDate(ms) {
  return new Date(ms + SGT_OFFSET_MS); // use getUTC* methods on this to read SGT wall-clock fields
}

function startOfSgtDay(ms) {
  const d = sgtShiftedDate(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - SGT_OFFSET_MS;
}

function startOfSgtWeek(ms) {
  const d = sgtShiftedDate(ms);
  const day = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diffToMonday) - SGT_OFFSET_MS;
}

function startOfSgtMonth(ms) {
  const d = sgtShiftedDate(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) - SGT_OFFSET_MS;
}

function useStorage() {
  const [ready, setReady] = useState(false);
  const get = useCallback(async (key, fallback) => {
    try {
      const r = await window.storage.get(key, false);
      return r ? JSON.parse(r.value) : fallback;
    } catch (e) {
      console.error("storage get failed for", key, e);
      return fallback;
    }
  }, []);
  const set = useCallback(async (key, value) => {
    try {
      await window.storage.set(key, JSON.stringify(value), false);
    } catch (e) {
      console.error("storage set failed", e);
    }
  }, []);
  useEffect(() => setReady(true), []);
  return { get, set, ready };
}

// ======================= xPet: dog-care mini-game =======================
// Two decay speeds:
// - IDLE: applies to time away from the app (calculated when a profile is
//   reopened) — gentle, so a pet is fine to leave for a day.
// - ACTIVE: applies while the app is actually open and ticking live — much
//   faster, so a pet's needs are something to actively manage *during* a
//   session, not just an abstract background timer. Roughly, hunger/happiness
//   could each need a top-up within a single longer play session.
const PET_DECAY_IDLE = { hunger: 0.15, energy: 0.10, happiness: 0.15, cleanliness: 0.08 }; // points/min, app closed
const PET_DECAY_ACTIVE = { hunger: 1.2, energy: 0.8, happiness: 1.2, cleanliness: 0.6 }; // points/min, app open
const PET_FLOOR = 25;
const PET_MAX = 100;
const PET_MESS_THRESHOLD = 40;
const PET_SICK_CHANCE_PER_TICK = 0.02;
const PET_VET_COST = 25;
const PET_RENAME_COST = 75; // deliberately pricier than routine care — a "save up for it" cosmetic choice
const MAX_PETS = 2;

const PET_BREEDS = {
  corgi: {
    name: "Corgi", size: "Small", cost: 25,
    fur: "#E8963C", furShade: "#D67F27", cream: "#FFF7E9", ear: "fox",
    blurb: "Short legs, big personality — a fan favorite.",
  },
  beagle: {
    name: "Beagle", size: "Medium", cost: 35,
    fur: "#F6EEDD", furShade: "#E8DAC0", cream: "#FFFCF6", patch: "#A9662E", saddle: "#3A362F", ear: "long",
    blurb: "Classic tricolor good boy, friendly with everyone.",
  },
  labrador: {
    name: "Labrador", size: "Large", cost: 55,
    fur: "#F0C878", furShade: "#DCAE58", cream: "#FCEFD1", ear: "round",
    blurb: "Big, loyal, and always hungry.",
  },
  chihuahua: { name: "Chihuahua", size: "Tiny", cost: 15, comingSoon: true },
  greatdane: { name: "Great Dane", size: "Giant", cost: 90, comingSoon: true },
};
const AVAILABLE_PET_BREEDS = ["corgi", "beagle", "labrador"];

const PET_FOOD_ITEMS = [
  { id: "kibble", name: "Kibble", emoji: "🥣", cost: 8, restore: 25 },
  { id: "meal", name: "Gourmet meal", emoji: "🍗", cost: 20, restore: 60 },
];
const PET_TOY_ITEMS = [
  { id: "ball", name: "Ball", emoji: "🎾", cost: 6, restore: 20 },
  { id: "plush", name: "Plush toy", emoji: "🧸", cost: 18, restore: 50 },
];

function petClampStat(v) {
  return Math.max(PET_FLOOR, Math.min(PET_MAX, v));
}
function applyPetDecayWithRates(pet, now, rates) {
  if (!pet) return pet;
  const elapsedMin = Math.max(0, (now - pet.lastUpdate) / 60000);
  return {
    ...pet,
    hunger: petClampStat(pet.hunger - rates.hunger * elapsedMin),
    energy: petClampStat(pet.energy - rates.energy * elapsedMin),
    happiness: petClampStat(pet.happiness - rates.happiness * elapsedMin),
    cleanliness: petClampStat((pet.cleanliness ?? PET_MAX) - rates.cleanliness * elapsedMin),
    lastUpdate: now,
  };
}
// Used when a profile loads — covers however long the app was closed, at the gentle idle rate.
function applyPetDecay(pet, now) {
  return applyPetDecayWithRates(pet, now, PET_DECAY_IDLE);
}
// Used by the live in-app tick while a session is active, at the faster active rate.
function applyActivePetDecay(pet, now) {
  return applyPetDecayWithRates(pet, now, PET_DECAY_ACTIVE);
}
function tickPetSickness(pet, now) {
  const next = applyActivePetDecay(pet, now);
  if (!next.sick && (next.hunger <= PET_FLOOR || next.cleanliness <= PET_FLOOR) && Math.random() < PET_SICK_CHANCE_PER_TICK) {
    next.sick = true;
  }
  return next;
}
function petMoodState(pet) {
  if (pet.sick) return "sick";
  if (pet.hunger <= PET_FLOOR + 5) return "hungry";
  if (pet.energy <= PET_FLOOR + 5) return "tired";
  if (pet.happiness <= PET_FLOOR + 5) return "bored";
  const avg = (pet.hunger + pet.energy + pet.happiness) / 3;
  return avg > 80 ? "happy" : "okay";
}
// Average of hunger/energy/happiness/cleanliness across every pet the profile
// has, shown as a quick-glance badge on the main menu without opening xPet.
function petsAverageStatus(pets) {
  if (!pets || pets.length === 0) return null;
  let total = 0, count = 0;
  for (const p of pets) {
    total += p.hunger + p.energy + p.happiness + p.cleanliness;
    count += 4;
    if (p.sick) total -= 20; // being sick pulls the badge down further, even if stats look okay
  }
  return Math.round(Math.max(0, Math.min(100, total / count)));
}
function petStatusColor(pct) {
  if (pct >= 70) return "#3B82F6"; // good — same blue used for "correct" elsewhere
  if (pct >= 40) return "#FFB238"; // okay — amber
  return "#F2994A"; // needs attention — same orange used for "wrong" elsewhere
}
function fmtPetDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
function petAgeText(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return "Adopted today";
  if (days === 1) return "1 day with you";
  if (days < 14) return `${days} days with you`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} with you`;
}
function mixColor(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}
function petDirtLevel(cleanliness) {
  return 1 - (cleanliness - PET_FLOOR) / (PET_MAX - PET_FLOOR);
}
const PET_DIRT_SPOTS = [
  { top: "8%", left: "12%", size: 26 }, { top: "22%", left: "78%", size: 34 },
  { top: "42%", left: "6%", size: 20 }, { top: "58%", left: "88%", size: 22 },
  { top: "70%", left: "22%", size: 30 }, { top: "85%", left: "60%", size: 24 },
  { top: "15%", left: "48%", size: 18 }, { top: "92%", left: "10%", size: 20 },
];
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function randomizePetFur(baseHex) {
  const [h, s, l] = hexToHsl(baseHex);
  const nh = (h + (Math.random() * 60 - 30) + 360) % 360;
  const ns = Math.min(85, Math.max(28, s + (Math.random() * 24 - 12)));
  const nl = Math.min(78, Math.max(32, l + (Math.random() * 18 - 9)));
  const fur = hslToHex(nh, ns, nl);
  const furShade = hslToHex(nh, ns, Math.max(18, nl - 15));
  return { fur, furShade };
}

let petGradId = 0;

function ChibiDog({ breed, fur, furShade, mood, action }) {
  const cfg = PET_BREEDS[breed];
  const furColor = fur || cfg.fur;
  const furShadeColor = furShade || cfg.furShade;
  const idRef = useRef(null);
  if (!idRef.current) idRef.current = `pg${petGradId++}`;
  const gid = idRef.current;

  const eyesClosed = action === "sleeping" || mood === "tired";
  const panting = mood === "happy" && !action;
  const sick = mood === "sick" && !action;
  const bob = action === "sleeping" ? "chibiSleepBob 2.4s ease-in-out infinite"
    : action ? "chibiActionBob 0.45s ease-in-out infinite"
    : sick ? "chibiSickWobble 1.8s ease-in-out infinite"
    : "chibiIdleBob 2.6s ease-in-out infinite";

  const mouthPath = () => {
    if (sick) return <path d="M 90 134 Q 100 130 110 134" stroke="#5B4632" strokeWidth="3" fill="none" strokeLinecap="round" />;
    if (eyesClosed && !panting) return <path d="M 88 132 Q 100 138 112 132" stroke="#5B4632" strokeWidth="3" fill="none" strokeLinecap="round" />;
    if (mood === "hungry" && !action) return <ellipse cx="100" cy="133" rx="7" ry="8" fill="#5B4632" />;
    if (mood === "bored" && !action) return <path d="M 92 133 Q 100 136 108 133" stroke="#5B4632" strokeWidth="3" fill="none" strokeLinecap="round" />;
    return <path d="M 84 128 Q 100 144 116 128" stroke="#5B4632" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg viewBox="0 0 200 200" width="150" height="150" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${gid}-fur`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="45%" stopColor={furColor} />
          <stop offset="100%" stopColor={furShadeColor} />
        </linearGradient>
        <radialGradient id={`${gid}-sheen`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g style={{ animation: bob, transformOrigin: "100px 175px" }}>
        <ellipse cx="100" cy="182" rx="46" ry="7" fill="rgba(0,0,0,0.13)" />
        <path d="M 122 150 Q 150 145 168 118 Q 172 138 150 152 Q 136 160 118 160 Z" fill={`url(#${gid}-fur)`}
          style={{ animation: action === "playing" ? "chibiTailWag 0.22s ease-in-out infinite" : "none", transformOrigin: "124px 152px" }} />
        <ellipse cx="100" cy="162" rx="38" ry="26" fill={`url(#${gid}-fur)`} />
        <ellipse cx="78" cy="182" rx="11" ry="8" fill={cfg.cream || furColor} />
        <ellipse cx="122" cy="182" rx="11" ry="8" fill={cfg.cream || furColor} />
        {cfg.ear === "long" && (
          <>
            <path d="M 48 78 Q 22 110 34 150 Q 52 145 56 110 Z" fill={cfg.patch || furShadeColor} />
            <path d="M 152 78 Q 178 110 166 150 Q 148 145 144 110 Z" fill={cfg.patch || furShadeColor} />
          </>
        )}
        {cfg.ear === "round" && (
          <>
            <ellipse cx="46" cy="92" rx="17" ry="26" fill={furShadeColor} transform="rotate(-18 46 92)" />
            <ellipse cx="154" cy="92" rx="17" ry="26" fill={furShadeColor} transform="rotate(18 154 92)" />
          </>
        )}
        {cfg.ear === "fox" && (
          <>
            <path d="M 40 82 Q 34 42 58 58 Q 60 82 54 92 Z" fill={furColor} />
            <path d="M 160 82 Q 166 42 142 58 Q 140 82 146 92 Z" fill={furColor} />
            <path d="M 45 78 Q 42 52 56 62 Q 57 78 53 84 Z" fill={cfg.cream} />
            <path d="M 155 78 Q 158 52 144 62 Q 143 78 147 84 Z" fill={cfg.cream} />
          </>
        )}
        <circle cx="100" cy="100" r="58" fill={`url(#${gid}-fur)`} />
        <circle cx="100" cy="100" r="58" fill={`url(#${gid}-sheen)`} />
        {sick && <circle cx="100" cy="100" r="58" fill="#8FBF7A" opacity="0.28" />}
        {cfg.saddle && <path d="M 55 62 Q 100 44 145 62 Q 140 92 100 96 Q 60 92 55 62 Z" fill={cfg.saddle} />}
        <ellipse cx="100" cy="122" rx="40" ry="34" fill={cfg.cream || "#FFF7E9"} />
        {cfg.patch && (
          <>
            <ellipse cx="72" cy="98" rx="16" ry="19" fill={cfg.patch} />
            <ellipse cx="128" cy="98" rx="16" ry="19" fill={cfg.patch} />
          </>
        )}
        <ellipse cx="62" cy="118" rx="10" ry="6" fill={sick ? "#BFD9A8" : "#FFAFAE"} opacity="0.6" />
        <ellipse cx="138" cy="118" rx="10" ry="6" fill={sick ? "#BFD9A8" : "#FFAFAE"} opacity="0.6" />
        {sick ? (
          <>
            <path d="M 68 94 L 82 106 M 82 94 L 68 106" stroke="#3A2E22" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M 118 94 L 132 106 M 132 94 L 118 106" stroke="#3A2E22" strokeWidth="3.4" strokeLinecap="round" />
          </>
        ) : eyesClosed ? (
          <>
            <path d="M 66 98 Q 75 106 84 98" stroke="#3A2E22" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 116 98 Q 125 106 134 98" stroke="#3A2E22" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="75" cy="100" r="11" fill="#3A2E22" />
            <circle cx="125" cy="100" r="11" fill="#3A2E22" />
            <circle cx="71.5" cy="96" r="3.4" fill="#fff" />
            <circle cx="121.5" cy="96" r="3.4" fill="#fff" />
            <circle cx="78" cy="104" r="1.6" fill="#fff" opacity="0.8" />
            <circle cx="128" cy="104" r="1.6" fill="#fff" opacity="0.8" />
          </>
        )}
        <ellipse cx="100" cy="118" rx="8" ry="6.5" fill="#3A2E22" />
        <circle cx="97.5" cy="116" r="1.6" fill="#fff" opacity="0.7" />
        {mouthPath()}
        {panting && (
          <ellipse cx="100" cy="140" rx="7" ry="13" fill="#F28FA0"
            style={{ animation: "chibiTonguePant 0.55s ease-in-out infinite", transformOrigin: "100px 130px" }} />
        )}
        {action === "sleeping" && <text x="132" y="52" fontSize="22" style={{ animation: "chibiZzz 2s ease-in-out infinite" }}>💤</text>}
        {sick && !action && <text x="128" y="56" fontSize="20" style={{ animation: "chibiZzz 2.2s ease-in-out infinite" }}>🤒</text>}
      </g>
    </svg>
  );
}

// A real colorable paw icon — the 🐾 emoji renders in a fixed built-in color
// on every platform and ignores CSS/theme colors, which looked wrong next to
// the amber accent used everywhere else.
function PawIcon({ size = 22, color = "#FFB238" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <ellipse cx="12" cy="16.5" rx="6" ry="5" fill={color} />
      <circle cx="4.8" cy="9.2" r="2.5" fill={color} />
      <circle cx="10.3" cy="5.3" r="2.6" fill={color} />
      <circle cx="15.9" cy="5.5" r="2.6" fill={color} />
      <circle cx="19.4" cy="9.6" r="2.4" fill={color} />
    </svg>
  );
}

// The official xPet xPress logo — same artwork as the standalone brand asset,
// used on the welcome screens where full app branding (not a per-player avatar) fits.
function Logo({ width = 320 }) {
  return (
    <svg width={width} viewBox="0 0 600 240" style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B2C52" />
          <stop offset="100%" stopColor="#0B1730" />
        </linearGradient>
        <radialGradient id="logo-glow" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#FFB238" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#FFB238" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="logo-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="45%" stopColor="#C98A54" />
          <stop offset="100%" stopColor="#B07540" />
        </linearGradient>
        <radialGradient id="logo-sheen" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="600" height="240" rx="32" fill="url(#logo-bg)" />

      <g transform="translate(85,20) scale(0.5)">
        <circle cx="200" cy="205" r="150" fill="url(#logo-glow)" />
        <path d="M 40 170 Q 90 168 130 172" stroke="#FFB238" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.55" />
        <path d="M 30 205 Q 85 203 135 207" stroke="#FFB238" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M 45 240 Q 95 238 130 241" stroke="#FFB238" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.5" />
        <ellipse cx="205" cy="345" rx="95" ry="15" fill="rgba(0,0,0,0.28)" />
        <path d="M 292 268 Q 335 258 358 210 Q 366 245 335 272 Q 312 288 280 286 Z" fill="url(#logo-fur)" />
        <ellipse cx="205" cy="298" rx="78" ry="54" fill="url(#logo-fur)" />
        <ellipse cx="163" cy="345" rx="24" ry="17" fill="#FFF3E4" />
        <ellipse cx="247" cy="345" rx="24" ry="17" fill="#FFF3E4" />
        <ellipse cx="135" cy="322" rx="20" ry="15" fill="url(#logo-fur)" transform="rotate(-25 135 322)" />
        <ellipse cx="122" cy="332" rx="13" ry="9" fill="#FFF3E4" transform="rotate(-25 122 332)" />
        <ellipse cx="142" cy="150" rx="34" ry="58" fill="#B07540" transform="rotate(-20 142 150)" />
        <ellipse cx="268" cy="150" rx="34" ry="58" fill="#B07540" transform="rotate(20 268 150)" />
        <circle cx="205" cy="192" r="105" fill="url(#logo-fur)" />
        <circle cx="205" cy="192" r="105" fill="url(#logo-sheen)" />
        <ellipse cx="205" cy="228" rx="72" ry="60" fill="#FFF3E4" />
        <ellipse cx="140" cy="222" rx="18" ry="11" fill="#FFAFAE" opacity="0.65" />
        <ellipse cx="270" cy="222" rx="18" ry="11" fill="#FFAFAE" opacity="0.65" />
        <circle cx="163" cy="190" r="19" fill="#2B2118" />
        <circle cx="247" cy="190" r="19" fill="#2B2118" />
        <circle cx="156" cy="182" r="6" fill="#fff" />
        <circle cx="240" cy="182" r="6" fill="#fff" />
        <circle cx="171" cy="197" r="3" fill="#fff" opacity="0.8" />
        <circle cx="255" cy="197" r="3" fill="#fff" opacity="0.8" />
        <ellipse cx="205" cy="222" rx="14" ry="11" fill="#2B2118" />
        <circle cx="200" cy="218" r="2.6" fill="#fff" opacity="0.7" />
        <path d="M 172 252 Q 205 272 238 252" stroke="#2B2118" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>

      <text x="315" y="110" fontFamily="'Baloo 2','Fredoka',ui-rounded,system-ui,sans-serif" fontWeight="800" fontSize="72" fill="#FF8C61">×Pet</text>
      <text x="315" y="170" fontFamily="'Baloo 2','Fredoka',ui-rounded,system-ui,sans-serif" fontWeight="800" fontSize="54" letterSpacing="1" fill="#FFB238">×Press</text>
    </svg>
  );
}

function LockedPetBreedCard({ id, sub, ink }) {
  const b = PET_BREEDS[id];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, border: "2px dashed #3A4A6B", background: "#0F1B33", opacity: 0.65 }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#22335A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔒</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: ink }}>{b.name} <span style={{ color: sub, fontWeight: 400, fontSize: 11 }}>· {b.size}</span></p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: sub }}>Coming soon</p>
      </div>
    </div>
  );
}
const petKeyframes = `
  @keyframes chibiIdleBob { 0%,100%{transform:translateY(0) scale(1,1);} 50%{transform:translateY(-4px) scale(1.01,0.99);} }
  @keyframes chibiPaceXA { 0%,100%{transform:translateX(-18px);} 50%{transform:translateX(18px);} }
  @keyframes chibiPaceXB { 0%,100%{transform:translateX(18px);} 50%{transform:translateX(-18px);} }
  @keyframes chibiActionBob { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-7px) rotate(-2deg);} }
  @keyframes chibiSleepBob { 0%,100%{transform:translateY(0) scale(1,1);} 50%{transform:translateY(-2px) scale(1.02,0.98);} }
  @keyframes chibiSickWobble { 0%,100%{transform:translateY(0) rotate(-1.5deg);} 50%{transform:translateY(-1px) rotate(1.5deg);} }
  @keyframes chibiTailWag { 0%,100%{transform:rotate(10deg);} 50%{transform:rotate(-14deg);} }
  @keyframes chibiTonguePant { 0%,100%{transform:scaleY(1);} 50%{transform:scaleY(1.2);} }
  @keyframes chibiZzz { 0%{opacity:0; transform:translateY(0);} 50%{opacity:1;} 100%{opacity:0; transform:translateY(-16px);} }
`;
// ======================= end xPet =======================

// Text shared when inviting someone to a family — includes the code AND the
// site link, since the code alone is useless to someone who doesn't already
// have this page open.
function familyInviteMessage(code) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return `Join our xPet family! Use code ${code} at ${url}`;
}

export default function App() {
  const { get, set, ready } = useStorage();
  // Responsiveness: saving to storage should never make the player wait to see
  // the result of what they just did. This fires a save in the background and
  // lets the screen/UI update immediately, regardless of how long the actual
  // save takes (or even if it briefly fails — a retry attempt is still made).
  const saveInBackground = useCallback((key, value) => {
    set(key, value).catch((e) => console.error("background save failed:", key, e));
  }, [set]);
  const [screen, setScreen] = useState("loading");
  const [profiles, setProfiles] = useState([]);
  const [current, setCurrent] = useState(null);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinModalFor, setPinModalFor] = useState(null); // name of profile awaiting PIN entry
  const [pinAttempt, setPinAttempt] = useState("");
  const [pinAttemptError, setPinAttemptError] = useState(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [pinIsNew, setPinIsNew] = useState(false); // true if this profile has no PIN yet
  const [familyAdmin, setFamilyAdmin] = useState(null);
  const [leavingFamily, setLeavingFamily] = useState(false);
  const [familyCodeCopied, setFamilyCodeCopied] = useState(false);
  const canShareFamilyCode = typeof navigator !== "undefined" && !!navigator.share;
  const [addProfileBusy, setAddProfileBusy] = useState(false);
  const [addProfileError, setAddProfileError] = useState(null);
  const [age, setAge] = useState(null); // current profile's age
  const [avatar, setAvatar] = useState(null); // current profile's zodiac avatar id, or null = default dog icon
  const [stats, setStats] = useState({});
  const [levelBests, setLevelBests] = useState({});
  const [events, setEvents] = useState([]); // this profile's {points, ts, level} history — feeds the leaderboard, never decreases
  const [balance, setBalance] = useState(0); // spendable point balance, like a bank account
  const [unlockedLevels, setUnlockedLevels] = useState([1]); // levels purchased/unlocked so far
  const [ledger, setLedger] = useState([]); // {type: "earn"|"spend", amount, reason, ts} — full transaction history
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastPlayedDay, setLastPlayedDay] = useState(null); // SGT day-start ms of last completed level
  const [leaderboard, setLeaderboard] = useState({}); // name -> { events, age, avatar }
  const [lbTab, setLbTab] = useState("alltime");
  const [ageFilter, setAgeFilter] = useState("mine"); // "mine" | "all"
  const [profileCache, setProfileCache] = useState({}); // name -> { stats, levelBests, events, age, avatar, streak, lastPlayedDay, balance, unlockedLevels, ledger }
  const [profileAgesPreview, setProfileAgesPreview] = useState({}); // name -> age, for the picker list
  const [profileAvatarsPreview, setProfileAvatarsPreview] = useState({}); // name -> avatar id, for the picker list
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [muted, setMuted] = useState(false);
  const [infoLevel, setInfoLevel] = useState(null);
  const [pets, setPets] = useState([]); // current profile's dogs (up to MAX_PETS)
  const [activePetIndex, setActivePetIndex] = useState(0);
  const [petProfileIndex, setPetProfileIndex] = useState(0);
  const [petAdoptBreed, setPetAdoptBreed] = useState(null);
  const [petNameInput, setPetNameInput] = useState("");
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [petAction, setPetAction] = useState(null);
  const [petShop, setPetShop] = useState(null);
  const petActionTimer = useRef(null);
  const [, forceTick] = useState(0);
  // Tracks which profile the latest `pets` snapshot actually belongs to. Needed
  // because this ref is updated by its own effect (on `pets` changing) independently
  // of the tick effect below (which restarts on `current` changing) — during the
  // brief async gap while switching profiles (setCurrent has committed but the new
  // profile's loadProfileData hasn't called setPets yet), the two could otherwise
  // disagree and a tick would save the OLD profile's pets under the NEW profile's key.
  const petsRef = useRef({ name: current, pets });
  useEffect(() => { petsRef.current = { name: current, pets }; }, [current, pets]);
  const petTickCount = useRef(0);

  // xPet: decay stats in real time while any dogs exist for the current profile.
  // Persisted periodically (every 6th tick, ~30s — not on every 5s tick, to avoid
  // hammering Firestore with writes) and immediately the moment a pet becomes sick.
  // Without this, none of a session's live decay/sickness ever reached storage: the
  // next load recalculated stats from whatever a real action (feed/play/clean/vet)
  // last saved, at the slower idle rate, silently undoing any in-session decay and
  // erasing sickness the moment you switched profiles or reloaded.
  useEffect(() => {
    if (pets.length === 0) return;
    const id = setInterval(() => {
      if (petsRef.current.name !== current) return; // profile switch in flight — skip this tick
      const prevPets = petsRef.current.pets;
      const next = prevPets.map((p) => tickPetSickness(p, Date.now()));
      setPets(next);
      const justGotSick = next.some((p, i) => p.sick && !prevPets[i].sick);
      petTickCount.current += 1;
      if (justGotSick || petTickCount.current % 6 === 0) {
        saveInBackground(`pets:${current}`, next);
        setProfileCache((cache) => ({ ...cache, [current]: { ...(cache[current] || {}), pets: next } }));
      }
      forceTick((n) => n + 1);
    }, 5000);
    return () => clearInterval(id);
  }, [pets.length, current, saveInBackground]);

  // Keep the on-screen clock ticking while a level is in progress
  useEffect(() => {
    if (screen !== "quiz" || !quiz) return;
    const id = setInterval(() => forceTick((n) => n + 1), 100);
    return () => clearInterval(id);
  }, [screen, quiz && quiz.levelStart]);

  // Handle what happens after an answer is submitted: advance on correct, retry on wrong
  useEffect(() => {
    if (!quiz || !quiz.feedback) return;
    const isRight = quiz.feedback === "right";
    const delay = isRight ? 350 : 550;
    const timer = setTimeout(async () => {
      if (isRight) {
        const isLast = quiz.index + 1 >= quiz.questions.length;
        if (isLast) {
          await finishLevel(quiz);
        } else {
          setQuiz({ ...quiz, index: quiz.index + 1, input: "", feedback: null });
        }
      } else {
        setQuiz({ ...quiz, input: "", feedback: null });
      }
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz && quiz.feedback]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const p = await get("profiles", []);
      setProfiles(p);
      setScreen(p.length ? "profiles" : "addProfile");
      const ages = {};
      const avatars = {};
      for (const name of p) {
        ages[name] = await get(`age:${name}`, null);
        avatars[name] = await get(`avatar:${name}`, null);
      }
      setProfileAgesPreview(ages);
      setProfileAvatarsPreview(avatars);
    })();
  }, [ready, get]);

  const loadProfileData = useCallback(async (name) => {
    if (profileCache[name]) {
      setStats(profileCache[name].stats);
      setLevelBests(profileCache[name].levelBests);
      setEvents(profileCache[name].events || []);
      setAge(profileCache[name].age || null);
      setAvatar(profileCache[name].avatar || null);
      setStreak(profileCache[name].streak || 0);
      setLongestStreak(profileCache[name].longestStreak || 0);
      setLastPlayedDay(profileCache[name].lastPlayedDay || null);
      setBalance(profileCache[name].balance || 0);
      setUnlockedLevels(profileCache[name].unlockedLevels || [1]);
      setLedger(profileCache[name].ledger || []);
      const cachedPets = (profileCache[name].pets || []).map((p) => applyPetDecay(p, Date.now()));
      setPets(cachedPets);
      setActivePetIndex(0);
      return;
    }
    const s = await get(`stats:${name}`, {});
    const b = await get(`levelBest:${name}`, {});
    const ev = await get(`events:${name}`, []);
    const a = await get(`age:${name}`, null);
    const av = await get(`avatar:${name}`, null);
    const st = await get(`streak:${name}`, 0);
    const ls = await get(`longestStreak:${name}`, 0);
    const lpd = await get(`lastPlayedDay:${name}`, null);

    // If balance/unlockedLevels/ledger haven't been saved yet, use a sensible fallback
    // for display purposes only — we deliberately do NOT write this back to storage.
    // (A save that simply hasn't landed yet must never be treated as "missing data
    // to reset" — that previously caused real progress to be wiped after a refresh.)
    let bal = await get(`balance:${name}`, null);
    let unlocked = await get(`unlockedLevels:${name}`, null);
    let ldg = await get(`ledger:${name}`, null);
    if (bal === null) bal = sumPoints(ev, 0);
    if (unlocked === null) unlocked = [1, ...Object.keys(b).map(Number)];
    if (ldg === null) ldg = [];

    setStats(s);
    setLevelBests(b);
    setEvents(ev);
    setAge(a);
    setAvatar(av);
    setStreak(st);
    setLongestStreak(ls);
    setLastPlayedDay(lpd);
    setBalance(bal);
    setUnlockedLevels(unlocked);
    setLedger(ldg);
    const rawPets = await get(`pets:${name}`, []);
    const decayedPets = rawPets.map((p) => applyPetDecay(p, Date.now()));
    setPets(decayedPets);
    setActivePetIndex(0);
    setProfileCache((prev) => ({
      ...prev,
      [name]: { stats: s, levelBests: b, events: ev, age: a, avatar: av, streak: st, longestStreak: ls, lastPlayedDay: lpd, balance: bal, unlockedLevels: unlocked, ledger: ldg, pets: decayedPets },
    }));
  }, [get, set, profileCache]);

  const loadLeaderboard = useCallback(async (names) => {
    const list = names || profiles;
    const data = {};
    for (const name of list) {
      if (name === current) {
        data[name] = { events, age, avatar };
      } else if (profileCache[name]) {
        data[name] = { events: profileCache[name].events || [], age: profileCache[name].age || null, avatar: profileCache[name].avatar || null };
      } else {
        const ev = await get(`events:${name}`, []);
        const a = await get(`age:${name}`, null);
        const av = await get(`avatar:${name}`, null);
        data[name] = { events: ev, age: a, avatar: av };
      }
    }
    setLeaderboard(data);
  }, [get, profiles, current, events, age, avatar, profileCache]);

  // Always refresh leaderboard data on entering the screen — including re-fetching
  // the roster itself, since another device may have added a profile since this
  // device last loaded it. Without this, two devices that joined the same family
  // in the same session could each be unaware the other's profile exists.
  useEffect(() => {
    if (screen !== "leaderboard") return;
    (async () => {
      const freshProfiles = await get("profiles", []);
      setProfiles(freshProfiles);
      const admin = await get("admin", null);
      setFamilyAdmin(admin);
      await loadLeaderboard(freshProfiles);
    })();
  }, [screen]);

  // Same reasoning: refresh the roster when switching trainers, so a profile
  // created on another device shows up here without needing a full page reload.
  useEffect(() => {
    if (screen !== "profiles") return;
    (async () => {
      const freshProfiles = await get("profiles", []);
      setProfiles(freshProfiles);
      const admin = await get("admin", null);
      setFamilyAdmin(admin);
    })();
  }, [screen]);

  const addProfile = async () => {
    const name = newName.trim();
    if (!name || profiles.length >= MAX_PROFILES || addProfileBusy) return;
    if (profiles.some((p) => p.toLowerCase() === name.toLowerCase())) return;
    if (!/^\d{4}$/.test(newPin)) return;
    setAddProfileBusy(true);
    setAddProfileError(null);
    let result;
    try {
      // A transaction against the server, not just a check against this device's
      // possibly-stale local `profiles` list — two devices can otherwise create a
      // same-named profile within moments of each other and the second write would
      // silently overwrite the first person's PIN.
      result = await window.storage.createProfile(name, JSON.stringify(newPin));
    } catch (e) {
      console.error("createProfile failed:", e);
      setAddProfileBusy(false);
      setAddProfileError("Couldn't create that profile — check your internet connection and try again.");
      return;
    }
    setAddProfileBusy(false);
    if (!result.ok) {
      setAddProfileError("That name was just taken on another device — pick a different one.");
      const fresh = await get("profiles", []);
      setProfiles(fresh);
      return;
    }
    const updated = result.profiles;
    setNewPin("");
    setProfiles(updated);
    setNewName("");
    setCurrent(name);
    setAge(null);
    setAvatar(null);
    setStreak(0);
    setLongestStreak(0);
    setLastPlayedDay(null);
    setBalance(0);
    setUnlockedLevels([1]);
    setLedger([]);
    setPets([]);
    setActivePetIndex(0);
    saveInBackground(`balance:${name}`, 0);
    saveInBackground(`unlockedLevels:${name}`, [1]);
    saveInBackground(`ledger:${name}`, []);
    setProfileCache((prev) => ({ ...prev, [name]: { stats: {}, levelBests: {}, events: [], age: null, avatar: null, streak: 0, longestStreak: 0, lastPlayedDay: null, balance: 0, unlockedLevels: [1], ledger: [], pets: [] } }));
    setProfileAgesPreview((prev) => ({ ...prev, [name]: null }));
    setProfileAvatarsPreview((prev) => ({ ...prev, [name]: null }));
    await loadProfileData(name);
    setScreen("menu");
  };

  const copyFamilyInvite = async (code) => {
    try {
      await navigator.clipboard.writeText(familyInviteMessage(code));
      setFamilyCodeCopied(true);
      setTimeout(() => setFamilyCodeCopied(false), 2000);
    } catch (e) {
      console.error("copy failed:", e);
    }
  };
  const shareFamilyInvite = async (code) => {
    try {
      await navigator.share({ title: "xPet family code", text: familyInviteMessage(code) });
    } catch (e) {
      // AbortError when the user just closes the share sheet — nothing to do
    }
  };

  const pickProfile = async (name) => {
    setCurrent(name);
    await loadProfileData(name);
    setScreen("menu");
  };

  const requestPinFor = (name) => {
    setPinModalFor(name);
    setPinAttempt("");
    setPinAttemptError(null);
    setPinIsNew(false);
    get(`pin:${name}`, null).then((stored) => setPinIsNew(stored === null));
  };

  const submitPinAttempt = async () => {
    if (pinAttempt.length !== 4 || !pinModalFor) return;
    setPinBusy(true);
    setPinAttemptError(null);
    try {
      const stored = await get(`pin:${pinModalFor}`, null);
      if (stored === null) {
        // No PIN has ever been set for this profile (e.g. it predates the PIN
        // feature) — claim it now rather than locking the profile out forever.
        // This is a transaction, not a plain write: if someone else claimed it
        // with a different PIN moments ago, we find out instead of overwriting them.
        const result = await window.storage.claimPin(pinModalFor, JSON.stringify(pinAttempt));
        if (result.ok) {
          const name = pinModalFor;
          setPinModalFor(null);
          setPinAttempt("");
          await pickProfile(name);
        } else if (JSON.parse(result.pin) === pinAttempt) {
          const name = pinModalFor;
          setPinModalFor(null);
          setPinAttempt("");
          await pickProfile(name);
        } else {
          setPinAttemptError("This profile was just secured with a PIN on another device — ask them for it.");
          setPinAttempt("");
          setPinIsNew(false);
        }
      } else if (stored === pinAttempt) {
        const name = pinModalFor;
        setPinModalFor(null);
        setPinAttempt("");
        await pickProfile(name);
      } else {
        setPinAttemptError("Incorrect PIN — try again.");
        setPinAttempt("");
      }
    } catch (e) {
      console.error(e);
      setPinAttemptError("Couldn't check that PIN — check your connection and try again.");
    }
    setPinBusy(false);
  };

  const isUnlocked = (n) => n === 1 || unlockedLevels.includes(n);

  const purchaseLevel = async (n) => {
    if (isUnlocked(n)) return;
    const cost = levelUnlockCost(n);
    if (balance < cost) return;
    const newBalance = balance - cost;
    const newUnlocked = [...unlockedLevels, n].sort((a, b) => a - b);
    const entry = { type: "spend", amount: -cost, reason: `Unlocked Level ${n}`, ts: Date.now() };
    const newLedger = [...ledger, entry].slice(-200);
    setBalance(newBalance);
    setUnlockedLevels(newUnlocked);
    setLedger(newLedger);
    setProfileCache((prev) => ({
      ...prev,
      [current]: { ...(prev[current] || { stats: {}, levelBests: {}, events: [] }), balance: newBalance, unlockedLevels: newUnlocked, ledger: newLedger },
    }));
    saveInBackground(`balance:${current}`, newBalance);
    saveInBackground(`unlockedLevels:${current}`, newUnlocked);
    saveInBackground(`ledger:${current}`, newLedger);
  };

  const setProfileAge = async (a) => {
    setAge(a);
    saveInBackground(`age:${current}`, a);
    setProfileCache((prev) => ({ ...prev, [current]: { ...(prev[current] || { stats: {}, levelBests: {}, events: [] }), age: a } }));
    setProfileAgesPreview((prev) => ({ ...prev, [current]: a }));
  };

  const setProfileAvatar = async (avatarId) => {
    setAvatar(avatarId);
    saveInBackground(`avatar:${current}`, avatarId);
    setProfileCache((prev) => ({ ...prev, [current]: { ...(prev[current] || { stats: {}, levelBests: {}, events: [] }), avatar: avatarId } }));
    setProfileAvatarsPreview((prev) => ({ ...prev, [current]: avatarId }));
    setShowAvatarPicker(false);
  };

  // --- xPet actions: all spending shares the same $ balance and ledger as leveling up ---
  const persistPets = (nextPets) => {
    setPets(nextPets);
    saveInBackground(`pets:${current}`, nextPets);
    setProfileCache((prev) => ({ ...prev, [current]: { ...(prev[current] || {}), pets: nextPets } }));
  };
  const spendOnPet = (amount, reason) => {
    const newBalance = balance - amount;
    const entry = { type: "spend", amount: -amount, reason, ts: Date.now() };
    const newLedger = [...ledger, entry].slice(-200);
    setBalance(newBalance);
    setLedger(newLedger);
    saveInBackground(`balance:${current}`, newBalance);
    saveInBackground(`ledger:${current}`, newLedger);
    setProfileCache((prev) => ({ ...prev, [current]: { ...(prev[current] || {}), balance: newBalance, ledger: newLedger } }));
  };
  const runPetAction = (kind, ms, after) => {
    setPetAction(kind);
    clearTimeout(petActionTimer.current);
    petActionTimer.current = setTimeout(() => { setPetAction(null); after && after(); }, ms);
  };
  const petAdopt = () => {
    if (!petAdoptBreed || !petNameInput.trim() || pets.length >= MAX_PETS) return;
    const cost = PET_BREEDS[petAdoptBreed].cost;
    if (balance < cost) { return; }
    const { fur, furShade } = randomizePetFur(PET_BREEDS[petAdoptBreed].fur);
    spendOnPet(cost, `Adopted ${petNameInput.trim()} (${PET_BREEDS[petAdoptBreed].name})`);
    const newPet = {
      breed: petAdoptBreed, name: petNameInput.trim(), fur, furShade, adoptedAt: Date.now(),
      hunger: 80, energy: 80, happiness: 80, cleanliness: 100, sick: false, lastUpdate: Date.now(),
    };
    persistPets([...pets, newPet]);
    setActivePetIndex(pets.length);
    setPetAdoptBreed(null);
    setPetNameInput("");
  };
  const petUpdateActive = (fn) => {
    const next = pets.map((p, i) => (i === activePetIndex ? fn(p) : p));
    persistPets(next);
  };
  const petFeed = (item) => {
    if (petAction || balance < item.cost) return;
    const pet = pets[activePetIndex];
    spendOnPet(item.cost, `Fed ${pet.name} (${item.name})`);
    setPetShop(null);
    runPetAction("eating", 1800, () => petUpdateActive((p) => ({ ...p, hunger: petClampStat(p.hunger + item.restore), lastUpdate: Date.now() })));
  };
  const petPlay = (item) => {
    if (petAction || balance < item.cost) return;
    const pet = pets[activePetIndex];
    spendOnPet(item.cost, `Played with ${pet.name} (${item.name})`);
    setPetShop(null);
    runPetAction("playing", 1800, () => petUpdateActive((p) => ({ ...p, happiness: petClampStat(p.happiness + item.restore), lastUpdate: Date.now() })));
  };
  const petNap = () => {
    runPetAction("sleeping", 3000, () => petUpdateActive((p) => ({ ...p, energy: PET_MAX, lastUpdate: Date.now() })));
  };
  const petClean = () => {
    setPetShop(null);
    runPetAction("cleaning", 1200, () => petUpdateActive((p) => ({ ...p, cleanliness: PET_MAX, lastUpdate: Date.now() })));
  };
  const petTreatSick = () => {
    if (petAction || balance < PET_VET_COST) return;
    const pet = pets[activePetIndex];
    spendOnPet(PET_VET_COST, `Vet visit for ${pet.name}`);
    setPetShop(null);
    runPetAction("vet", 2000, () => petUpdateActive((p) => ({ ...p, sick: false, lastUpdate: Date.now() })));
  };
  const petAdjustStat = (key, delta) => petUpdateActive((p) => ({ ...p, [key]: petClampStat(p[key] + delta), lastUpdate: Date.now() }));
  const petToggleSick = () => petUpdateActive((p) => ({ ...p, sick: !p.sick, lastUpdate: Date.now() }));
  const petRename = (index, newName) => {
    const trimmed = newName.trim();
    const pet = pets[index];
    if (!trimmed || !pet || trimmed === pet.name) return;
    if (balance < PET_RENAME_COST) return;
    spendOnPet(PET_RENAME_COST, `Renamed ${pet.name} to ${trimmed}`);
    const next = pets.map((p, i) => (i === index ? { ...p, name: trimmed } : p));
    persistPets(next);
  };

  const startLevel = (n) => {
    if (!isUnlocked(n)) return;
    const cfg = LEVELS[n - 1];
    setQuiz({
      level: n,
      questions: generateQuestions(cfg),
      index: 0,
      input: "",
      feedback: null,
      mistakes: 0,
      perTable: {},
      levelStart: Date.now(),
    });
    setScreen("quiz");
  };

  const finishLevel = async (q) => {
    const timeMs = Date.now() - q.levelStart;

    const merged = { ...stats };
    Object.entries(q.perTable).forEach(([t, v]) => {
      const prev = merged[t] || { correct: 0, total: 0 };
      merged[t] = { correct: prev.correct + v.correct, total: prev.total + v.total };
    });
    setStats(merged);

    const prevBest = levelBests[q.level];
    const isRecord = prevBest === undefined || timeMs < prevBest;
    const updatedBests = { ...levelBests, [q.level]: isRecord ? timeMs : prevBest };
    setLevelBests(updatedBests);

    const { points, speedMult } = calcPoints({ level: q.level, mistakes: q.mistakes, timeMs, questionCount: q.questions.length });
    const badges = levelBadges({ mistakes: q.mistakes, speedMult });
    const updatedEvents = [...events, { points, ts: Date.now(), level: q.level }].slice(-500);
    setEvents(updatedEvents);

    // Bank account: every completed round deposits its points into the spendable balance
    const newBalance = balance + points;
    const earnEntry = { type: "earn", amount: points, reason: `Completed Level ${q.level}`, ts: Date.now() };
    const newLedger = [...ledger, earnEntry].slice(-200);
    setBalance(newBalance);
    setLedger(newLedger);

    // Streak: counts consecutive Singapore-calendar days with at least one level played
    const todayStart = startOfSgtDay(Date.now());
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    let newStreak = streak;
    let streakIncreased = false;
    if (lastPlayedDay !== todayStart) {
      newStreak = lastPlayedDay === yesterdayStart ? streak + 1 : 1;
      streakIncreased = true;
    }
    const newLongestStreak = Math.max(longestStreak, newStreak);
    setStreak(newStreak);
    setLongestStreak(newLongestStreak);
    setLastPlayedDay(todayStart);

    setLeaderboard((prev) => ({ ...prev, [current]: { events: updatedEvents, age, avatar } }));
    setProfileCache((prev) => ({
      ...prev,
      [current]: {
        stats: merged, levelBests: updatedBests, events: updatedEvents,
        age: (prev[current] && prev[current].age) || age,
        avatar: (prev[current] && prev[current].avatar) || avatar,
        streak: newStreak, longestStreak: newLongestStreak, lastPlayedDay: todayStart,
        balance: newBalance, unlockedLevels, ledger: newLedger,
      },
    }));

    if (!muted) (isRecord ? sounds.newRecord : sounds.levelComplete)();

    // Show the result the instant it's ready — don't make the player wait on storage for this.
    setLastResult({ level: q.level, time: timeMs, isRecord, previousBest: prevBest, mistakes: q.mistakes, points, badges, streak: newStreak, streakIncreased });
    setScreen(isRecord ? "celebration" : "results");

    // Everything below saves in the background after the screen has already updated.
    saveInBackground(`stats:${current}`, merged);
    saveInBackground(`levelBest:${current}`, updatedBests);
    saveInBackground(`events:${current}`, updatedEvents);
    saveInBackground(`balance:${current}`, newBalance);
    saveInBackground(`ledger:${current}`, newLedger);
    saveInBackground(`streak:${current}`, newStreak);
    saveInBackground(`longestStreak:${current}`, newLongestStreak);
    saveInBackground(`lastPlayedDay:${current}`, todayStart);
  };

  const submitAnswer = () => {
    if (!quiz || quiz.feedback || quiz.input === "") return;
    const q = quiz.questions[quiz.index];
    const val = parseInt(quiz.input, 10);
    const isRight = val === q.answer;
    const perTable = { ...quiz.perTable };
    perTable[q.table] = perTable[q.table] || { correct: 0, total: 0 };
    perTable[q.table].total += 1;
    if (isRight) perTable[q.table].correct += 1;
    if (!muted) (isRight ? sounds.correct : sounds.wrong)();
    setQuiz({
      ...quiz,
      feedback: isRight ? "right" : "wrong",
      mistakes: quiz.mistakes + (isRight ? 0 : 1),
      perTable,
    });
  };

  const pressDigit = (d) => {
    if (!quiz || quiz.feedback) return;
    if (quiz.input.length >= 3) return;
    setQuiz({ ...quiz, input: quiz.input + d });
  };
  const pressBackspace = () => {
    if (!quiz || quiz.feedback) return;
    setQuiz({ ...quiz, input: quiz.input.slice(0, -1) });
  };

  const bg = "#0F1B33";
  const panel = "#16223F";
  const ink = "#EAF0FB";
  const sub = "#93A3C4";
  const amber = "#FFB238";

  const wrap = {
    minHeight: "100%",
    background: bg,
    color: ink,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    padding: "24px 18px",
    boxSizing: "border-box",
  };
  const headFont = { fontFamily: "ui-rounded, 'Baloo 2', Inter, system-ui, sans-serif" };
  const card = { background: panel, borderRadius: 18, padding: 20 };
  const btnPrimary = {
    background: amber, color: "#231400", border: "none", borderRadius: 14,
    padding: "14px 20px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit",
  };
  const btnGhost = {
    background: "transparent", color: ink, border: "1.5px solid #3A4A6B", borderRadius: 14,
    padding: "12px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
  };
  const iconBtnSmall = {
    background: "transparent", color: sub, border: "1.5px solid #3A4A6B", borderRadius: 8,
    width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontFamily: "inherit", padding: 0, verticalAlign: "middle",
  };
  const familyCodeActions = (code) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 6 }}>
      <button onClick={() => copyFamilyInvite(code)} style={iconBtnSmall} aria-label="Copy family code and invite link">
        <Copy size={12} />
      </button>
      {canShareFamilyCode && (
        <button onClick={() => shareFamilyInvite(code)} style={iconBtnSmall} aria-label="Share family code and invite link">
          <Share2 size={12} />
        </button>
      )}
      {familyCodeCopied && <span style={{ color: "#3FB27F", fontSize: 11 }}>Copied!</span>}
    </span>
  );

  if (screen === "loading") {
    return <div style={wrap}>Loading…</div>;
  }

  if (screen === "addProfile") {
    return (
      <div style={wrap}>
        <div style={{ marginBottom: 22 }}>
          <Logo width={280} />
        </div>
        <div style={card}>
          <p style={{ color: sub, marginTop: 0 }}>
            Who's playing today? Add a name to create a trainer's profile and track their own progress.
          </p>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProfile()}
            placeholder="Enter a name"
            style={{
              width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12,
              border: "1.5px solid #3A4A6B", background: "#0F1B33", color: ink, fontSize: 16, marginBottom: 8,
            }}
          />
          {newName.trim() && profiles.some((p) => p.toLowerCase() === newName.trim().toLowerCase()) && (
            <p style={{ color: "#F2994A", fontSize: 13, margin: "0 0 10px" }}>
              That name is already taken — try another.
            </p>
          )}
          {addProfileError && (
            <p style={{ color: "#F2994A", fontSize: 13, margin: "0 0 10px" }}>{addProfileError}</p>
          )}
          <p style={{ color: sub, fontSize: 13, margin: "0 0 6px" }}>Set a 4-digit PIN so only you can open this profile:</p>
          <input
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onKeyDown={(e) => e.key === "Enter" && addProfile()}
            placeholder="••••"
            inputMode="numeric"
            maxLength={4}
            style={{
              width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12,
              border: "1.5px solid #3A4A6B", background: "#0F1B33", color: ink, fontSize: 20, letterSpacing: 6,
              textAlign: "center", fontWeight: 700, marginBottom: 14,
            }}
          />
          <button
            style={btnPrimary}
            onClick={addProfile}
            disabled={addProfileBusy || !newName.trim() || newPin.length !== 4 || profiles.some((p) => p.toLowerCase() === newName.trim().toLowerCase())}
          >
            {addProfileBusy ? "Creating…" : "Create profile"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "profiles") {
    return (
      <div style={wrap}>
        <div style={{ marginBottom: 22 }}>
          <Logo width={280} />
        </div>
        <p style={{ color: sub }}>Pick a trainer to get started. ({profiles.length}/{MAX_PROFILES})</p>
        {(typeof window !== "undefined" && window.localStorage && localStorage.getItem("xpet_family_code")) && (
          <>
            <p style={{ color: sub, fontSize: 12, margin: "0 0 6px" }}>
              Family code: <span style={{ color: amber, fontWeight: 700, letterSpacing: 1 }}>{localStorage.getItem("xpet_family_code")}</span>
              {familyAdmin && <> · Admin: <span style={{ color: ink, fontWeight: 700 }}>{familyAdmin}</span></>}
              {familyCodeActions(localStorage.getItem("xpet_family_code"))}
            </p>
            <button
              onClick={async () => {
                if (!window.confirm("Leave this family group? You can create a new one or join a different one with its code — you'll need this family's code again to come back.")) return;
                setLeavingFamily(true);
                try {
                  // Make sure any progress from the last few seconds actually reaches
                  // Firestore before we tear the page down, or it can be silently lost.
                  if (window.storage && window.storage.flush) await window.storage.flush();
                } catch (e) {
                  console.error("flush before leaving family failed:", e);
                }
                localStorage.removeItem("xpet_family_code");
                window.location.reload();
              }}
              disabled={leavingFamily}
              style={{ ...btnGhost, marginBottom: 14, fontSize: 12, padding: "6px 12px", opacity: leavingFamily ? 0.6 : 1 }}
            >
              {leavingFamily ? "Saving your progress…" : "← Create or join a different family"}
            </button>
          </>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {profiles.map((p) => (
            <button
              key={p}
              onClick={() => requestPinFor(p)}
              style={{ ...card, textAlign: "left", border: "none", color: ink, fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ZodiacAvatar id={profileAvatarsPreview[p] || DEFAULT_AVATAR} size={30} />
                <span>
                  {p}
                  {profileAgesPreview[p] && (
                    <span style={{ color: sub, fontWeight: 400, fontSize: 13 }}> · Age {profileAgesPreview[p]}</span>
                  )}
                </span>
              </span>
              <span style={{ color: sub, fontWeight: 400, fontSize: 14 }}>Play →</span>
            </button>
          ))}
        </div>
        {profiles.length < MAX_PROFILES ? (
          <button
            onClick={() => setScreen("addProfile")}
            style={{ ...btnGhost, marginTop: 18, display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={18} /> Add another trainer
          </button>
        ) : (
          <p style={{ color: sub, fontSize: 13, marginTop: 18, textAlign: "center" }}>
            Maximum of {MAX_PROFILES} trainers reached.
          </p>
        )}

        {pinModalFor && (
          <div
            onClick={() => setPinModalFor(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(6, 12, 26, 0.65)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#16223F", border: `2px solid ${amber}`, borderRadius: 16, padding: 20, maxWidth: 320, width: "100%", textAlign: "center" }}
            >
              <p style={{ ...headFont, margin: "0 0 4px", fontSize: 17 }}>
                {pinIsNew ? `Set a PIN for ${pinModalFor}` : `Enter ${pinModalFor}'s PIN`}
              </p>
              <p style={{ color: sub, fontSize: 12, margin: "0 0 14px" }}>
                {pinIsNew ? "This profile doesn't have a PIN yet — choose one now." : "This keeps your profile just for you."}
              </p>
              <input
                value={pinAttempt}
                onChange={(e) => setPinAttempt(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onKeyDown={(e) => e.key === "Enter" && submitPinAttempt()}
                placeholder="••••"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                style={{
                  width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12,
                  border: "1.5px solid #3A4A6B", background: "#0F1B33", color: ink, fontSize: 22, letterSpacing: 8,
                  textAlign: "center", fontWeight: 700, marginBottom: 10,
                }}
              />
              {pinAttemptError && (
                <p style={{ color: "#F2994A", fontSize: 13, marginBottom: 10 }}>{pinAttemptError}</p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...btnGhost, flex: 1 }} onClick={() => setPinModalFor(null)} disabled={pinBusy}>
                  Cancel
                </button>
                <button style={{ ...btnPrimary, flex: 1 }} onClick={submitPinAttempt} disabled={pinAttempt.length !== 4 || pinBusy}>
                  {pinBusy ? "Checking…" : pinIsNew ? "Set PIN" : "Unlock"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === "menu") {
    return (
      <div style={wrap}>
        <div style={{ marginBottom: 18 }}>
          <Logo width={220} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ZodiacAvatar id={avatar || DEFAULT_AVATAR} size={32} />
            <h1 style={{ ...headFont, fontSize: 21, margin: 0 }}>{current}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {streak > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, color: amber, fontWeight: 700, fontSize: 14 }}>
                <Flame size={16} color={amber} /> {streak}
              </span>
            )}
            <button
              onClick={() => setMuted((m) => !m)}
              style={{ ...btnGhost, padding: "8px 10px", display: "flex", alignItems: "center" }}
              aria-label={muted ? "Unmute sound" : "Mute sound"}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button style={{ ...btnGhost, padding: "8px 12px" }} onClick={() => setScreen("profiles")}>
              Switch
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => setScreen("history")}
            style={{ ...card, flex: 1, border: `2px solid ${amber}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", color: ink, fontFamily: "inherit", padding: "14px 8px" }}
          >
            <span style={{ fontSize: 22 }}>💰</span>
            <span style={{ ...headFont, fontWeight: 700, fontSize: 14, color: amber }}>${balance}</span>
          </button>
          <button
            onClick={() => setScreen("leaderboard")}
            style={{ ...card, flex: 1, border: `2px solid ${amber}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ink, fontFamily: "inherit", padding: "14px 8px" }}
          >
            <Trophy color={amber} size={22} />
          </button>
          <button
            onClick={() => setScreen("profile")}
            style={{ ...card, flex: 1, border: `2px solid ${amber}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ink, fontFamily: "inherit", padding: "14px 8px" }}
          >
            <Star color={amber} size={22} fill={amber} />
          </button>          <button
            onClick={() => setScreen("petCare")}
            style={{ ...card, flex: 1, border: `2px solid ${pets.length ? petStatusColor(petsAverageStatus(pets)) : amber}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", color: ink, fontFamily: "inherit", padding: "14px 8px" }}
          >
            <PawIcon size={20} color={pets.length ? petStatusColor(petsAverageStatus(pets)) : amber} />
            {pets.length > 0 && (
              <span style={{ ...headFont, fontWeight: 700, fontSize: 13, color: petStatusColor(petsAverageStatus(pets)) }}>
                {petsAverageStatus(pets)}%
              </span>
            )}
          </button>
        </div>

        <div style={{ ...card, marginBottom: 16 }}>
          <h3 style={{ ...headFont, margin: "0 0 10px" }}>Choose a level</h3>
          <p style={{ color: sub, fontSize: 13, marginTop: 0, marginBottom: 14 }}>
            Spend money to unlock the next level. Beat your time to set a new record.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {LEVELS.map((lvl, i) => {
              const color = LEVEL_COLORS[i];
              const best = levelBests[lvl.level];
              const unlocked = isUnlocked(lvl.level);
              const cost = levelUnlockCost(lvl.level);
              const affordable = balance >= cost;
              return (
                <div
                  key={lvl.level}
                  onClick={() => {
                    if (unlocked) startLevel(lvl.level);
                    else if (affordable) purchaseLevel(lvl.level).then(() => startLevel(lvl.level));
                    else setInfoLevel(lvl.level);
                  }}
                  style={{
                    position: "relative", textAlign: "left", cursor: unlocked || affordable ? "pointer" : "not-allowed",
                    background: "#0F1B33",
                    border: `2px solid ${unlocked ? color : affordable ? amber : "#26365A"}`,
                    borderRadius: 14, padding: 12, paddingRight: 30, color: unlocked ? ink : sub, fontFamily: "inherit",
                    opacity: unlocked ? 1 : affordable ? 0.9 : 0.55,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...headFont, fontSize: 18, fontWeight: 800, color: unlocked ? color : sub }}>
                      Lv {lvl.level}
                    </span>
                    {unlocked ? (
                      best !== undefined && <span style={{ fontSize: 12, color: amber, fontWeight: 700 }}>{fmtTime(best)}</span>
                    ) : (
                      <Lock size={16} color={sub} />
                    )}
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: unlocked ? sub : affordable ? amber : sub, fontWeight: unlocked ? 400 : 700 }}>
                    {unlocked ? lvl.label : affordable ? `Tap to unlock · $${cost}` : `🔒 $${cost}`}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setInfoLevel(infoLevel === lvl.level ? null : lvl.level); }}
                    style={{
                      position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%",
                      border: `1.5px solid ${infoLevel === lvl.level ? amber : "#3A4A6B"}`,
                      background: infoLevel === lvl.level ? amber : "transparent",
                      color: infoLevel === lvl.level ? "#231400" : sub,
                      fontSize: 12, fontWeight: 800, lineHeight: "17px", padding: 0, cursor: "pointer", fontFamily: "inherit",
                    }}
                    aria-label={`About level ${lvl.level}`}
                  >
                    ?
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {infoLevel && (
          <div
            onClick={() => setInfoLevel(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(6, 12, 26, 0.65)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#16223F", border: `2px solid ${amber}`, borderRadius: 16,
                padding: 18, maxWidth: 320, width: "100%", position: "relative",
              }}
            >
              <button
                onClick={() => setInfoLevel(null)}
                style={{
                  position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%",
                  border: "1.5px solid #3A4A6B", background: "transparent", color: "#93A3C4",
                  fontSize: 13, fontWeight: 800, cursor: "pointer", padding: 0, fontFamily: "inherit",
                }}
                aria-label="Close"
              >
                ✕
              </button>
              <p style={{ ...headFont, margin: "0 0 8px", fontSize: 16, color: LEVEL_COLORS[infoLevel - 1] }}>
                Level {infoLevel} · {LEVELS[infoLevel - 1].label}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#93A3C4", lineHeight: 1.5 }}>
                {isUnlocked(infoLevel)
                  ? levelDescription(LEVELS[infoLevel - 1])
                  : `Costs $${levelUnlockCost(infoLevel)} to unlock. Your balance: $${balance}.${balance >= levelUnlockCost(infoLevel) ? " Tap the level to unlock it now." : ` Earn $${levelUnlockCost(infoLevel) - balance} more to afford it.`}`}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === "history") {
    const sorted = [...ledger].sort((a, b) => b.ts - a.ts);
    return (
      <div style={wrap}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button style={{ ...btnGhost, padding: "6px 10px" }} onClick={() => setScreen("menu")}>
            <ArrowLeft size={16} />
          </button>
          <h1 style={{ ...headFont, fontSize: 21, margin: 0 }}>Bank Statement</h1>
        </div>

        <div style={{ ...card, marginBottom: 16, textAlign: "center" }}>
          <p style={{ color: sub, fontSize: 12, margin: "0 0 2px" }}>Current balance</p>
          <p style={{ ...headFont, fontSize: 28, margin: 0, color: amber }}>💰 ${balance}</p>
        </div>

        <div style={card}>
          {sorted.length === 0 ? (
            <p style={{ color: sub, textAlign: "center", margin: 0 }}>
              No transactions yet — play a level to start earning!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sorted.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: i < sorted.length - 1 ? "1px solid #22335A" : "none",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{entry.reason}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: sub }}>{fmtLedgerDate(entry.ts)}</p>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 15, color: entry.type === "earn" ? FEEDBACK_RIGHT : FEEDBACK_WRONG }}>
                    {entry.amount > 0 ? "+$" : "-$"}{Math.abs(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "profile") {
    const totalPoints = sumPoints(events, 0);
    const levelsCompleted = Object.keys(levelBests).length;

    return (
      <div style={wrap}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <button style={{ ...btnGhost, padding: "6px 10px" }} onClick={() => { setShowAvatarPicker(false); setScreen("menu"); }}>
            <ArrowLeft size={16} />
          </button>
          <h1 style={{ ...headFont, fontSize: 21, margin: 0 }}>My Profile</h1>
        </div>

        <div style={{ ...card, textAlign: "center", marginBottom: 16, border: `2px solid ${amber}` }}>
          <button
            onClick={() => setShowAvatarPicker((v) => !v)}
            style={{
              width: 72, height: 72, borderRadius: "50%", background: "#0F1B33", border: `2px solid ${amber}`,
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
              cursor: "pointer", padding: 0,
            }}
            aria-label="Change avatar"
          >
            <ZodiacAvatar id={avatar || DEFAULT_AVATAR} size={54} />
          </button>
          <h2 style={{ ...headFont, fontSize: 22, margin: "0 0 4px" }}>{current}</h2>
          <p style={{ color: sub, fontSize: 13, margin: "0 0 4px" }}>
            {age ? (age === "13+" ? "Age 13+" : `Age ${age}`) : "Trainer"}
          </p>
          <button
            onClick={() => setShowAvatarPicker((v) => !v)}
            style={{ background: "none", border: "none", color: sub, fontSize: 12, textDecoration: "underline", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          >
            {showAvatarPicker ? "Close" : "Change avatar"}
          </button>

          {showAvatarPicker && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
              {ZODIAC_OPTIONS.map((z) => {
                const selected = (avatar || DEFAULT_AVATAR) === z.id;
                return (
                  <button
                    key={z.id}
                    onClick={() => setProfileAvatar(z.id)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      padding: "6px 2px", borderRadius: 14,
                      border: `1.5px solid ${selected ? amber : "#3A4A6B"}`,
                      background: selected ? "#1F2E52" : "transparent", cursor: "pointer", fontFamily: "inherit",
                    }}
                    aria-label={z.name}
                  >
                    <ZodiacAvatar id={z.id} size={38} />
                    <span style={{ fontSize: 9, color: selected ? amber : sub, fontWeight: 600 }}>{z.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => setScreen("history")}
          style={{ ...card, width: "100%", marginBottom: 16, border: `2px solid ${amber}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: ink, fontFamily: "inherit" }}
        >
          <div style={{ textAlign: "left" }}>
            <p style={{ color: sub, fontSize: 12, margin: "0 0 2px" }}>Balance</p>
            <p style={{ ...headFont, fontSize: 22, margin: 0, color: amber }}>💰 ${balance}</p>
          </div>
          <span style={{ color: sub, fontSize: 13 }}>View statement →</span>
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          <div style={{ ...card, textAlign: "center", padding: 14 }}>
            <p style={{ ...headFont, fontSize: 22, margin: "0 0 2px", color: amber }}>${totalPoints}</p>
            <p style={{ color: sub, fontSize: 11, margin: 0 }}>Lifetime earned</p>
          </div>
          <div style={{ ...card, textAlign: "center", padding: 14 }}>
            <p style={{ ...headFont, fontSize: 22, margin: "0 0 2px", color: amber, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Flame size={18} color={amber} /> {longestStreak}
            </p>
            <p style={{ color: sub, fontSize: 11, margin: 0 }}>Best streak</p>
          </div>
          <div style={{ ...card, textAlign: "center", padding: 14 }}>
            <p style={{ ...headFont, fontSize: 22, margin: "0 0 2px", color: amber }}>{levelsCompleted}/10</p>
            <p style={{ color: sub, fontSize: 11, margin: 0 }}>Levels done</p>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ ...headFont, margin: "0 0 10px" }}>Level records</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LEVELS.map((lvl, i) => {
              const color = LEVEL_COLORS[i];
              const best = levelBests[lvl.level];
              const done = best !== undefined;
              return (
                <div
                  key={lvl.level}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 10px", borderRadius: 10, background: "#0F1B33",
                    border: `1.5px solid ${done ? color : "#26365A"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...headFont, fontWeight: 800, fontSize: 14, color: done ? color : sub }}>
                      Lv {lvl.level}
                    </span>
                    <span style={{ fontSize: 12, color: sub }}>{lvl.label}</span>
                  </div>
                  {done ? (
                    <span style={{ color: amber, fontWeight: 700, fontSize: 13 }}>{fmtTime(best)}</span>
                  ) : (
                    <Lock size={14} color={sub} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "petProfile" && pets[petProfileIndex]) {
    const pet = pets[petProfileIndex];
    const b = PET_BREEDS[pet.breed];
    const pInk = ink, pSub = sub, pPanel = panel;
    const pCard = { background: pPanel, borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
    const pGhost = { background: "transparent", color: pInk, border: "1.5px solid #3A4A6B", borderRadius: 14, padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
    return (
      <div style={{ background: bg, minHeight: "100%", padding: "20px 16px", boxSizing: "border-box", fontFamily: "Inter, system-ui, sans-serif", color: pInk }}>
        <style>{petKeyframes}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setShowRenameInput(false); setScreen("petCare"); }} style={{ ...pGhost, padding: "6px 10px" }}>←</button>
          <h1 style={{ ...headFont, fontSize: 20, margin: 0 }}>Pet Profile</h1>
        </div>
        <div style={{ ...pCard, textAlign: "center", marginBottom: 14 }}>
          <ChibiDog breed={pet.breed} fur={pet.fur} furShade={pet.furShade} mood={petMoodState(pet)} action={null} />
          <p style={{ ...headFont, fontSize: 18, margin: "0 0 2px" }}>{pet.name}</p>
          <p style={{ margin: 0, fontSize: 13, color: pSub }}>{b.name} · {b.size}</p>

          {!showRenameInput ? (
            <button
              onClick={() => { setRenameInput(pet.name); setShowRenameInput(true); }}
              style={{ background: "none", border: "none", color: amber, fontSize: 12, textDecoration: "underline", cursor: "pointer", padding: 0, marginTop: 8, fontFamily: "inherit" }}
            >
              Rename for ${PET_RENAME_COST}
            </button>
          ) : (
            <div style={{ marginTop: 12 }}>
              <input
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="New name"
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: "1.5px solid #3A4A6B", background: bg, color: ink, fontSize: 14, marginBottom: 8, fontFamily: "inherit" }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...pGhost, flex: 1, fontSize: 13 }} onClick={() => setShowRenameInput(false)}>Cancel</button>
                <button
                  style={{ background: amber, color: "#231400", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", flex: 1, fontFamily: "inherit", opacity: balance < PET_RENAME_COST || !renameInput.trim() || renameInput.trim() === pet.name ? 0.5 : 1 }}
                  onClick={() => { petRename(petProfileIndex, renameInput); setShowRenameInput(false); }}
                  disabled={balance < PET_RENAME_COST || !renameInput.trim() || renameInput.trim() === pet.name}
                >
                  Confirm · ${PET_RENAME_COST}
                </button>
              </div>
              {balance < PET_RENAME_COST && (
                <p style={{ color: pSub, fontSize: 11, marginTop: 6 }}>You have ${balance}. Play a level to earn more.</p>
              )}
            </div>
          )}
        </div>
        <div style={pCard}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #22335A" }}>
            <span style={{ color: pSub, fontSize: 13 }}>Breed</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{b.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #22335A" }}>
            <span style={{ color: pSub, fontSize: 13 }}>Adopted on</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{fmtPetDate(pet.adoptedAt)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: pSub, fontSize: 13 }}>Time together</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{petAgeText(pet.adoptedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "petCare") {
    const pInk = ink, pSub = sub, pCoral = "#FF8C61", pGold = amber, pPanel = panel;
    const pCard = { background: pPanel, borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
    const pPrimary = { background: pCoral, color: "#fff", border: "none", borderRadius: 14, padding: "12px 18px", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" };
    const pGhost = { background: "transparent", color: pInk, border: "1.5px solid #3A4A6B", borderRadius: 14, padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
    const activePet = pets[activePetIndex];
    const worstClean = pets.length ? Math.min(...pets.map((p) => p.cleanliness)) : PET_MAX;
    const dirt = pets.length ? petDirtLevel(worstClean) : 0;
    const wrapBg = pets.length ? mixColor(bg, "#4A3B28", dirt * 0.55) : bg;

    return (
      <div style={{ background: wrapBg, minHeight: "100%", padding: "20px 16px", boxSizing: "border-box", fontFamily: "Inter, system-ui, sans-serif", color: pInk, position: "relative", transition: "background 0.8s ease" }}>
        <style>{petKeyframes}</style>

        {pets.length > 0 && dirt > 0.05 && PET_DIRT_SPOTS.map((d, i) => (
          <div key={i} style={{ position: "absolute", top: d.top, left: d.left, width: d.size, height: d.size * 0.7, borderRadius: "50%", background: "#5C4A32", opacity: dirt * 0.35, pointerEvents: "none", filter: "blur(1px)", transform: `rotate(${i * 37}deg)` }} />
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setScreen("menu")} style={{ ...pGhost, padding: "6px 10px" }}>←</button>
            <h1 style={{ ...headFont, fontSize: 20, margin: 0 }}>xPet</h1>
          </div>
          <div style={{ background: pPanel, borderRadius: 999, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <span>💰</span>
            <span style={{ ...headFont, fontWeight: 700, color: pGold, fontSize: 14 }}>${balance}</span>
          </div>
        </div>

        {/* Yard: both dogs together */}
        {pets.length > 0 && (
          <div style={{ ...pCard, marginBottom: 10, padding: "14px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
              {pets.map((p, i) => (
                <div key={i} style={{ textAlign: "center", position: "relative" }}>
                  <button
                    onClick={() => { setPetProfileIndex(i); setScreen("petProfile"); }}
                    style={{ position: "absolute", top: -4, right: -4, width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #3A4A6B", background: "#0F1B33", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}
                    aria-label={`${p.name}'s profile`}
                  >
                    <PawIcon size={13} color={amber} />
                  </button>
                  <div
                    onClick={() => setActivePetIndex(i)}
                    style={{
                      display: "inline-block", cursor: "pointer", padding: 6, borderRadius: 16,
                      border: `2px solid ${i === activePetIndex ? pCoral : "transparent"}`,
                      animation: !petAction || i !== activePetIndex
                        ? `${i === 0 ? "chibiPaceXA" : "chibiPaceXB"} ${4.2 + i * 0.6}s ease-in-out infinite`
                        : "none",
                    }}
                  >
                    <ChibiDog breed={p.breed} fur={p.fur} furShade={p.furShade} mood={petMoodState(p)} action={i === activePetIndex ? petAction : null} />
                  </div>
                  {p.cleanliness <= PET_MESS_THRESHOLD && <p style={{ margin: "0 0 2px", fontSize: 16 }}>💩</p>}
                  <p style={{ ...headFont, margin: 0, fontSize: 13, color: i === activePetIndex ? pCoral : pInk }}>{p.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {pets.length > 0 && pets.length < MAX_PETS && activePetIndex !== -1 && (
          <button onClick={() => { setActivePetIndex(-1); setPetAdoptBreed(null); setPetNameInput(""); }} style={{ ...pGhost, width: "100%", marginBottom: 14 }}>
            🏠 Visit the Adoption Centre for a 2nd dog
          </button>
        )}

        {(pets.length === 0 || activePetIndex === -1) ? (
          <div style={pCard}>
            {pets.length > 0 && (
              <button onClick={() => setActivePetIndex(0)} style={{ ...pGhost, padding: "6px 10px", fontSize: 12, marginBottom: 10 }}>← Back</button>
            )}
            <h2 style={{ ...headFont, fontSize: 17, margin: "0 0 4px" }}>Adopt a dog</h2>
            <p style={{ color: pSub, fontSize: 13, margin: "0 0 14px" }}>
              Bigger breeds cost more. {pets.length > 0 && `(${pets.length}/${MAX_PETS} adopted)`}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {AVAILABLE_PET_BREEDS.map((id) => {
                const b = PET_BREEDS[id];
                return (
                  <button
                    key={id}
                    onClick={() => setPetAdoptBreed(id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      border: `2px solid ${petAdoptBreed === id ? pCoral : "#3A4A6B"}`,
                      background: petAdoptBreed === id ? "#1F2E52" : "#0F1B33",
                    }}
                  >
                    <div style={{ width: 64, height: 64, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      <div style={{ transform: "scale(0.42)" }}><ChibiDog breed={id} mood="okay" action={null} /></div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ ...headFont, margin: 0, fontSize: 14 }}>{b.name} <span style={{ color: pSub, fontWeight: 400, fontSize: 11 }}>· {b.size}</span></p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: pSub }}>{b.blurb}</p>
                    </div>
                    <span style={{ ...headFont, color: pGold, fontWeight: 700, fontSize: 14 }}>${b.cost}</span>
                  </button>
                );
              })}
              <LockedPetBreedCard id="chihuahua" sub={pSub} ink={pInk} />
              <LockedPetBreedCard id="greatdane" sub={pSub} ink={pInk} />
            </div>
            {petAdoptBreed && (
              <>
                <input
                  value={petNameInput}
                  onChange={(e) => setPetNameInput(e.target.value)}
                  placeholder="Name your dog"
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #3A4A6B", fontSize: 15, marginBottom: 10, fontFamily: "inherit" }}
                />
                <button style={{ ...pPrimary, width: "100%" }} onClick={petAdopt} disabled={balance < PET_BREEDS[petAdoptBreed].cost}>
                  Adopt {PET_BREEDS[petAdoptBreed].name} for ${PET_BREEDS[petAdoptBreed].cost}
                </button>
                {balance < PET_BREEDS[petAdoptBreed].cost && (
                  <p style={{ color: pSub, fontSize: 12, margin: "8px 0 0", textAlign: "center" }}>
                    You have ${balance}. Play a level to earn more.
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ ...pCard, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "Hunger", val: activePet.hunger, icon: "🍖" },
                  { label: "Energy", val: activePet.energy, icon: "⚡" },
                  { label: "Happy", val: activePet.happiness, icon: "😊" },
                  { label: "Clean", val: activePet.cleanliness, icon: "🧼" },
                ].map((s) => (
                  <div key={s.label} style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 3px", fontSize: 10, color: pSub }}>{s.icon} {s.label}</p>
                    <div style={{ height: 8, background: "#22335A", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.val}%`, background: pCoral, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
              {activePet.sick && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "#C0622E", fontWeight: 700 }}>🤒 {activePet.name} isn't feeling well — visit the vet</p>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button style={{ ...pGhost, flex: 1 }} onClick={() => setPetShop(petShop === "food" ? null : "food")}>🍖 Feed</button>
              <button style={{ ...pGhost, flex: 1 }} onClick={() => setPetShop(petShop === "toys" ? null : "toys")}>🎾 Play</button>
              <button style={{ ...pGhost, flex: 1 }} onClick={petNap} disabled={!!petAction}>😴 Nap</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button style={{ ...pGhost, flex: 1 }} onClick={() => setPetShop(petShop === "clean" ? null : "clean")}>🧼 Clean</button>
              <button style={{ ...pGhost, flex: 1, borderColor: activePet.sick ? "#E08E45" : "#3A4A6B" }} onClick={() => setPetShop(petShop === "vet" ? null : "vet")}>🏥 Vet</button>
              <button disabled style={{ ...pGhost, flex: 1, color: pSub, borderColor: "#3A4A6B", background: "#16223F", cursor: "not-allowed" }}>🎀 Coming soon</button>
            </div>

            {petShop === "food" && (
              <div style={pCard}>
                <h3 style={{ ...headFont, fontSize: 14, margin: "0 0 10px" }}>Food</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {PET_FOOD_ITEMS.map((item) => (
                    <button key={item.id} onClick={() => petFeed(item)} disabled={!!petAction || balance < item.cost}
                      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 6px", borderRadius: 12, cursor: (petAction || balance < item.cost) ? "not-allowed" : "pointer", fontFamily: "inherit", border: "1.5px solid #3A4A6B", background: "#0F1B33", opacity: (petAction || balance < item.cost) ? 0.45 : 1 }}>
                      <span style={{ fontSize: 22 }}>{item.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{item.name}</span>
                      <span style={{ fontSize: 11, color: pGold, fontWeight: 700 }}>${item.cost}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {petShop === "toys" && (
              <div style={pCard}>
                <h3 style={{ ...headFont, fontSize: 14, margin: "0 0 10px" }}>Toys</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {PET_TOY_ITEMS.map((item) => (
                    <button key={item.id} onClick={() => petPlay(item)} disabled={!!petAction || balance < item.cost}
                      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 6px", borderRadius: 12, cursor: (petAction || balance < item.cost) ? "not-allowed" : "pointer", fontFamily: "inherit", border: "1.5px solid #3A4A6B", background: "#0F1B33", opacity: (petAction || balance < item.cost) ? 0.45 : 1 }}>
                      <span style={{ fontSize: 22 }}>{item.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{item.name}</span>
                      <span style={{ fontSize: 11, color: pGold, fontWeight: 700 }}>${item.cost}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {petShop === "clean" && (
              <div style={{ ...pCard, textAlign: "center" }}>
                <h3 style={{ ...headFont, fontSize: 14, margin: "0 0 8px" }}>Cleaning</h3>
                {activePet.cleanliness >= PET_MAX ? (
                  <p style={{ color: pSub, fontSize: 13, margin: 0 }}>All clean — no mess right now! 🧼</p>
                ) : (
                  <>
                    <p style={{ color: pSub, fontSize: 13, margin: "0 0 10px" }}>Cleaning up is free — just takes a moment.</p>
                    <button style={pPrimary} onClick={petClean}>Clean up</button>
                  </>
                )}
              </div>
            )}

            {petShop === "vet" && (
              <div style={{ ...pCard, textAlign: "center" }}>
                <h3 style={{ ...headFont, fontSize: 14, margin: "0 0 8px" }}>Vet</h3>
                {activePet.sick ? (
                  <>
                    <p style={{ color: pSub, fontSize: 13, margin: "0 0 10px" }}>{activePet.name} needs a checkup.</p>
                    <button style={pPrimary} onClick={petTreatSick} disabled={!!petAction || balance < PET_VET_COST}>Take to vet · ${PET_VET_COST}</button>
                  </>
                ) : (
                  <p style={{ color: pSub, fontSize: 13, margin: 0 }}>{activePet.name} is healthy! No visit needed. ✅</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (screen === "leaderboard") {
    const medal = (rank) => (rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${rank + 1}`);
    const now = Date.now();
    const sinceMs =
      lbTab === "today" ? startOfSgtDay(now) :
      lbTab === "week" ? startOfSgtWeek(now) :
      lbTab === "month" ? startOfSgtMonth(now) :
      0;

    const names = Object.keys(leaderboard).filter(
      (name) => ageFilter === "all" || (age != null && leaderboard[name].age === age)
    );

    const rows = names
      .map((name) => ({ name, points: sumPoints(leaderboard[name].events, sinceMs) }))
      .filter((row) => row.points > 0 || row.name === current)
      .sort((a, b) => b.points - a.points);

    const tabLabel = { today: "Today", week: "This week", month: "This month", alltime: "All-time" };
    const ageLabel = age ? (age === "13+" ? "13+" : `Age ${age}`) : "your age";
    const familyCode = typeof window !== "undefined" && window.localStorage ? localStorage.getItem("xpet_family_code") : null;

    return (
      <div style={wrap}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button style={{ ...btnGhost, padding: "6px 10px" }} onClick={() => setScreen("menu")}>
            <ArrowLeft size={16} />
          </button>
          <h1 style={{ ...headFont, fontSize: 21, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy color={amber} size={22} /> Leaderboard
          </h1>
        </div>

        {familyCode && (
          <p style={{ color: sub, fontSize: 12, margin: "0 0 12px", textAlign: "center" }}>
            Family code: <span style={{ color: amber, fontWeight: 700, letterSpacing: 1 }}>{familyCode}</span>
            {familyAdmin && <> · Admin: <span style={{ color: ink, fontWeight: 700 }}>{familyAdmin}</span></>}
            {familyCodeActions(familyCode)}
          </p>
        )}

        {!age && (
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ ...headFont, margin: "0 0 6px", fontSize: 15 }}>Add your age</h3>
            <p style={{ color: sub, fontSize: 12, marginTop: 0, marginBottom: 10 }}>
              This profile doesn't have an age yet, so it won't show up under "My age" here.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 8 }}>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => (
                <button
                  key={n}
                  onClick={() => setProfileAge(n)}
                  style={{
                    padding: "8px 0", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    border: "1.5px solid #3A4A6B", background: "transparent", color: ink,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => setProfileAge("13+")}
              style={{ ...btnGhost, width: "100%", padding: "8px 0" }}
            >
              13 or older
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["mine", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setAgeFilter(f)}
              style={{ ...(ageFilter === f ? btnPrimary : btnGhost), padding: "8px 14px", fontSize: 13, flex: 1 }}
            >
              {f === "mine" ? `My age (${ageLabel})` : "Everyone"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
          {["today", "week", "month", "alltime"].map((tab) => (
            <button
              key={tab}
              onClick={() => setLbTab(tab)}
              style={{ ...(lbTab === tab ? btnPrimary : btnGhost), padding: "8px 14px", fontSize: 13, flex: 1, flexShrink: 0 }}
            >
              {tabLabel[tab]}
            </button>
          ))}
        </div>

        <div style={card}>
          {rows.length === 0 && (
            <p style={{ color: sub, textAlign: "center", margin: 0 }}>
              $0 earned {lbTab === "alltime" ? "yet" : lbTab === "today" ? "today" : lbTab === "month" ? "this month" : "this week"}
              {ageFilter === "mine" ? ` for ${ageLabel}` : ""}.
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((row, i) => (
              <div
                key={row.name}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: row.name === current ? "#1F2E52" : "transparent",
                  border: row.name === current ? `1.5px solid ${amber}` : "1.5px solid transparent",
                  borderRadius: 12, padding: "10px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ ...headFont, fontSize: 18, width: 24, textAlign: "center" }}>{medal(i)}</span>
                  <ZodiacAvatar id={leaderboard[row.name].avatar || DEFAULT_AVATAR} size={26} />
                  <span style={{ fontWeight: 700 }}>{row.name}</span>
                </div>
                <span style={{ color: amber, fontWeight: 700 }}>${row.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "quiz" && quiz) {
    const q = quiz.questions[quiz.index];
    const levelColor = LEVEL_COLORS[quiz.level - 1];
    const cfg = LEVELS[quiz.level - 1];
    const elapsed = ((Date.now() - quiz.levelStart) / 1000).toFixed(1);
    const trackProgress = quiz.questions.length > 1 ? quiz.index / (quiz.questions.length - 1) : 0;
    const keypadRows = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "go"];

    return (
      <div style={{ ...wrap, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
        <style>{`
          @keyframes shakeX { 20%,60%{transform:translateX(-6px);} 40%,80%{transform:translateX(6px);} 100%{transform:translateX(0);} }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button style={{ ...btnGhost, padding: "6px 10px" }} onClick={() => setScreen("menu")}>
            <ArrowLeft size={16} />
          </button>
          <span style={{ ...headFont, color: levelColor, fontWeight: 700, fontSize: 14 }}>
            Level {quiz.level} · {cfg.label}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: amber, fontWeight: 700, fontSize: 14 }}>
            <Zap size={14} /> {elapsed}s
          </span>
        </div>

        <div style={{ position: "relative", height: 40, margin: "4px 0 16px" }}>
          <div style={{ position: "absolute", top: "50%", left: 6, right: 6, height: 4, background: "#22335A", borderRadius: 4, transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: 6, right: 6, display: "flex", justifyContent: "space-between", transform: "translateY(-50%)" }}>
            {quiz.questions.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= quiz.index ? levelColor : "#3A4A6B" }} />
            ))}
          </div>
          <div
            style={{
              position: "absolute", top: "50%",
              left: `calc(${trackProgress * 100}% - 12px + 6px)`,
              transform: "translateY(-50%)",
              transition: "left 0.5s cubic-bezier(.34,1.56,.64,1)",
            }}
          >
            <PawIcon size={24} color={amber} />
          </div>
        </div>

        <div style={{ ...card, textAlign: "center", border: `2px solid ${levelColor}` }}>
          <p style={{ color: sub, fontSize: 13, margin: "0 0 4px" }}>Question {quiz.index + 1} of {quiz.questions.length}</p>
          <p style={{ ...headFont, fontSize: 40, margin: "6px 0" }}>
            {q.table} × {q.mult}
          </p>
          <div
            style={{
              position: "relative", minHeight: 54, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 800, letterSpacing: 2, borderRadius: 12,
              border: `1.5px solid ${quiz.feedback === "wrong" ? FEEDBACK_WRONG : quiz.feedback === "right" ? FEEDBACK_RIGHT : "#3A4A6B"}`,
              background: "#0F1B33", color: ink, marginBottom: 10,
              animation: quiz.feedback === "wrong" ? "shakeX 0.4s" : "none",
            }}
          >
            {quiz.input || <span style={{ color: "#4A5A82" }}>?</span>}
            {quiz.feedback === "right" && (
              <span style={{ position: "absolute", right: 12, display: "flex", alignItems: "center" }}>
                <Check size={24} color={FEEDBACK_RIGHT} />
              </span>
            )}
            {quiz.feedback === "wrong" && (
              <span style={{ position: "absolute", right: 12, display: "flex", alignItems: "center" }}>
                <X size={24} color={FEEDBACK_WRONG} />
              </span>
            )}
          </div>
          {quiz.feedback === "wrong" && (
            <p style={{ color: FEEDBACK_WRONG, fontWeight: 700, margin: "0 0 4px" }}>Try again!</p>
          )}
          {quiz.feedback === "right" && (
            <p style={{ color: FEEDBACK_RIGHT, fontWeight: 700, margin: "0 0 4px" }}>Correct!</p>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
          {keypadRows.map((k, i) => {
            if (k === "del") {
              return (
                <button key={i} onClick={pressBackspace} disabled={!!quiz.feedback} style={{ ...btnGhost, fontSize: 20, padding: "16px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Delete size={22} />
                </button>
              );
            }
            if (k === "go") {
              return (
                <button key={i} onClick={submitAnswer} disabled={!!quiz.feedback} style={{ ...btnPrimary, fontSize: 18, padding: "16px 0" }}>
                  Go
                </button>
              );
            }
            return (
              <button key={i} onClick={() => pressDigit(k)} disabled={!!quiz.feedback} style={{ ...btnGhost, fontSize: 22, fontWeight: 700, padding: "16px 0" }}>
                {k}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen === "results" && lastResult) {
    const lvl = LEVELS[lastResult.level - 1];
    const color = LEVEL_COLORS[lastResult.level - 1];
    return (
      <div style={wrap}>
        <div style={{ ...card, textAlign: "center", border: `2px solid ${color}` }}>
          <Trophy color={color} size={40} />
          <h2 style={{ ...headFont, fontSize: 24, margin: "10px 0" }}>Level {lastResult.level} complete!</h2>
          <p style={{ color: sub, marginBottom: 6 }}>{lvl.label}</p>
          <p style={{ ...headFont, fontSize: 34, margin: "10px 0", color: amber }}>{fmtTime(lastResult.time)}</p>
          <p style={{ color: amber, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>+${lastResult.points}</p>
          {lastResult.badges && lastResult.badges.length > 0 && (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
              {lastResult.badges.map((b, i) => (
                <span
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700,
                    padding: "4px 10px", borderRadius: 999,
                    color: b.tone === "good" ? "#3FB27F" : "#E0A72E",
                    border: `1.5px solid ${b.tone === "good" ? "#3FB27F" : "#E0A72E"}`,
                  }}
                >
                  {b.icon} {b.text}
                </span>
              ))}
            </div>
          )}
          <p style={{ color: sub, fontSize: 13, marginBottom: 4 }}>
            Best: {fmtTime(lastResult.previousBest)}
          </p>
          {lastResult.streakIncreased && lastResult.streak > 1 && (
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: amber, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              <Flame size={16} color={amber} /> {lastResult.streak}-day streak!
            </p>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            <button style={btnGhost} onClick={() => setScreen("menu")}>
              <ArrowLeft size={16} style={{ marginRight: 6 }} /> Levels
            </button>
            <button style={btnGhost} onClick={() => startLevel(lastResult.level)}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> Retry
            </button>
            {lastResult.level < 10 && isUnlocked(lastResult.level + 1) && (
              <button style={btnPrimary} onClick={() => startLevel(lastResult.level + 1)}>
                Next level →
              </button>
            )}
            {lastResult.level < 10 && !isUnlocked(lastResult.level + 1) && balance >= levelUnlockCost(lastResult.level + 1) && (
              <button style={btnPrimary} onClick={() => purchaseLevel(lastResult.level + 1).then(() => startLevel(lastResult.level + 1))}>
                Unlock Lv {lastResult.level + 1} · ${levelUnlockCost(lastResult.level + 1)}
              </button>
            )}
          </div>
          {lastResult.level < 10 && !isUnlocked(lastResult.level + 1) && balance < levelUnlockCost(lastResult.level + 1) && (
            <p style={{ color: sub, fontSize: 12, marginTop: 10 }}>
              ${balance}/${levelUnlockCost(lastResult.level + 1)} to unlock Level {lastResult.level + 1}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (screen === "celebration" && lastResult) {
    const lvl = LEVELS[lastResult.level - 1];
    const dots = [LEVEL_COLORS[lastResult.level - 1], amber, "#3FB27F", "#D45D79", "#3A7CA5"];
    return (
      <div style={{ ...wrap, position: "relative", overflow: "hidden" }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${(i * 37) % 90}%`, left: `${(i * 53) % 90}%`,
              width: 8, height: 8, borderRadius: i % 2 ? "50%" : 2,
              background: dots[i % dots.length], opacity: 0.85,
            }}
          />
        ))}
        <div style={{ ...card, textAlign: "center", border: `2px solid ${amber}`, position: "relative" }}>
          <Sparkles color={amber} size={44} />
          <h2 style={{ ...headFont, fontSize: 26, margin: "10px 0", color: amber }}>New Record!</h2>
          <p style={{ color: sub, marginBottom: 6 }}>Level {lastResult.level} · {lvl.label}</p>
          <p style={{ ...headFont, fontSize: 38, margin: "10px 0" }}>{fmtTime(lastResult.time)}</p>
          <p style={{ color: amber, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>+${lastResult.points}</p>
          {lastResult.badges && lastResult.badges.length > 0 && (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
              {lastResult.badges.map((b, i) => (
                <span
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700,
                    padding: "4px 10px", borderRadius: 999,
                    color: b.tone === "good" ? "#3FB27F" : "#E0A72E",
                    border: `1.5px solid ${b.tone === "good" ? "#3FB27F" : "#E0A72E"}`,
                  }}
                >
                  {b.icon} {b.text}
                </span>
              ))}
            </div>
          )}
          <p style={{ color: sub, fontSize: 13, marginBottom: 4 }}>
            {lastResult.previousBest ? `Previous best: ${fmtTime(lastResult.previousBest)}` : "First time completing this level!"}
          </p>
          {lastResult.streakIncreased && lastResult.streak > 1 && (
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: amber, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              <Flame size={16} color={amber} /> {lastResult.streak}-day streak!
            </p>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            <button style={btnGhost} onClick={() => setScreen("menu")}>
              <ArrowLeft size={16} style={{ marginRight: 6 }} /> Levels
            </button>
            <button style={btnGhost} onClick={() => startLevel(lastResult.level)}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> Retry
            </button>
            {lastResult.level < 10 && isUnlocked(lastResult.level + 1) && (
              <button style={btnPrimary} onClick={() => startLevel(lastResult.level + 1)}>
                Next level →
              </button>
            )}
            {lastResult.level < 10 && !isUnlocked(lastResult.level + 1) && balance >= levelUnlockCost(lastResult.level + 1) && (
              <button style={btnPrimary} onClick={() => purchaseLevel(lastResult.level + 1).then(() => startLevel(lastResult.level + 1))}>
                Unlock Lv {lastResult.level + 1} · ${levelUnlockCost(lastResult.level + 1)}
              </button>
            )}
          </div>
          {lastResult.level < 10 && !isUnlocked(lastResult.level + 1) && balance < levelUnlockCost(lastResult.level + 1) && (
            <p style={{ color: sub, fontSize: 12, marginTop: 10 }}>
              ${balance}/${levelUnlockCost(lastResult.level + 1)} to unlock Level {lastResult.level + 1}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
