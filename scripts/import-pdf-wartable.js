#!/usr/bin/env node
// Import: parse the layout-extracted text of "DA-I war table missions (1).pdf"
// and merge its records into js/data/wartable.js.
//
// Usage:
//   pdftotext -layout "DA-I war table missions (1).pdf" /tmp/dai-wt.txt
//   node scripts/import-pdf-wartable.js /tmp/dai-wt.txt
//
// PDF specialist → app advisor:
//   Forces      → cullen
//   Connections → josephine
//   Secrets     → leliana
//
// Parsing strategy
// ----------------
// Each "row group" in the PDF is an anchor line (the one with the
// digits-digits-Specialist signature) plus 0..N preceding "prefix" lines
// where one or more cells wrapped above the anchor.
//
// We parse the anchor first to find its name/req boundary AND the absolute
// start column of every post-specialist token (forces reward, secrets reward,
// connections reward, level unlocked, tip). Each prefix line is then sliced
// at the SAME absolute column positions and concatenated cell-by-cell. That
// way fragments only ever join with their own column — we don't smear "Mas"
// from one cell into "rwork" from another the way the previous parser did.

"use strict";

const fs   = require("fs");
const path = require("path");
const vm   = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SPEC_TO_ADVISOR = { Forces: "cullen", Connections: "josephine", Secrets: "leliana" };

// ---------------------------------------------------------------------------
// 1) Tokenize & parse one anchor line.
// ---------------------------------------------------------------------------
const ANCHOR_RE = /(\d+)\s+(\d+)\s+(Forces|Connections|Secrets|None)(?=\s{2,}|$)/g;

function tokensWithCols(s, baseCol) {
  // Yield {text, col} for each whitespace-separated cell in `s`.
  // A "cell boundary" is 2+ consecutive spaces.
  const out = [];
  let i = 0;
  while (i < s.length) {
    while (i < s.length && s[i] === " ") i++;
    if (i >= s.length) break;
    const start = i;
    while (i < s.length) {
      if (s[i] === " " && s[i + 1] === " ") break;
      i++;
    }
    out.push({ text: s.slice(start, i).trim(), col: baseCol + start });
  }
  return out;
}

function parseAnchor(line) {
  let bestMatch = null, m;
  ANCHOR_RE.lastIndex = 0;
  while ((m = ANCHOR_RE.exec(line))) {
    if (m.index >= 80 && m.index <= 110) { bestMatch = m; break; }
  }
  if (!bestMatch) return null;

  const specEndCol = bestMatch.index + bestMatch[0].length;
  const before     = line.slice(0, bestMatch.index);
  const after      = line.slice(specEndCol);

  // before contains: name + req. Tokenize into "cells" separated by 2+
  // spaces so a 1-space gap inside a long name (e.g. "Stop Venatori
  // Activity in the West Complete to scout...") doesn't get fused.
  const beforeTokens = tokensWithCols(before, 0);
  // Anything starting before col 36-ish is name; the rest is req.
  let nameEnd = 36;
  if (beforeTokens.length) {
    const firstAfter = beforeTokens.find(t => t.col >= 30);
    if (firstAfter) nameEnd = firstAfter.col;
    else nameEnd = beforeTokens[0].text.length;
  }
  // If the column found is way past the typical name col, fall back to
  // the nearest word boundary at or before col 36.
  if (nameEnd > 60) {
    const fb = before.lastIndexOf(" ", 36);
    nameEnd = fb > 0 ? fb : 36;
  }
  const name = before.slice(0, nameEnd).trim();
  const req  = before.slice(nameEnd).replace(/\s+\d+\s*$/, "").trim();

  // Tokenize after-spec at absolute columns:
  const tail = tokensWithCols(after, specEndCol + bestMatch[0].length);
  // Standard token layout: [fr, sr, cr, level, tip+]
  return {
    name, req,
    nameEnd,                // absolute col where the req column starts
    powerCol: bestMatch.index,
    power: parseInt(bestMatch[1], 10),
    tmin:  parseInt(bestMatch[2], 10),
    spec:  bestMatch[3],
    tail   // [{text, col}, ...]
  };
}

// ---------------------------------------------------------------------------
// 2) Walk the file: collect prefix lines, emit merged records.
// ---------------------------------------------------------------------------
const SECTION_RE = /(Operation\s+(Chain|Group|Plot)|^Dwarf$|^Elf$|^Human$|^Qunari$|^Blackwall$|^Cassandra$|^Cole$|^Cullen$|^Dorian$|^Iron Bull$|^Josephine$|^Leliana$|^Sera$|^Solas$|^Varric$|^Vivienne$|^The Iron Bull|^Sutherland|^Ser Barris|^The Crew|^The Bull|^Mage |^Templars|^Darkspawn|^Grey Wardens|^Kirkwall|^Kal-Sharok|^Crows|^Serault|^Executors|^Western Approach|^Wedding Alliances|^Michel de Chevin)/;

function isSectionHeader(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (parseAnchor(line)) return false;
  // Section headers have no other content beyond a short label at col 0.
  if (line.match(/^\s/)) return false; // not at col 0
  return SECTION_RE.test(trimmed);
}

function mergeRow(anchor, prefixLines) {
  // Standard tail layout: [fr, sr, cr, level, tip]. The anchor may not have
  // tokens for every cell. We synthesize placeholder columns so prefix-line
  // tokens still have a stable target — using interpolated column positions
  // from the cells we DO know about.
  const realTail = anchor.tail.slice();
  // Approximate canonical column positions (calibrated from pages where all
  // 5 cells are filled): fr ~143, sr ~165, cr ~185, level ~206, tip ~225.
  const CANONICAL = [143, 165, 185, 206, 225];
  // Try to map each real-tail token to a canonical slot by closest column.
  const cells = ["", "", "", "", ""];
  const filledCols = [null, null, null, null, null];
  for (const tk of realTail) {
    let bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < CANONICAL.length; i++) {
      if (filledCols[i] !== null) continue;
      const d = Math.abs(tk.col - CANONICAL[i]);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    cells[bestIdx] = tk.text;
    filledCols[bestIdx] = tk.col;
  }
  // colStarts uses real positions where known, canonical otherwise.
  const colStarts = filledCols.map((c, i) => c !== null ? c : CANONICAL[i]);

  let namePrefix = "", reqPrefix = "";
  // Per-cell prefix accumulators — appended in document order so wrapped
  // tokens stay in the order they appeared on the page.
  const cellPrefix = ["", "", "", "", ""];
  for (const p of prefixLines) {
    const nm = p.slice(0, anchor.nameEnd).trim();
    const rq = p.slice(anchor.nameEnd, anchor.powerCol).trim();
    if (nm && !rq)        namePrefix = (namePrefix + " " + nm).trim();
    else if (rq)          { reqPrefix = (reqPrefix + " " + rq).trim();
                            if (nm) namePrefix = (namePrefix + " " + nm).trim(); }

    const tokens = tokensWithCols(p.slice(anchor.powerCol), anchor.powerCol);
    for (const tk of tokens) {
      if (tk.col < colStarts[0] - 4) continue;
      let bestIdx = 0, bestDist = Infinity;
      for (let i = 0; i < colStarts.length; i++) {
        const d = Math.abs(tk.col - colStarts[i]);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      }
      cellPrefix[bestIdx] = (cellPrefix[bestIdx] + " " + tk.text).trim();
    }
  }
  for (let i = 0; i < 5; i++) {
    cells[i] = (cellPrefix[i] + " " + cells[i]).trim();
  }
  return {
    name: (namePrefix + " " + anchor.name).trim().replace(/\s+/g, " "),
    req:  (reqPrefix  + " " + anchor.req ).trim().replace(/\s+/g, " "),
    power: anchor.power,
    tmin:  anchor.tmin,
    spec:  anchor.spec,
    fr:    cells[0],
    sr:    cells[1],
    cr:    cells[2],
    level: cells[3],
    tip:   cells[4]
  };
}

const txtPath = process.argv[2] || "/tmp/dai-wt.txt";
const lines = fs.readFileSync(txtPath, "utf8").split("\n");

const records = [];
let pending = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (i < 2) continue;
  if (!line.trim())             { pending = []; continue; }
  if (isSectionHeader(line))    { pending = []; continue; }

  const anchor = parseAnchor(line);
  if (anchor) {
    records.push(mergeRow(anchor, pending));
    pending = [];
  } else {
    pending.push(line);
  }
}

// ---------------------------------------------------------------------------
// 3) Defensive cleanup of merged cells.
// ---------------------------------------------------------------------------
const FRAGMENT_RE = /^[a-z\)\(\.,]/; // value starts with lowercase / punctuation = likely truncated mid-word
function cleanReward(s) {
  if (!s) return null;
  let t = s.replace(/\s+/g, " ").trim();
  t = t.replace(/\s+(None|N\/A)$/i, "").trim();
  if (!t || /^(N\/A|None|—|-)$/i.test(t)) return null;
  // Reject anything that looks like a mid-word fragment.
  if (FRAGMENT_RE.test(t)) return null;
  // Reject super-short alpha fragments like "Los" / "ng" — real rewards
  // either start with a digit, or are a multi-word noun phrase.
  if (/^[A-Z][a-z]{1,3}$/.test(t)) return null;
  return t;
}
function cleanText(s) {
  if (!s) return null;
  let t = s.replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (FRAGMENT_RE.test(t)) return null;
  return t;
}

// ---------------------------------------------------------------------------
// 4) Map raw records → app schema.
// ---------------------------------------------------------------------------
function slug(s) {
  return ("wt-" + s.toLowerCase()
    .replace(/[‘’′]/g, "'")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, ""))
    .slice(0, 64);
}
function minToHMM(min) {
  if (!Number.isFinite(min) || min <= 0) return null;
  return Math.floor(min / 60) + ":" + String(min % 60).padStart(2, "0");
}

function inferAct(prereq) {
  const p = (prereq || "").toLowerCase();
  if (/trespasser/.test(p))                                      return "DLC: Trespasser";
  if (/hakkon/.test(p))                                          return "DLC: Hakkon";
  if (/descent|forgotten caverns|sha-brytol|titan/.test(p))      return "DLC: Descent";
  if (/halamshiral|wicked eyes|wicked hearts|here lies the abyss|adamant|skyhold|dorian|sera|cole|blackwall|josephine|leliana|cullen recruited/.test(p))
                                                                 return "Act 2";
  if (/in your heart shall burn|setback/.test(p))                return "Act 2";
  if (/breach|haven|threat remains|prologue/.test(p))            return "Prologue";
  if (/redcliffe|hinterlands|val royeaux|storm coast/.test(p))   return "Act 1";
  return "Act 2";
}
function inferRegion(prereq) {
  const p = (prereq || "").toLowerCase();
  for (const [needle, id] of [
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
  ]) if (p.includes(needle)) return id;
  return "war-table";
}
function inferCategory(name, prereq) {
  const t = (name + " " + (prereq || "")).toLowerCase();
  if (/judg(e|ment)/.test(t))                                                return "choice";
  if (/recruit|recruited/.test(t))                                           return "recruit";
  if (/capture|claim|capture[d]?\b/.test(t))                                 return "region-unlock";
  if (/resources?$|^.* resources/.test(t))                                   return "reward";
  if (/dlc|hakkon|descent|trespasser|titan/.test(t))                         return "dlc";
  if (/sided?|side with|alliance|approve|approval/.test(t))                  return "approval";
  if (/influence|gold|schematic|rune/.test(t))                               return "reward";
  if (/(\bunlock\b|\bopens?\b|\bscout\b)/.test(t))                           return "region-unlock";
  return "misc";
}

const missions = [];
for (const r of records) {
  if (!r) continue;
  const name = r.name.replace(/\s+/g, " ").trim();
  // Reject obviously-truncated single-word names.
  if (!name || name.length < 4) continue;
  // Reject anything that starts mid-word.
  if (FRAGMENT_RE.test(name)) continue;
  if (/^[a-z]/.test(name)) continue;

  const recommended = SPEC_TO_ADVISOR[r.spec] || null;
  const time = {};
  const t = minToHMM(r.tmin);
  if (t && recommended) time[recommended] = t;

  const rewardsBy = {};
  const fr = cleanReward(r.fr); if (fr) rewardsBy.cullen    = fr;
  const sr = cleanReward(r.sr); if (sr) rewardsBy.leliana   = sr;
  const cr = cleanReward(r.cr); if (cr) rewardsBy.josephine = cr;

  const advisors = recommended ? ["cullen", "josephine", "leliana"] : [];
  const prereq   = cleanText(r.req);
  const tip      = cleanText(r.tip);
  const level    = r.level && !/^None$/i.test(r.level) ? cleanText(r.level) : null;

  missions.push({
    id: slug(name),
    name,
    act: inferAct(prereq),
    category: inferCategory(name, prereq),
    region: inferRegion(prereq),
    prerequisites: prereq,
    power: r.power || 0,
    advisors,
    time: Object.keys(time).length ? time : {},
    recommended,
    rewardsBy: Object.keys(rewardsBy).length ? rewardsBy : null,
    defaultRewards: null,
    outcome: null,
    notes: tip,
    levelUnlocked: level,
    tags: ["pdf-import"]
  });
}

// Dedupe by id (last wins).
const byId = new Map();
for (const m of missions) byId.set(m.id, m);

// ---------------------------------------------------------------------------
// 5) Merge with curated wartable.js.
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

const merged = [];
const used = new Set();

for (const e of existing) {
  const key = norm(e.name);
  let pdf = null;
  for (const m of byId.values()) {
    const k = norm(m.name);
    if (k === key || (k.length > 8 && (key.includes(k) || k.includes(key)))) {
      pdf = m; break;
    }
  }
  if (pdf) used.add(pdf.id);

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

for (const m of byId.values()) {
  if (used.has(m.id)) continue;
  if (merged.some(x => x.id === m.id)) m.id = m.id + "-pdf";
  merged.push(m);
}

// ---------------------------------------------------------------------------
// 6) Serialize.
// ---------------------------------------------------------------------------
function jsLit(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number")  return String(v);
  if (typeof v === "boolean") return String(v);
  if (typeof v === "string")  return JSON.stringify(v);
  if (Array.isArray(v))       return "[" + v.map(jsLit).join(", ") + "]";
  if (typeof v === "object") {
    const e = Object.entries(v).filter(([, val]) => val !== undefined);
    if (e.length === 0) return "{}";
    return "{ " + e.map(([k, val]) => k + ": " + jsLit(val)).join(", ") + " }";
  }
  return JSON.stringify(v);
}
function fmt(m) {
  const order = ["id","name","act","category","region","prerequisites","power","advisors","time","recommended","rewardsBy","defaultRewards","outcome","notes","levelUnlocked","tags"];
  const parts = [];
  for (const k of order) {
    if (!(k in m)) continue;
    const v = m[k];
    if (v === undefined) continue;
    if (v === null && ["rewardsBy","defaultRewards","outcome","notes","levelUnlocked","prerequisites"].includes(k)) continue;
    parts.push(k + ": " + jsLit(v));
  }
  return "  { " + parts.join(", ") + " }";
}

const header = `// DAI War Table operations.
// Curated mission set merged with the imported reference table from
// "DA-I war table missions (1).pdf". The PDF supplies power costs,
// preferred specialists, and per-specialist rewards; the curated
// entries retain richer act/category/outcome context and override
// the PDF where they conflict.
//
// Specialist mapping: Forces ↔ cullen, Connections ↔ josephine,
//                     Secrets ↔ leliana.
//
// Schema:
//   id            unique slug
//   name          mission name as shown in-game
//   act           Prologue / Act 1 / Act 1+ / Act 2 / Act 3 / DLC: ...
//   category      story | region-unlock | recruit | approval | reward |
//                 choice | dlc | misc
//   region        related region id (or "war-table")
//   prerequisites string
//   power         power cost (number)
//   time          { cullen?, josephine?, leliana? } in "h:mm"
//   advisors      array of advisor ids that can attempt
//   recommended   id of the optimal advisor (per PDF "preferred specialist")
//   rewardsBy     { advisorId: "what they get" }
//   notes         strategy / missable warnings (the "411" column from the PDF)
//   levelUnlocked level / region required to see the operation, or null
//   tags          free-form

window.DAI_WARTABLE = [
`;
fs.writeFileSync(existingPath, header + merged.map(fmt).join(",\n") + "\n];\n");

console.log("Wrote",      existingPath);
console.log("Curated:",   existing.length);
console.log("PDF parsed:", byId.size);
console.log("Final:",     merged.length);
