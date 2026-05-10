#!/usr/bin/env node
// One-shot importer: parse the layout-extracted text of
// "DA-I war table missions (1).pdf" and merge its records into
// js/data/wartable.js.
//
// Usage:
//   pdftotext -layout "DA-I war table missions (1).pdf" /tmp/dai-wt.txt
//   node scripts/import-pdf-wartable.js /tmp/dai-wt.txt
//
// The PDF columns map to advisors as follows:
//   Forces      → cullen
//   Connections → josephine
//   Secrets     → leliana

"use strict";

const fs   = require("fs");
const path = require("path");
const vm   = require("vm");

const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// 1) Read the layout-extracted text.
// ---------------------------------------------------------------------------
const txtPath = process.argv[2] || "/tmp/dai-wt.txt";
const lines = fs.readFileSync(txtPath, "utf8").split("\n");

// Column slice ranges (only used for prefix/continuation lines; the
// anchor row itself is parsed by content, since "Connections" is wider
// than the gap and bleeds leftward into the time column).
const COLS = {
  name:  [0, 36],
  req:   [36, 86],
  power: [86, 104],
  time:  [104, 124],
  spec:  [124, 142],
  fr:    [142, 161],
  sr:    [161, 182],
  cr:    [182, 205],
  level: [205, 220],
  tip:   [220, 1000]
};
function slice(line, [a, b]) {
  return (line.slice(a, b) || "").replace(/\s+$/, "").replace(/^\s+/, "");
}

// Content-based parse for the anchor row. The signature is:
//   <name + req> <power-digits> <time-digits> <Specialist> <rewards...>
// We find the leftmost occurrence of (digits  digits  specialist) where the
// power digits sit in cols 86..104 — that anchors the row reliably even when
// "Connections" overflows the column gap.
const ANCHOR_RE = /(\d+)\s+(\d+)\s+(Forces|Connections|Secrets|None)(?=\s{2,}|$)/g;
function parseAnchor(line) {
  let bestMatch = null, m;
  ANCHOR_RE.lastIndex = 0;
  while ((m = ANCHOR_RE.exec(line))) {
    if (m.index >= 80 && m.index <= 110) { bestMatch = m; break; }
  }
  if (!bestMatch) return null;
  const before = line.slice(0, bestMatch.index);
  const after  = line.slice(bestMatch.index + bestMatch[0].length);
  // Some pages of the PDF render with shifted left margins (~14 cols
  // narrower). Detect by the leftmost run of 3+ spaces inside `before`.
  let split = 36;
  const m2 = before.match(/^(.{0,40}?\S)\s{3,}/);
  if (m2) split = m2[1].length;
  const nameRaw = before.slice(0, split);
  const reqRaw  = before.slice(split);
  const tokens  = after.trim().split(/\s{2,}/);
  return {
    nameRaw,
    reqRaw,
    power: parseInt(bestMatch[1], 10),
    tmin:  parseInt(bestMatch[2], 10),
    spec:  bestMatch[3],
    fr:    tokens[0] || "",
    sr:    tokens[1] || "",
    cr:    tokens[2] || "",
    level: tokens[3] || "",
    tip:   tokens.slice(4).join(" ")
  };
}

// Section headers introduce a thematic group of missions. They appear at
// col 0 with all other cells empty and shouldn't be treated as name-prefix
// continuations of the next anchor row.
const SECTION_RE = /(Operation\s+(Chain|Group|Plot)|^Dwarf$|^Elf$|^Human$|^Qunari$|^Blackwall$|^Cassandra$|^Cole$|^Cullen$|^Dorian$|^Iron Bull$|^Josephine$|^Leliana$|^Sera$|^Solas$|^Varric$|^Vivienne$|^The Iron Bull|^Sutherland|^Ser Barris|^The Crew|^The Bull|^Mage |^Templars|^Darkspawn|^Grey Wardens|^Kirkwall|^Kal-Sharok|^Crows|^Serault|^Executors|^Western Approach|^Wedding Alliances|^Michel de Chevin)/;

// ---------------------------------------------------------------------------
// 2) Walk lines: collect prefix lines, emit records on anchor rows.
// ---------------------------------------------------------------------------
const records = [];
let pending = []; // continuation lines preceding the next anchor

function isAnchor(line) {
  return parseAnchor(line) !== null;
}
function isSectionHeader(line) {
  const name = slice(line, COLS.name);
  const others = [COLS.req, COLS.power, COLS.time, COLS.spec, COLS.fr, COLS.sr, COLS.cr, COLS.level, COLS.tip]
    .map(r => slice(line, r)).join("");
  return name && !others && SECTION_RE.test(name);
}
function joinCells(anchor) {
  const a = parseAnchor(anchor);
  if (!a) return null;
  function pre(col, anchorVal) {
    const parts = pending.map(l => slice(l, COLS[col])).filter(Boolean);
    if (anchorVal) parts.push(anchorVal.replace(/\s+$/, "").replace(/^\s+/, ""));
    return parts.join(" ");
  }
  return {
    name:  pre("name",  a.nameRaw),
    req:   pre("req",   a.reqRaw),
    power: a.power,
    tmin:  a.tmin,
    spec:  a.spec,
    fr:    pre("fr",    a.fr),
    sr:    pre("sr",    a.sr),
    cr:    pre("cr",    a.cr),
    level: a.level,
    tip:   pre("tip",   a.tip)
  };
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (i < 2) continue; // skip the two-line header

  if (!line.trim()) {
    pending = []; // blank line = end of a row group
    continue;
  }
  if (isSectionHeader(line)) {
    pending = [];
    continue;
  }
  if (isAnchor(line)) {
    records.push(joinCells(line));
    pending = [];
  } else {
    pending.push(line);
  }
}

// ---------------------------------------------------------------------------
// 3) Normalize records into the app's mission schema.
// ---------------------------------------------------------------------------
const SPEC_TO_ADVISOR = { Forces: "cullen", Connections: "josephine", Secrets: "leliana" };

function slug(s) {
  return ("wt-" + s.toLowerCase()
    .replace(/[‘’′]/g, "'")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""))
    .slice(0, 64);
}
function minToHMM(min) {
  if (!Number.isFinite(min) || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h + ":" + String(m).padStart(2, "0");
}
function cleanReward(s) {
  if (!s) return null;
  let t = s.trim();
  // Some PDF rows separate cells by only one space — strip trailing "None"
  // or "N/A" sentinels that bled in from the next column.
  t = t.replace(/\s+(None|N\/A)$/i, "").trim();
  if (!t || /^(N\/A|None|—|-)$/i.test(t)) return null;
  return t;
}

function inferAct(prereq) {
  const p = (prereq || "").toLowerCase();
  if (/trespasser/.test(p))                                      return "DLC: Trespasser";
  if (/hakkon/.test(p))                                          return "DLC: Hakkon";
  if (/descent|forgotten caverns|sha-brytol|titan/.test(p))      return "DLC: Descent";
  if (/halamshiral|wicked eyes|wicked hearts|here lies the abyss|adamant|skyhold|dorian recruited|sera|cole|blackwall|josephine|leliana|cullen recruited/.test(p))
                                                                 return "Act 2";
  if (/in your heart shall burn|setback/.test(p))                return "Act 2";
  if (/breach|haven|threat remains|prologue/.test(p))            return "Prologue";
  if (/redcliffe|hinterlands|val royeaux|storm coast/.test(p))   return "Act 1";
  return "Act 2";
}
function inferRegion(prereq) {
  const p = (prereq || "").toLowerCase();
  const map = [
    ["hinterland",       "hinterlands"],
    ["storm coast",      "storm_coast"],
    ["crestwood",        "crestwood"],
    ["fallow mire",      "fallow_mire"],
    ["forbidden oasis",  "forbidden_oasis"],
    ["western approach", "western_approach"],
    ["exalted plain",    "exalted_plains"],
    ["emerald grave",    "emerald_graves"],
    ["emprise",          "emprise_du_lion"],
    ["hissing waste",    "hissing_wastes"],
    ["arbor wild",       "arbor_wilds"],
    ["frostback",        "frostback_basin"],
    ["deep roads",       "deep_roads"],
    ["darvaarad",        "darvaarad"],
    ["skyhold",          "skyhold"],
    ["haven",            "haven"],
    ["val royeaux",      "val_royeaux"]
  ];
  for (const [needle, id] of map) if (p.includes(needle)) return id;
  return "war-table";
}
function inferCategory(name, prereq) {
  const t = (name + " " + (prereq || "")).toLowerCase();
  if (/judg(e|ment)/.test(t))                                                return "choice";
  if (/recruit|recruited/.test(t))                                           return "recruit";
  if (/capture|claim|capture[d]?\b/.test(t))                                 return "region-unlock";
  if (/resources?$|^.* resources/.test(t))                                   return "reward";
  if (/dlc|hakkon|descent|trespasser|titan/.test(t))                         return "dlc";
  if (/sided?|side with|alliance|alliance with|approve|approval/.test(t))    return "approval";
  if (/influence|gold|schematic|rune/.test(t))                               return "reward";
  if (/(\bunlock\b|\bopens?\b|\bscout\b)/.test(t))                           return "region-unlock";
  return "misc";
}

const missions = [];
for (const r of records) {
  if (!r) continue;
  const name = r.name.replace(/\s+/g, " ").trim();
  if (!name) continue;
  const power = r.power || 0;
  const tmin  = r.tmin  || 0;
  const specWord = r.spec || "None";
  const recommended = SPEC_TO_ADVISOR[specWord] || null;

  const time = {};
  const t = minToHMM(tmin);
  if (t && recommended) time[recommended] = t;

  const rewardsBy = {};
  const fr = cleanReward(r.fr); if (fr) rewardsBy.cullen    = fr;
  const sr = cleanReward(r.sr); if (sr) rewardsBy.leliana   = sr;
  const cr = cleanReward(r.cr); if (cr) rewardsBy.josephine = cr;

  const advisors = recommended ? ["cullen", "josephine", "leliana"] : [];
  const prereq   = r.req.replace(/\s+/g, " ").trim();
  const tip      = r.tip.replace(/\s+/g, " ").trim();
  const level    = r.level.replace(/\s+/g, " ").trim();

  missions.push({
    id: slug(name),
    name,
    act: inferAct(prereq),
    category: inferCategory(name, prereq),
    region: inferRegion(prereq),
    prerequisites: prereq || null,
    power,
    advisors,
    time: Object.keys(time).length ? time : {},
    recommended,
    rewardsBy: Object.keys(rewardsBy).length ? rewardsBy : null,
    defaultRewards: null,
    outcome: null,
    notes: tip || null,
    levelUnlocked: (level && !/^None$/i.test(level)) ? level : null,
    tags: ["pdf-import"]
  });
}

// Dedupe by id (last write wins).
const byId = new Map();
for (const m of missions) byId.set(m.id, m);

// ---------------------------------------------------------------------------
// 4) Merge with existing wartable.js — preserve curated fields where richer.
// ---------------------------------------------------------------------------
const existingPath = path.join(ROOT, "js", "data", "wartable.js");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(existingPath, "utf8"), sandbox, { filename: "wartable.js" });
const existing = sandbox.window.DAI_WARTABLE || [];

const norm = s => String(s || "")
  .toLowerCase()
  .replace(/[‘’′]/g, "'")
  .replace(/\([^)]*\)/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const existingByNorm = new Map();
for (const m of existing) existingByNorm.set(norm(m.name), m);

const merged = [];
const used = new Set();

for (const e of existing) {
  const key = norm(e.name);
  // Find a PDF record whose normalized name matches or is a substring
  let pdf = null;
  for (const m of byId.values()) {
    const k = norm(m.name);
    if (k === key || (k.length > 8 && (key.includes(k) || k.includes(key)))) {
      pdf = m; break;
    }
  }
  if (pdf) used.add(pdf.id);

  // Preserve curated fields; let PDF fill prereq/power/time/recommended/rewardsBy/notes
  // when the existing record is missing them.
  const out = { ...e };
  if (pdf) {
    if (!out.prerequisites && pdf.prerequisites) out.prerequisites = pdf.prerequisites;
    if ((out.power == null || out.power === 0) && pdf.power)        out.power = pdf.power;
    if ((!out.time || Object.keys(out.time).length === 0) && pdf.time && Object.keys(pdf.time).length)
      out.time = pdf.time;
    if (!out.recommended && pdf.recommended)                        out.recommended = pdf.recommended;
    if ((!out.rewardsBy || Object.keys(out.rewardsBy || {}).length === 0) && pdf.rewardsBy)
      out.rewardsBy = pdf.rewardsBy;
    if (!out.notes && pdf.notes)                                    out.notes = pdf.notes;
    if (pdf.levelUnlocked && !out.levelUnlocked)                    out.levelUnlocked = pdf.levelUnlocked;
    out.tags = Array.from(new Set([...(out.tags || []), "pdf-verified"]));
  }
  merged.push(out);
}

// Append PDF-only records (not yet in the curated set).
for (const m of byId.values()) {
  if (used.has(m.id)) continue;
  // Avoid id collisions with curated entries.
  if (merged.some(x => x.id === m.id)) m.id = m.id + "-pdf";
  merged.push(m);
}

// ---------------------------------------------------------------------------
// 5) Serialize to wartable.js.
// ---------------------------------------------------------------------------
function jsLit(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number")  return String(v);
  if (typeof v === "boolean") return String(v);
  if (typeof v === "string")  return JSON.stringify(v);
  if (Array.isArray(v))       return "[" + v.map(jsLit).join(", ") + "]";
  if (typeof v === "object") {
    const entries = Object.entries(v).filter(([, val]) => val !== undefined);
    if (entries.length === 0) return "{}";
    return "{ " + entries.map(([k, val]) => k + ": " + jsLit(val)).join(", ") + " }";
  }
  return JSON.stringify(v);
}

function fmt(m) {
  const order = [
    "id", "name", "act", "category", "region",
    "prerequisites", "power", "advisors", "time", "recommended",
    "rewardsBy", "defaultRewards", "outcome", "notes", "levelUnlocked", "tags"
  ];
  const parts = [];
  for (const k of order) {
    if (!(k in m)) continue;
    const v = m[k];
    if (v === undefined) continue;
    if (v === null && (k === "rewardsBy" || k === "defaultRewards" || k === "outcome" || k === "notes" || k === "levelUnlocked" || k === "prerequisites")) continue;
    parts.push(k + ": " + jsLit(v));
  }
  return "  { " + parts.join(", ") + " }";
}

const header = `// DAI War Table operations.
// Curated mission set merged with the imported reference table from
// "DA-I war table missions (1).pdf". The community PDF is the source of
// truth for power costs, preferred specialists, and per-specialist
// rewards; curated entries retain richer act/category/outcome context.
//
// Schema:
//   id            unique slug
//   name          mission name as shown in-game
//   act           Prologue / Act 1 / Act 1+ / Act 2 / Act 3 / DLC: ...
//   category      story | region-unlock | recruit | approval | reward |
//                 choice | dlc | misc
//   region        related region id (or "war-table")
//   prerequisites string
//   power         power required (number)
//   time          { cullen?, josephine?, leliana? } in "h:mm"
//   advisors      array of advisor ids that can attempt
//   recommended   id of the optimal advisor (per PDF "preferred specialist")
//                 — Forces ↔ cullen, Connections ↔ josephine, Secrets ↔ leliana
//   rewardsBy     { advisorId: "what they get" }
//   notes         strategy / missable warnings (the "411" column from the PDF)
//   levelUnlocked level required to see the operation, or null
//   tags          free-form

window.DAI_WARTABLE = [
`;

const body = merged.map(fmt).join(",\n");
const footer = "\n];\n";
fs.writeFileSync(existingPath, header + body + footer);

console.log("Wrote", existingPath);
console.log("Existing curated:", existing.length);
console.log("PDF parsed:      ", byId.size);
console.log("Final merged:    ", merged.length);
