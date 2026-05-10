#!/usr/bin/env node
// Validate data files in js/data/. Runs in CI before deploy.
// Loads the browser-shaped data files inside a vm sandbox (where they assign to
// `window.DAI_*`), then checks structural invariants. Exits non-zero on any error.

"use strict";

const fs   = require("fs");
const path = require("path");
const vm   = require("vm");

const ROOT     = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "js", "data");
const DATA_FILES = ["regions.js", "categories.js", "resources.js", "wartable.js"];

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// ---- Load data into a sandbox -----------------------------------------------
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of DATA_FILES) {
  const src = fs.readFileSync(path.join(DATA_DIR, f), "utf8");
  try {
    vm.runInContext(src, sandbox, { filename: f });
  } catch (e) {
    fail(`${f}: failed to evaluate (${e.message})`);
  }
}

const REGIONS    = sandbox.window.DAI_REGIONS    || [];
const CATEGORIES = sandbox.window.DAI_CATEGORIES || [];
const RARITY     = sandbox.window.DAI_RARITY     || [];
const RESOURCES  = sandbox.window.DAI_RESOURCES  || [];
const WT         = sandbox.window.DAI_WARTABLE   || [];

// ---- Reference sets that live in app.js (mirrored here intentionally) -------
const ADVISORS = new Set(["cullen", "josephine", "leliana"]);
const WT_CATEGORIES = new Set([
  "story", "region-unlock", "recruit", "approval",
  "reward", "choice", "dlc", "misc"
]);
const ACTS = new Set([
  "Prologue", "Act 1", "Act 1+", "Act 2", "Act 3",
  "DLC: Hakkon", "DLC: Descent", "DLC: Trespasser"
]);

// ---- Helpers ----------------------------------------------------------------
function uniqueIds(items, label) {
  const seen = new Map();
  for (const it of items) {
    if (!it || typeof it.id !== "string" || !it.id) {
      fail(`${label}: entry is missing a string \`id\``);
      continue;
    }
    if (seen.has(it.id)) {
      fail(`${label}: duplicate id "${it.id}"`);
    } else {
      seen.set(it.id, it);
    }
  }
  return seen;
}

function setOfIds(items) {
  return new Set(items.map(i => i && i.id).filter(Boolean));
}

// ---- Lookup tables ----------------------------------------------------------
uniqueIds(REGIONS,    "regions.js");
uniqueIds(CATEGORIES, "categories.js (DAI_CATEGORIES)");
uniqueIds(RARITY,     "categories.js (DAI_RARITY)");
const resourceIds = uniqueIds(RESOURCES, "resources.js");
const wtIds       = uniqueIds(WT,        "wartable.js");

const regionIds   = setOfIds(REGIONS);
const categoryIds = setOfIds(CATEGORIES);
const rarityIds   = setOfIds(RARITY);

// ---- Resource invariants ----------------------------------------------------
for (const r of RESOURCES) {
  if (!r) continue;
  const tag = `resources.js[${r.id || "?"}]`;
  if (!regionIds.has(r.region))     fail(`${tag}: unknown region "${r.region}"`);
  if (!categoryIds.has(r.category)) fail(`${tag}: unknown category "${r.category}"`);
  if (!rarityIds.has(r.rarity))     fail(`${tag}: unknown rarity "${r.rarity}"`);

  if (r.x !== undefined) {
    if (typeof r.x !== "number" || !(r.x >= 0 && r.x <= 1)) {
      fail(`${tag}: x must be a number in [0,1] (got ${r.x})`);
    }
  }
  if (r.y !== undefined) {
    if (typeof r.y !== "number" || !(r.y >= 0 && r.y <= 1)) {
      fail(`${tag}: y must be a number in [0,1] (got ${r.y})`);
    }
  }
  // x and y should travel together: if one is set, the other should be too.
  if ((r.x === undefined) !== (r.y === undefined)) {
    fail(`${tag}: x/y must be set together`);
  }

  if (r.tier !== undefined && (typeof r.tier !== "number" || r.tier < 1 || r.tier > 4)) {
    fail(`${tag}: tier must be 1..4 (got ${r.tier})`);
  }

  if (typeof r.name !== "string" || !r.name) {
    fail(`${tag}: missing \`name\``);
  }

  if (r.tags !== undefined && !Array.isArray(r.tags)) {
    fail(`${tag}: \`tags\` must be an array`);
  }
}

// ---- War Table invariants ---------------------------------------------------
const validWtRegion = new Set(regionIds); validWtRegion.add("war-table");

for (const m of WT) {
  if (!m) continue;
  const tag = `wartable.js[${m.id || "?"}]`;
  if (!validWtRegion.has(m.region))      fail(`${tag}: unknown region "${m.region}"`);
  if (!WT_CATEGORIES.has(m.category))    fail(`${tag}: unknown category "${m.category}"`);
  if (!ACTS.has(m.act))                  fail(`${tag}: unknown act "${m.act}"`);

  if (typeof m.name !== "string" || !m.name) {
    fail(`${tag}: missing \`name\``);
  }

  if (m.advisors !== undefined) {
    if (!Array.isArray(m.advisors)) {
      fail(`${tag}: \`advisors\` must be an array`);
    } else {
      for (const a of m.advisors) {
        if (!ADVISORS.has(a)) fail(`${tag}: unknown advisor "${a}"`);
      }
    }
  }

  if (m.recommended !== null && m.recommended !== undefined) {
    if (!ADVISORS.has(m.recommended)) {
      fail(`${tag}: recommended advisor "${m.recommended}" is not a known advisor`);
    } else if (Array.isArray(m.advisors) && !m.advisors.includes(m.recommended)) {
      fail(`${tag}: recommended "${m.recommended}" not in advisors [${m.advisors.join(", ")}]`);
    }
  }

  if (m.time !== undefined && m.time !== null) {
    if (typeof m.time !== "object" || Array.isArray(m.time)) {
      fail(`${tag}: \`time\` must be an object map`);
    } else {
      for (const a of Object.keys(m.time)) {
        if (!ADVISORS.has(a)) fail(`${tag}: time has unknown advisor key "${a}"`);
        if (typeof m.time[a] !== "string") fail(`${tag}: time.${a} must be a string`);
      }
    }
  }

  if (m.rewardsBy !== undefined && m.rewardsBy !== null) {
    if (typeof m.rewardsBy !== "object" || Array.isArray(m.rewardsBy)) {
      fail(`${tag}: \`rewardsBy\` must be an object map`);
    } else {
      for (const a of Object.keys(m.rewardsBy)) {
        if (!ADVISORS.has(a)) fail(`${tag}: rewardsBy has unknown advisor key "${a}"`);
      }
    }
  }

  if (m.power !== undefined && m.power !== null) {
    if (typeof m.power !== "number" || m.power < 0) {
      fail(`${tag}: power must be a non-negative number (got ${m.power})`);
    }
  }

  if (m.tags !== undefined && !Array.isArray(m.tags)) {
    fail(`${tag}: \`tags\` must be an array`);
  }
}

// ---- Soft warnings (don't fail the build) -----------------------------------
const usedCategories = new Set(RESOURCES.map(r => r.category));
for (const c of CATEGORIES) {
  if (!usedCategories.has(c.id)) warn(`category "${c.id}" is defined but unused by any resource`);
}

// ---- Report -----------------------------------------------------------------
const counts = {
  regions:    REGIONS.length,
  categories: CATEGORIES.length,
  rarity:     RARITY.length,
  resources:  RESOURCES.length,
  missions:   WT.length
};

if (warnings.length) {
  console.warn("Warnings:");
  for (const w of warnings) console.warn("  - " + w);
}

if (errors.length) {
  console.error("\nValidation failed (" + errors.length + " error" + (errors.length === 1 ? "" : "s") + "):");
  for (const e of errors) console.error("  - " + e);
  console.error("\nCounts: " + JSON.stringify(counts));
  process.exit(1);
}

console.log("Data validation passed.");
console.log("Counts: " + JSON.stringify(counts));
