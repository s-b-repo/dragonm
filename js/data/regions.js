// Dragon Age: Inquisition regions / explorable maps.
// Source: Dragon Age Wiki, Fextralife, community guides.
//
// mapImage       optional URL to a primary in-game / community-hosted region map.
// mapImageLocal  optional path to a locally-bundled copy (used as failover).
//
// Render chain:
//   1) mapImage      — primary, hotlinked from game-maps.com (community fan map archive)
//   2) mapImageLocal — failover, served by GitHub Pages from this repo's maps/ folder
//   3) procedural    — final fallback, generated SVG from js/maps.js
//
// Pin coordinates are normalized (x,y in [0..1]) and overlay any backdrop, so all
// three render paths work with the same data.
window.DAI_REGIONS = [
  { id: "haven",            name: "Haven",                      act: "Prologue",
    notes: "Starting hub before Skyhold.",
    mapImage:      "https://game-maps.com/DAI/img/Frostback-Mountains-Haven.jpg",
    mapImageLocal: "maps/haven.jpg" },

  { id: "hinterlands",      name: "The Hinterlands",            act: "Act 1",
    notes: "Largest early-game region. Mage/Templar choice tie-in.",
    mapImage:      "https://game-maps.com/DAI/img/The-Hinterlands.jpg",
    mapImageLocal: "maps/hinterlands.jpg" },

  { id: "val_royeaux",      name: "Val Royeaux",                act: "Act 1",
    notes: "Orlesian capital hub. Limited exploration.",
    mapImage:      "https://game-maps.com/DAI/img/Val-Royeaux.jpg",
    mapImageLocal: "maps/val_royeaux.jpg" },

  { id: "storm_coast",      name: "The Storm Coast",            act: "Act 1",
    notes: "Bull's Chargers recruitment, dragon spawn.",
    mapImage:      "https://game-maps.com/DAI/img/The-Storm-Coast.jpg",
    mapImageLocal: "maps/storm_coast.jpg" },

  { id: "fallow_mire",      name: "The Fallow Mire",            act: "Act 1",
    notes: "Avvar boss + Fereldan soldiers questline.",
    mapImage:      "https://game-maps.com/DAI/img/The-Fallow-Mire.jpg",
    mapImageLocal: "maps/fallow_mire.jpg" },

  { id: "forbidden_oasis",  name: "The Forbidden Oasis",        act: "Act 1",
    notes: "Solasan temple — shard-keyed reward chambers.",
    mapImage:      "https://game-maps.com/DAI/img/Forbidden-Oasis.jpg",
    mapImageLocal: "maps/forbidden_oasis.jpg" },

  { id: "crestwood",        name: "Crestwood",                  act: "Act 1",
    notes: "Old Crestwood lies underwater until the lake is drained. No high dragon spawns here.",
    mapImage:      "https://game-maps.com/DAI/img/Crestwood.jpg",
    mapImageLocal: "maps/crestwood.jpg" },

  { id: "western_approach", name: "The Western Approach",       act: "Act 2",
    notes: "Adamant lead-in; Abyssal High Dragon.",
    mapImage:      "https://game-maps.com/DAI/img/The-Western-Approach.jpg",
    mapImageLocal: "maps/western_approach.jpg" },

  { id: "exalted_plains",   name: "The Exalted Plains",         act: "Act 2",
    notes: "Dalish camp; Gamordan Stormrider dragon.",
    mapImage:      "https://game-maps.com/DAI/img/The-Exalted-Plains.jpg",
    mapImageLocal: "maps/exalted_plains.jpg" },

  { id: "emerald_graves",   name: "The Emerald Graves",         act: "Act 2",
    notes: "Two dragons; Freemen of the Dales.",
    mapImage:      "https://game-maps.com/DAI/img/The-Emerald-Graves.jpg",
    mapImageLocal: "maps/emerald_graves.jpg" },

  { id: "emprise_du_lion",  name: "Emprise du Lion",            act: "Act 2",
    notes: "Three high dragons (Hivernal, Kaltenzahn, Highland Ravager) — the highest-level region in the base game.",
    mapImage:      "https://game-maps.com/DAI/img/Emprise-du-Lion.jpg",
    mapImageLocal: "maps/emprise_du_lion.jpg" },

  { id: "hissing_wastes",   name: "The Hissing Wastes",         act: "Act 2",
    notes: "Dwarven tombs; Sand-Reaver Wyvern, Sandy Howler dragon.",
    mapImage:      "https://game-maps.com/DAI/img/Hissing-Wastes.jpg",
    mapImageLocal: "maps/hissing_wastes.jpg" },

  { id: "skyhold",          name: "Skyhold",                    act: "Act 2",
    notes: "Inquisition headquarters. No region map — interior hub. Stylised view used.",
    mapImage:      null,
    mapImageLocal: null },

  { id: "arbor_wilds",      name: "The Arbor Wilds",            act: "Act 3",
    notes: "Linear story map. The accessible interior is the Temple of Mythal.",
    mapImage:      "https://game-maps.com/DAI/img/Temple-of-Mythal.jpg",
    mapImageLocal: "maps/arbor_wilds.jpg" },

  { id: "frostback_basin",  name: "Frostback Basin (Hakkon)",   act: "DLC",
    notes: "Jaws of Hakkon DLC. Hakkon Wintersbreath.",
    mapImage:      "https://game-maps.com/DAI/img/Frostback-Basin.jpg",
    mapImageLocal: "maps/frostback_basin.jpg" },

  { id: "deep_roads",       name: "The Deep Roads (Descent)",   act: "DLC",
    notes: "Descent DLC. Sha-Brytol dwarves; descent into a Titan. Stylised view used (no community-hosted region map yet).",
    mapImage:      null,
    mapImageLocal: null },

  { id: "darvaarad",        name: "The Darvaarad (Trespasser)", act: "DLC",
    notes: "Trespasser DLC. Story-driven. Stylised view used (no community-hosted region map yet).",
    mapImage:      null,
    mapImageLocal: null }
];
