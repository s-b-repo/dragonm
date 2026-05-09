// DAI Resource locations.
// Coordinates are NORMALIZED (x,y in [0..1]) so any map image aspect ratio works.
// Coordinates are best-effort approximations from community guides and should be
// refined by users overlaying their own in-game map screenshots.
//
// Sources: Dragon Age Wiki (dragonage.fandom.com), Fextralife DAI wiki,
// /r/dragonage compiled lists, GameFAQs guides, and BSN archive threads.
//
// Schema:
//   id        unique slug
//   name      display name
//   region    region id (see regions.js)
//   category  category id (see categories.js)
//   rarity    rarity id (see categories.js DAI_RARITY)
//   x, y      normalized map coords (0..1) — placeholder centroids per node cluster
//   tier      crafting tier 1-4 where applicable
//   desc      short description
//   source    how to acquire / where exactly per public guides
//   tags      free-form search tags

window.DAI_RESOURCES = [
  // ============================================================
  // HINTERLANDS
  // ============================================================
  { id: "hin-iron-1",      name: "Iron",                  region: "hinterlands", category: "metal",   rarity: "common",   tier: 1, x: 0.38, y: 0.55, desc: "Iron ore deposits — ~30+ nodes scattered.", source: "Mostly south of the Outskirts Camp and along the Hafter river.", tags:["mining","metal","iron"] },
  { id: "hin-iron-2",      name: "Iron (Forest Camp)",    region: "hinterlands", category: "metal",   rarity: "common",   tier: 1, x: 0.55, y: 0.30, desc: "Iron node cluster.", source: "Forest Camp area — uphill paths.", tags:["mining","metal"] },
  { id: "hin-elfroot-1",   name: "Elfroot",               region: "hinterlands", category: "herb",    rarity: "common",   tier: 1, x: 0.40, y: 0.50, desc: "Common potion ingredient. Dozens of bushes.", source: "Throughout the region; densest near refugee camp and Lake Luthias.", tags:["herb","potion"] },
  { id: "hin-spindle-1",   name: "Spindleweed",           region: "hinterlands", category: "herb",    rarity: "uncommon", tier: 2, x: 0.30, y: 0.45, desc: "Used in regen potions and tonics.", source: "Wet shorelines around Lake Luthias and southern marshes.", tags:["herb","spindle"] },
  { id: "hin-bloodlotus-1",name: "Blood Lotus",           region: "hinterlands", category: "herb",    rarity: "uncommon", tier: 2, x: 0.32, y: 0.62, desc: "Rare aquatic herb.", source: "South Reach pond and stream beds.", tags:["herb"] },
  { id: "hin-embrium-1",   name: "Embrium",               region: "hinterlands", category: "herb",    rarity: "uncommon", tier: 2, x: 0.45, y: 0.40, desc: "Used in lyrium potions.", source: "Hills above the Crossroads.", tags:["herb"] },
  { id: "hin-druffalo-1",  name: "Druffalo Hide",         region: "hinterlands", category: "leather", rarity: "common",   tier: 1, x: 0.42, y: 0.48, desc: "Dropped by druffalo herds.", source: "Calenhad farmland and Outskirts.", tags:["leather","hide"] },
  { id: "hin-ramleather-1",name: "Ram Leather",           region: "hinterlands", category: "leather", rarity: "common",   tier: 1, x: 0.50, y: 0.32, desc: "Dropped by rams.", source: "Hilly forests south of the Crossroads.", tags:["leather"] },
  { id: "hin-cotton-1",    name: "Cotton",                region: "hinterlands", category: "cloth",   rarity: "common",   tier: 1, x: 0.36, y: 0.58, desc: "Cloth resource.", source: "Cotton plants near refugee camps.", tags:["cloth"] },
  { id: "hin-logging-1",   name: "Logging Stand",         region: "hinterlands", category: "wood",    rarity: "common",   tier: 1, x: 0.55, y: 0.40, desc: "Trees marked for harvest by Inquisition camps.", source: "Several near every camp; required for upgrades.", tags:["wood","logging"] },
  { id: "hin-shard-1",     name: "Shard #1",              region: "hinterlands", category: "shard",   rarity: "rare",     tier: 2, x: 0.28, y: 0.55, desc: "1 of 5 shards in Hinterlands.", source: "Near the entrance to Valammar (West Road).", tags:["shard","collectible"] },
  { id: "hin-shard-2",     name: "Shard #2",              region: "hinterlands", category: "shard",   rarity: "rare",     tier: 2, x: 0.43, y: 0.20, desc: "Shard.", source: "Atop a ridge north of Forest Camp.", tags:["shard"] },
  { id: "hin-shard-3",     name: "Shard #3",              region: "hinterlands", category: "shard",   rarity: "rare",     tier: 2, x: 0.62, y: 0.50, desc: "Shard.", source: "Mountain ridge east of Dusklight Camp.", tags:["shard"] },
  { id: "hin-shard-4",     name: "Shard #4",              region: "hinterlands", category: "shard",   rarity: "rare",     tier: 2, x: 0.50, y: 0.65, desc: "Shard.", source: "South of the Dwarven Ruins entrance.", tags:["shard"] },
  { id: "hin-shard-5",     name: "Shard #5",              region: "hinterlands", category: "shard",   rarity: "rare",     tier: 2, x: 0.34, y: 0.74, desc: "Shard.", source: "South Reach — south end of the map.", tags:["shard"] },
  { id: "hin-astra-1",     name: "Astrarium of the Hinterlands", region:"hinterlands", category:"astrarium", rarity:"unique", x:0.39, y:0.30, desc:"One of 8 base-game astrariums. Reward at Lakeshore Cave.", source: "Hills north of the Crossroads. Solve all three to reveal a cave west of Lake Luthias.", tags:["astrarium","puzzle"] },
  { id: "hin-dragon-fereldan", name:"Fereldan Frostback",  region:"hinterlands", category:"dragon", rarity:"unique", x:0.62, y:0.78, desc:"Level 12 high dragon — the iconic intro dragon.", source:"Lady Shayna's Valley in the southern Hinterlands.", tags:["dragon","boss"] },
  { id: "hin-agent-blackwall", name:"Blackwall (recruit)", region:"hinterlands", category:"agent", rarity:"unique", x:0.30, y:0.60, desc:"Companion warrior — Grey Warden.", source:"Lake Luthias — quest 'The Lone Warden'.", tags:["agent","companion"] },
  { id: "hin-agent-horsemaster", name:"Horsemaster Dennet",region:"hinterlands", category:"agent", rarity:"unique", x:0.40, y:0.42, desc:"Mount provider for Inquisition.", source:"Redcliffe Farms — clear nearby threats first.", tags:["agent","mount"] },
  { id: "hin-quest-templars",  name:"Templars / Mages choice", region:"hinterlands", category:"quest", rarity:"unique", x:0.20, y:0.45, desc:"Sets up 'In Hushed Whispers' or 'Champions of the Just'.", source:"Speak to Mother Giselle at the Crossroads.", tags:["quest","story"] },

  // ============================================================
  // STORM COAST
  // ============================================================
  { id: "sto-iron-1",      name: "Iron",                  region: "storm_coast", category: "metal",   rarity: "common",   tier: 1, x: 0.40, y: 0.55, desc: "Iron deposits.", source: "Coastal cliffs and inland paths.", tags:["mining","metal"] },
  { id: "sto-silverite-1", name: "Silverite",             region: "storm_coast", category: "metal",   rarity: "uncommon", tier: 2, x: 0.55, y: 0.30, desc: "Mid-tier metal.", source: "Inland highlands and cave entrances.", tags:["mining","metal","silverite"] },
  { id: "sto-obsidian-1",  name: "Obsidian",              region: "storm_coast", category: "metal",   rarity: "uncommon", tier: 2, x: 0.62, y: 0.45, desc: "Volcanic glass — utility metal.", source: "Caves and cliff bases in the eastern Coast.", tags:["mining","metal"] },
  { id: "sto-elfroot-1",   name: "Royal Elfroot",         region: "storm_coast", category: "herb",    rarity: "rare",     tier: 3, x: 0.30, y: 0.65, desc: "Higher-tier elfroot variant.", source: "Caves on the Storm Coast.", tags:["herb","royal"] },
  { id: "sto-spindle-1",   name: "Spindleweed",           region: "storm_coast", category: "herb",    rarity: "uncommon", tier: 2, x: 0.42, y: 0.62, desc: "Wet-soil herb.", source: "Coastal bogs.", tags:["herb"] },
  { id: "sto-rams-1",      name: "Ram Leather",           region: "storm_coast", category: "leather", rarity: "common",   tier: 1, x: 0.48, y: 0.50, desc: "Common drop.", source: "Inland herds.", tags:["leather"] },
  { id: "sto-bear-1",      name: "Great Bear Hide",       region: "storm_coast", category: "leather", rarity: "uncommon", tier: 2, x: 0.55, y: 0.60, desc: "Bear leather.", source: "Inland forest paths.", tags:["leather"] },
  { id: "sto-cotton-1",    name: "Cotton",                region: "storm_coast", category: "cloth",   rarity: "common",   tier: 1, x: 0.45, y: 0.55, desc: "Cloth.", source: "Coastal plants.", tags:["cloth"] },
  { id: "sto-shard-1",     name: "Shard #1",              region: "storm_coast", category: "shard",   rarity: "rare",     tier: 2, x: 0.25, y: 0.40, desc: "Shard.", source: "Northern shoreline near Driftwood Margin.", tags:["shard"] },
  { id: "sto-shard-2",     name: "Shard #2",              region: "storm_coast", category: "shard",   rarity: "rare",     tier: 2, x: 0.50, y: 0.30, desc: "Shard.", source: "Cliffs above Driftwood Margin.", tags:["shard"] },
  { id: "sto-shard-3",     name: "Shard #3",              region: "storm_coast", category: "shard",   rarity: "rare",     tier: 2, x: 0.65, y: 0.55, desc: "Shard.", source: "Eastern cliff path.", tags:["shard"] },
  { id: "sto-shard-4",     name: "Shard #4",              region: "storm_coast", category: "shard",   rarity: "rare",     tier: 2, x: 0.40, y: 0.75, desc: "Shard.", source: "Southern Coast above the Pirate's Cove area.", tags:["shard"] },
  { id: "sto-astra-1",     name: "Astrarium of the Storm Coast", region:"storm_coast", category:"astrarium", rarity:"unique", x:0.55, y:0.42, desc:"Storm Coast astrarium. Reward cave on the western coast.", source:"Three constellations — uplands inland from Driftwood.", tags:["astrarium"] },
  { id: "sto-dragon-vinsomer",name:"Vinsomer",             region:"storm_coast", category:"dragon", rarity:"unique", x:0.78, y:0.18, desc:"Level 19 high dragon (electric).", source:"Dragon Island — accessible only after the Iron Bull questline.", tags:["dragon"] },
  { id: "sto-agent-bull",  name:"The Iron Bull (recruit)", region:"storm_coast", category:"agent", rarity:"unique", x:0.50, y:0.40, desc:"Qunari mercenary — companion.", source:"Bull's Chargers introduction at the coast battlefield.", tags:["agent","companion"] },

  // ============================================================
  // CRESTWOOD
  // ============================================================
  { id: "cre-iron-1",      name: "Iron",                  region: "crestwood",  category: "metal",   rarity: "common",   tier: 1, x: 0.40, y: 0.55, desc:"Iron nodes.", source:"Throughout — many along Old Crestwood after draining the lake.", tags:["mining","metal"] },
  { id: "cre-silverite-1", name: "Silverite",             region: "crestwood",  category: "metal",   rarity: "uncommon", tier: 2, x: 0.55, y: 0.40, desc:"Silverite deposits.", source:"Caves Three Trout Farm area.", tags:["mining","metal"] },
  { id: "cre-elfroot-1",   name: "Royal Elfroot",         region: "crestwood",  category: "herb",    rarity: "rare",     tier: 3, x: 0.32, y: 0.58, desc:"Drained-lake harvest.", source:"Old Crestwood after Still Waters quest.", tags:["herb"] },
  { id: "cre-velvet-1",    name: "Plush Fustian Velvet",  region: "crestwood",  category: "cloth",   rarity: "rare",     tier: 3, x: 0.60, y: 0.30, desc:"High-tier cloth.", source:"Drops from Caer Bronach quartermaster cache and merchant.", tags:["cloth","tier3"] },
  { id: "cre-shard-1",     name: "Shard #1",              region: "crestwood",  category: "shard",   rarity: "rare",     tier: 2, x: 0.45, y: 0.30, desc:"Shard.", source:"Cliffside near Caer Bronach.", tags:["shard"] },
  { id: "cre-shard-2",     name: "Shard #2",              region: "crestwood",  category: "shard",   rarity: "rare",     tier: 2, x: 0.65, y: 0.50, desc:"Shard.", source:"Eastern hills.", tags:["shard"] },
  { id: "cre-shard-3",     name: "Shard #3",              region: "crestwood",  category: "shard",   rarity: "rare",     tier: 2, x: 0.30, y: 0.40, desc:"Shard.", source:"Western forest.", tags:["shard"] },
  { id: "cre-shard-4",     name: "Shard #4",              region: "crestwood",  category: "shard",   rarity: "rare",     tier: 2, x: 0.55, y: 0.70, desc:"Shard.", source:"South of Old Crestwood (post-drain).", tags:["shard"] },
  { id: "cre-astra-1",     name: "Astrarium of Crestwood", region:"crestwood", category:"astrarium", rarity:"unique", x:0.42, y:0.35, desc:"Reward in cave near Caer Bronach.", source:"Three constellations spread across the region.", tags:["astrarium"] },
  { id: "cre-dragon-ravager", name:"Highland Ravager",   region:"crestwood",  category:"dragon", rarity:"unique", x:0.70, y:0.20, desc:"Level 17 high dragon.", source:"Cradle of Sulevin / north Crestwood ruins.", tags:["dragon"] },
  { id: "cre-quest-stillwaters", name:"Still Waters",    region:"crestwood",  category:"quest", rarity:"unique", x:0.40, y:0.50, desc:"Drain the lake to reveal Old Crestwood.", source:"Activate the dam controls in the dwarven ruin.", tags:["quest","story"] },
  { id: "cre-mosaic-archive-1", name:"Archive of the Inquisitor — Piece", region:"crestwood", category:"mosaic", rarity:"uncommon", x:0.50, y:0.45, desc:"Mosaic fragment.", source:"Multiple pieces hidden in caves and hilltops.", tags:["mosaic","collectible"] },

  // ============================================================
  // FORBIDDEN OASIS
  // ============================================================
  { id: "oas-iron-1",      name: "Iron",                  region: "forbidden_oasis", category:"metal", rarity:"common",   tier:1, x:0.45, y:0.55, desc:"Iron.", source:"Dunes around Solasan.", tags:["mining","metal"] },
  { id: "oas-silverite-1", name: "Silverite",             region: "forbidden_oasis", category:"metal", rarity:"uncommon", tier:2, x:0.55, y:0.40, desc:"Silverite.", source:"Hilltop nodes.", tags:["mining"] },
  { id: "oas-shard-tier",  name: "Shards (all)",          region: "forbidden_oasis", category:"shard", rarity:"rare",     tier:2, x:0.50, y:0.50, desc:"Some of the 130+ shards across the world unlock Solasan rooms here.", source:"Forbidden Oasis is the central temple — Solasan. Bring shards to unlock chambers.", tags:["shard","temple","solasan"] },
  { id: "oas-quest-jaws",  name: "What Pride Had Wrought", region:"forbidden_oasis", category:"quest", rarity:"unique", x:0.50, y:0.50, desc:"Solasan temple-clearing main quest.", source:"Talk to Frederic; clear all chambers (requires shards).", tags:["quest","temple"] },
  { id: "oas-codex-solas", name:"Pre-Veil temple notes",   region:"forbidden_oasis", category:"codex", rarity:"uncommon", x:0.48, y:0.48, desc:"Lore on the elven origins.", source:"Inside Solasan after entering the chambers.", tags:["codex","lore"] },

  // ============================================================
  // FALLOW MIRE
  // ============================================================
  { id: "fal-iron-1",      name: "Iron",                  region: "fallow_mire", category:"metal",   rarity:"common",   tier:1, x:0.40, y:0.55, desc:"Iron.", source:"Marshlands.", tags:["mining"] },
  { id: "fal-silverite-1", name: "Silverite",             region: "fallow_mire", category:"metal",   rarity:"uncommon", tier:2, x:0.55, y:0.40, desc:"Silverite.", source:"Hilltops above the swamp.", tags:["mining"] },
  { id: "fal-bloodlotus-1",name: "Blood Lotus",           region: "fallow_mire", category:"herb",    rarity:"uncommon", tier:2, x:0.42, y:0.58, desc:"Wet herb.", source:"Marsh waters — many.", tags:["herb"] },
  { id: "fal-deepmushroom",name: "Deep Mushroom",         region: "fallow_mire", category:"herb",    rarity:"common",   tier:1, x:0.30, y:0.45, desc:"Used in tonics.", source:"Caves and shaded areas.", tags:["herb"] },
  { id: "fal-quest-soldiers",name:"Captured Inquisition Soldiers", region:"fallow_mire", category:"quest", rarity:"unique", x:0.55, y:0.65, desc:"Defeat the Avvar Hand.", source:"Hargol the Hand boss in Hargol's Stronghold.", tags:["quest","avvar"] },

  // ============================================================
  // WESTERN APPROACH
  // ============================================================
  { id: "wes-silverite-1", name: "Silverite",             region:"western_approach", category:"metal", rarity:"uncommon", tier:2, x:0.40, y:0.55, desc:"Silverite.", source:"Canyons and ridges.", tags:["mining"] },
  { id: "wes-stormheart-1",name: "Stormheart",            region:"western_approach", category:"metal", rarity:"rare",     tier:3, x:0.55, y:0.30, desc:"Tier-3 metal.", source:"Lava-adjacent ridges; also drops from Ataashi quarry.", tags:["mining","tier3"] },
  { id: "wes-velvet-1",    name: "Plush Fustian Velvet",  region:"western_approach", category:"cloth", rarity:"rare",     tier:3, x:0.60, y:0.50, desc:"Tier-3 cloth.", source:"Wagons and caravan wreckage; Coracavus.", tags:["cloth","tier3"] },
  { id: "wes-snoufleur-1", name: "Snoufleur Skin",        region:"western_approach", category:"leather",rarity:"uncommon", tier:2, x:0.45, y:0.40, desc:"Snoufleur drops.", source:"Northern sands — Snoufleurs roam in packs.", tags:["leather"] },
  { id: "wes-shard-1",     name: "Shard #1",              region:"western_approach", category:"shard", rarity:"rare",     tier:2, x:0.30, y:0.30, desc:"Shard.", source:"NW dunes.", tags:["shard"] },
  { id: "wes-shard-2",     name: "Shard #2",              region:"western_approach", category:"shard", rarity:"rare",     tier:2, x:0.55, y:0.50, desc:"Shard.", source:"On the bridge near Lost Spring Canyon.", tags:["shard"] },
  { id: "wes-shard-3",     name: "Shard #3",              region:"western_approach", category:"shard", rarity:"rare",     tier:2, x:0.70, y:0.25, desc:"Shard.", source:"Coracavus rooftop.", tags:["shard"] },
  { id: "wes-shard-4",     name: "Shard #4",              region:"western_approach", category:"shard", rarity:"rare",     tier:2, x:0.40, y:0.70, desc:"Shard.", source:"South canyon walls.", tags:["shard"] },
  { id: "wes-shard-5",     name: "Shard #5",              region:"western_approach", category:"shard", rarity:"rare",     tier:2, x:0.65, y:0.65, desc:"Shard.", source:"Dragon ridge to the east.", tags:["shard"] },
  { id: "wes-astra-1",     name: "Astrarium of the Western Approach", region:"western_approach", category:"astrarium", rarity:"unique", x:0.50, y:0.45, desc:"Reward cave near Echo Back Canyon.", source:"Three constellations across the dunes.", tags:["astrarium"] },
  { id: "wes-dragon-abyssal", name:"Abyssal High Dragon", region:"western_approach", category:"dragon", rarity:"unique", x:0.75, y:0.55, desc:"Level 13 high dragon (fire).", source:"Roar Canyon — one of the easier dragons.", tags:["dragon"] },
  { id: "wes-quest-here-lies", name:"Here Lies the Abyss (lead-in)", region:"western_approach", category:"quest", rarity:"unique", x:0.50, y:0.40, desc:"Adamant Fortress assault setup.", source:"Investigate Warden ritual sites.", tags:["quest","story","adamant"] },

  // ============================================================
  // EXALTED PLAINS
  // ============================================================
  { id: "exa-iron-1",      name: "Iron",                  region:"exalted_plains", category:"metal", rarity:"common",   tier:1, x:0.40, y:0.55, desc:"Iron.", source:"Battlefield ruins.", tags:["mining"] },
  { id: "exa-silverite-1", name:"Silverite",              region:"exalted_plains", category:"metal", rarity:"uncommon", tier:2, x:0.50, y:0.40, desc:"Silverite.", source:"Hill ridges.", tags:["mining"] },
  { id: "exa-dawnstone-1", name:"Dawnstone",              region:"exalted_plains", category:"metal", rarity:"rare",     tier:3, x:0.60, y:0.45, desc:"Tier-3 metal — Sundered Lands.", source:"Northern Sundered Lands ridges.", tags:["mining","tier3"] },
  { id: "exa-elfroot-1",   name:"Royal Elfroot",          region:"exalted_plains", category:"herb",  rarity:"rare",     tier:3, x:0.55, y:0.55, desc:"Royal elfroot harvest.", source:"Mossy Var Bellanaris woods.", tags:["herb"] },
  { id: "exa-prophets-1",  name:"Prophet's Laurel",       region:"exalted_plains", category:"herb",  rarity:"rare",     tier:3, x:0.32, y:0.45, desc:"Used in master regen potions.", source:"Stone outcrops near the Dalish camp.", tags:["herb"] },
  { id: "exa-velvet-1",    name:"Plush Fustian Velvet",   region:"exalted_plains", category:"cloth", rarity:"rare",     tier:3, x:0.55, y:0.30, desc:"Tier-3 cloth.", source:"Drops from Freemen of the Dales captains.", tags:["cloth"] },
  { id: "exa-shard-1",     name:"Shard #1",               region:"exalted_plains", category:"shard", rarity:"rare",     tier:2, x:0.25, y:0.30, desc:"Shard.", source:"NW battlements.", tags:["shard"] },
  { id: "exa-shard-2",     name:"Shard #2",               region:"exalted_plains", category:"shard", rarity:"rare",     tier:2, x:0.50, y:0.20, desc:"Shard.", source:"On a tower near Citadelle du Corbeau.", tags:["shard"] },
  { id: "exa-shard-3",     name:"Shard #3",               region:"exalted_plains", category:"shard", rarity:"rare",     tier:2, x:0.70, y:0.55, desc:"Shard.", source:"Var Bellanaris cliffs.", tags:["shard"] },
  { id: "exa-shard-4",     name:"Shard #4",               region:"exalted_plains", category:"shard", rarity:"rare",     tier:2, x:0.40, y:0.70, desc:"Shard.", source:"South corner of the Sundered Lands.", tags:["shard"] },
  { id: "exa-astra-1",     name:"Astrarium of the Exalted Plains", region:"exalted_plains", category:"astrarium", rarity:"unique", x:0.42, y:0.40, desc:"Reward cave at Path of Flame.", source:"Three constellations across battlefields.", tags:["astrarium"] },
  { id: "exa-dragon-storm",name:"Gamordan Stormrider",    region:"exalted_plains", category:"dragon", rarity:"unique", x:0.78, y:0.40, desc:"Level 14 high dragon (electric).", source:"East cliffs of the Sundered Lands.", tags:["dragon"] },
  { id: "exa-quest-bones", name:"Restoration of the Plains", region:"exalted_plains", category:"quest", rarity:"unique", x:0.50, y:0.50, desc:"Burn corpses, raise camps, restore order.", source:"Multiple stages following the Dalish camp arrival.", tags:["quest","story"] },

  // ============================================================
  // EMERALD GRAVES
  // ============================================================
  { id: "eme-iron-1",      name:"Iron",                   region:"emerald_graves", category:"metal", rarity:"common",   tier:1, x:0.40, y:0.55, desc:"Iron.", source:"Forest ridges.", tags:["mining"] },
  { id: "eme-silverite-1", name:"Silverite",              region:"emerald_graves", category:"metal", rarity:"uncommon", tier:2, x:0.50, y:0.40, desc:"Silverite.", source:"Cliff ledges.", tags:["mining"] },
  { id: "eme-everite-1",   name:"Everite",                region:"emerald_graves", category:"metal", rarity:"rare",     tier:3, x:0.60, y:0.45, desc:"Tier-3 metal.", source:"Caves under giant trees.", tags:["mining","tier3"] },
  { id: "eme-bloodstone-1",name:"Bloodstone",             region:"emerald_graves", category:"metal", rarity:"rare",     tier:3, x:0.30, y:0.55, desc:"Tier-3 metal.", source:"Northern grave-fields.", tags:["mining","tier3"] },
  { id: "eme-velvet-1",    name:"Plush Fustian Velvet",   region:"emerald_graves", category:"cloth", rarity:"rare",     tier:3, x:0.55, y:0.30, desc:"Tier-3 cloth.", source:"Freemen merchant caches.", tags:["cloth"] },
  { id: "eme-loden-1",     name:"Dales Loden Wool",       region:"emerald_graves", category:"cloth", rarity:"rare",     tier:3, x:0.35, y:0.42, desc:"Tier-3 wool.", source:"Sheep pastures west of the Watcher's Reach.", tags:["cloth","tier3"] },
  { id: "eme-greatbear-1", name:"Great Bear Hide",        region:"emerald_graves", category:"leather", rarity:"uncommon", tier:2, x:0.42, y:0.58, desc:"Hide.", source:"Forest bears.", tags:["leather"] },
  { id: "eme-shard-1",     name:"Shard #1",               region:"emerald_graves", category:"shard", rarity:"rare",     tier:2, x:0.25, y:0.30, desc:"Shard.", source:"NW cliffs.", tags:["shard"] },
  { id: "eme-shard-2",     name:"Shard #2",               region:"emerald_graves", category:"shard", rarity:"rare",     tier:2, x:0.55, y:0.25, desc:"Shard.", source:"Atop Watcher's Reach.", tags:["shard"] },
  { id: "eme-shard-3",     name:"Shard #3",               region:"emerald_graves", category:"shard", rarity:"rare",     tier:2, x:0.70, y:0.50, desc:"Shard.", source:"Eastern bridge.", tags:["shard"] },
  { id: "eme-shard-4",     name:"Shard #4",               region:"emerald_graves", category:"shard", rarity:"rare",     tier:2, x:0.45, y:0.75, desc:"Shard.", source:"South of Argon's Lodge.", tags:["shard"] },
  { id: "eme-astra-1",     name:"Astrarium of the Emerald Graves", region:"emerald_graves", category:"astrarium", rarity:"unique", x:0.48, y:0.45, desc:"Reward cave near the Watcher's Reach.", source:"Solve all three.", tags:["astrarium"] },
  { id: "eme-dragon-greater",name:"Greater Mistral",      region:"emerald_graves", category:"dragon", rarity:"unique", x:0.30, y:0.30, desc:"Level 16 high dragon (electric).", source:"NW corner — Direstone area.", tags:["dragon"] },
  { id: "eme-dragon-northern",name:"Northern Hunter",     region:"emerald_graves", category:"dragon", rarity:"unique", x:0.70, y:0.30, desc:"Level 15 high dragon (cold).", source:"Eastern Direstone.", tags:["dragon"] },
  { id: "eme-quest-freemen",name:"The Freemen of the Dales", region:"emerald_graves", category:"quest", rarity:"unique", x:0.50, y:0.50, desc:"Multi-stage rebel takedown.", source:"Argon's Lodge → Lion's Pavilion etc.", tags:["quest"] },

  // ============================================================
  // EMPRISE DU LION
  // ============================================================
  { id: "emp-iron-1",      name:"Iron",                   region:"emprise_du_lion", category:"metal", rarity:"common",   tier:1, x:0.40, y:0.55, desc:"Iron.", source:"Snowy ridges.", tags:["mining"] },
  { id: "emp-silverite-1", name:"Silverite",              region:"emprise_du_lion", category:"metal", rarity:"uncommon", tier:2, x:0.50, y:0.40, desc:"Silverite.", source:"Quarry sites.", tags:["mining"] },
  { id: "emp-paragons-1",  name:"Paragon's Luster",       region:"emprise_du_lion", category:"metal", rarity:"epic",     tier:4, x:0.60, y:0.40, desc:"Tier-4 metal.", source:"Quarries near Suledin Keep — strict node count.", tags:["mining","tier4"] },
  { id: "emp-aurum-1",     name:"Volcanic Aurum",         region:"emprise_du_lion", category:"metal", rarity:"epic",     tier:4, x:0.30, y:0.45, desc:"Tier-4 metal — rare.", source:"Hot vents and southern dragon territory.", tags:["mining","tier4"] },
  { id: "emp-snoufleur-1", name:"Snoufleur Skin",         region:"emprise_du_lion", category:"leather",rarity:"uncommon", tier:2, x:0.42, y:0.58, desc:"Hide.", source:"Snoufleur herds.", tags:["leather"] },
  { id: "emp-greatbear-1", name:"Great Bear Hide",        region:"emprise_du_lion", category:"leather",rarity:"uncommon", tier:2, x:0.55, y:0.55, desc:"Bear hide.", source:"Forest bears.", tags:["leather"] },
  { id: "emp-loden-1",     name:"Dales Loden Wool",       region:"emprise_du_lion", category:"cloth", rarity:"rare",     tier:3, x:0.35, y:0.62, desc:"Tier-3 wool.", source:"Sheep enclosures.", tags:["cloth"] },
  { id: "emp-highever-1",  name:"Highever Weave",         region:"emprise_du_lion", category:"cloth", rarity:"epic",     tier:4, x:0.55, y:0.30, desc:"Tier-4 cloth — rare.", source:"Drops from red templars; some merchant caches.", tags:["cloth","tier4"] },
  { id: "emp-shard-1",     name:"Shard #1",               region:"emprise_du_lion", category:"shard", rarity:"rare",     tier:2, x:0.25, y:0.30, desc:"Shard.", source:"Northern frozen lake.", tags:["shard"] },
  { id: "emp-shard-2",     name:"Shard #2",               region:"emprise_du_lion", category:"shard", rarity:"rare",     tier:2, x:0.55, y:0.20, desc:"Shard.", source:"Sahrnia village rooftop.", tags:["shard"] },
  { id: "emp-shard-3",     name:"Shard #3",               region:"emprise_du_lion", category:"shard", rarity:"rare",     tier:2, x:0.70, y:0.50, desc:"Shard.", source:"Cliffs above Suledin.", tags:["shard"] },
  { id: "emp-shard-4",     name:"Shard #4",               region:"emprise_du_lion", category:"shard", rarity:"rare",     tier:2, x:0.40, y:0.65, desc:"Shard.", source:"South of Drakon's Rise.", tags:["shard"] },
  { id: "emp-shard-5",     name:"Shard #5",               region:"emprise_du_lion", category:"shard", rarity:"rare",     tier:2, x:0.65, y:0.70, desc:"Shard.", source:"East glacier.", tags:["shard"] },
  { id: "emp-astra-1",     name:"Astrarium of Emprise du Lion", region:"emprise_du_lion", category:"astrarium", rarity:"unique", x:0.48, y:0.42, desc:"Reward cave near Sahrnia.", source:"Three constellations.", tags:["astrarium"] },
  { id: "emp-dragon-hivernal",name:"Hivernal",            region:"emprise_du_lion", category:"dragon", rarity:"unique", x:0.20, y:0.20, desc:"Level 19 dragon (cold).", source:"Glacial Rift — north.", tags:["dragon"] },
  { id: "emp-dragon-kalt", name:"Kaltenzahn",             region:"emprise_du_lion", category:"dragon", rarity:"unique", x:0.50, y:0.15, desc:"Level 20 dragon (cold).", source:"Lower Glacial Rift.", tags:["dragon"] },
  { id: "emp-dragon-highland",name:"Highland Ravager (variant)",region:"emprise_du_lion", category:"dragon", rarity:"unique", x:0.80, y:0.20, desc:"Level 23 dragon (cold).", source:"Watcher's Canyon — strongest base-game dragon.", tags:["dragon","endgame"] },
  { id: "emp-quest-suledin",name:"Capture Suledin Keep",   region:"emprise_du_lion", category:"quest", rarity:"unique", x:0.55, y:0.40, desc:"Liberate Suledin from red templars.", source:"Three trebuchet camps; assault the keep.", tags:["quest","story"] },

  // ============================================================
  // HISSING WASTES
  // ============================================================
  { id: "his-iron-1",      name:"Iron",                   region:"hissing_wastes", category:"metal", rarity:"common",   tier:1, x:0.40, y:0.55, desc:"Iron.", source:"Dunes.", tags:["mining"] },
  { id: "his-silverite-1", name:"Silverite",              region:"hissing_wastes", category:"metal", rarity:"uncommon", tier:2, x:0.50, y:0.40, desc:"Silverite.", source:"Tomb ridges.", tags:["mining"] },
  { id: "his-aurum-1",     name:"Volcanic Aurum",         region:"hissing_wastes", category:"metal", rarity:"epic",     tier:4, x:0.65, y:0.30, desc:"Tier-4 metal.", source:"Eastern tomb cliffs.", tags:["mining","tier4"] },
  { id: "his-onyx-1",      name:"Onyx",                   region:"hissing_wastes", category:"metal", rarity:"rare",     tier:3, x:0.30, y:0.45, desc:"Tier-3 metal.", source:"Tomb interiors.", tags:["mining"] },
  { id: "his-velvet-1",    name:"Plush Fustian Velvet",   region:"hissing_wastes", category:"cloth", rarity:"rare",     tier:3, x:0.55, y:0.55, desc:"Tier-3 cloth.", source:"Venatori loot.", tags:["cloth"] },
  { id: "his-highever-1",  name:"Highever Weave",         region:"hissing_wastes", category:"cloth", rarity:"epic",     tier:4, x:0.65, y:0.50, desc:"Tier-4 cloth.", source:"Sand-Reaver wyvern dens.", tags:["cloth","tier4"] },
  { id: "his-felandaris-1",name:"Felandaris",             region:"hissing_wastes", category:"herb",  rarity:"rare",     tier:3, x:0.45, y:0.60, desc:"Demonic-rift herb. Used in master tonics.", source:"Around fade rifts in deserts.", tags:["herb","master"] },
  { id: "his-shard-1",     name:"Shard #1",               region:"hissing_wastes", category:"shard", rarity:"rare",     tier:2, x:0.20, y:0.30, desc:"Shard.", source:"NW tomb roof.", tags:["shard"] },
  { id: "his-shard-2",     name:"Shard #2",               region:"hissing_wastes", category:"shard", rarity:"rare",     tier:2, x:0.45, y:0.25, desc:"Shard.", source:"Central tomb pillar.", tags:["shard"] },
  { id: "his-shard-3",     name:"Shard #3",               region:"hissing_wastes", category:"shard", rarity:"rare",     tier:2, x:0.65, y:0.40, desc:"Shard.", source:"East dunes.", tags:["shard"] },
  { id: "his-shard-4",     name:"Shard #4",               region:"hissing_wastes", category:"shard", rarity:"rare",     tier:2, x:0.30, y:0.55, desc:"Shard.", source:"Sand-Reaver lair entrance.", tags:["shard"] },
  { id: "his-shard-5",     name:"Shard #5",               region:"hissing_wastes", category:"shard", rarity:"rare",     tier:2, x:0.55, y:0.65, desc:"Shard.", source:"S central dunes.", tags:["shard"] },
  { id: "his-shard-6",     name:"Shard #6",               region:"hissing_wastes", category:"shard", rarity:"rare",     tier:2, x:0.75, y:0.65, desc:"Shard.", source:"East tomb.", tags:["shard"] },
  { id: "his-astra-1",     name:"Astrarium of the Hissing Wastes", region:"hissing_wastes", category:"astrarium", rarity:"unique", x:0.50, y:0.50, desc:"Reward cave behind a tomb.", source:"Three constellations across dunes.", tags:["astrarium"] },
  { id: "his-dragon-sandy",name:"Sandy Howler",           region:"hissing_wastes", category:"dragon", rarity:"unique", x:0.80, y:0.50, desc:"Level 17 dragon (fire).", source:"Eastern dunes — Tomb of Fairel area.", tags:["dragon"] },
  { id: "his-quest-tombs", name:"The Tomb of Fairel",     region:"hissing_wastes", category:"quest", rarity:"unique", x:0.60, y:0.50, desc:"Activate four ritual towers, then descend.", source:"Light all four eluvian-style obelisks at the cardinal tombs.", tags:["quest","tombs"] },

  // ============================================================
  // FROSTBACK BASIN (Jaws of Hakkon DLC)
  // ============================================================
  { id: "fro-stormheart-1",name:"Stormheart",             region:"frostback_basin", category:"metal", rarity:"rare",     tier:3, x:0.45, y:0.40, desc:"Tier-3 metal.", source:"Cliff ridges around the lake.", tags:["mining","tier3","dlc"] },
  { id: "fro-aurum-1",     name:"Volcanic Aurum",         region:"frostback_basin", category:"metal", rarity:"epic",     tier:4, x:0.55, y:0.30, desc:"Tier-4 metal.", source:"Northern volcanic vents.", tags:["mining","tier4","dlc"] },
  { id: "fro-silkbrocade",name:"Silken Plainweave",       region:"frostback_basin", category:"cloth", rarity:"epic",     tier:4, x:0.40, y:0.55, desc:"Hakkon-only cloth.", source:"Avvar Sky-watcher caches.", tags:["cloth","dlc"] },
  { id: "fro-snoufleur-1", name:"Snoufleur Skin",         region:"frostback_basin", category:"leather",rarity:"uncommon", tier:2, x:0.50, y:0.45, desc:"Hide.", source:"Snoufleur herds.", tags:["leather","dlc"] },
  { id: "fro-felandaris-1",name:"Felandaris",             region:"frostback_basin", category:"herb",  rarity:"rare",     tier:3, x:0.30, y:0.55, desc:"Rift-side herb.", source:"Around active rifts.", tags:["herb","dlc"] },
  { id: "fro-prophets-1",  name:"Prophet's Laurel",       region:"frostback_basin", category:"herb",  rarity:"rare",     tier:3, x:0.35, y:0.40, desc:"Master regen ingredient.", source:"Stoss Ledge waterfalls.", tags:["herb","dlc"] },
  { id: "fro-shard-1",     name:"Shard (Hakkon)",         region:"frostback_basin", category:"shard", rarity:"rare",     tier:2, x:0.50, y:0.50, desc:"Hakkon-DLC shards count toward Solasan.", source:"Several across cliffs and ruins.", tags:["shard","dlc"] },
  { id: "fro-dragon-hakkon",name:"Hakkon Wintersbreath", region:"frostback_basin", category:"dragon", rarity:"unique", x:0.45, y:0.20, desc:"Avvar god-spirit dragon (level 23).", source:"Hakkon's Trial peak — endgame DLC boss.", tags:["dragon","dlc","boss"] },
  { id: "fro-quest-jaws",  name:"Jaws of Hakkon (main)",  region:"frostback_basin", category:"quest", rarity:"unique", x:0.50, y:0.50, desc:"DLC main story.", source:"Track Inquisitor Ameridan; defeat Hakkonites.", tags:["quest","dlc","story"] },

  // ============================================================
  // DEEP ROADS (Descent DLC)
  // ============================================================
  { id: "des-iron-1",      name:"Iron",                   region:"deep_roads", category:"metal", rarity:"common",   tier:1, x:0.40, y:0.55, desc:"Iron.", source:"Throughout — heavy mining theme.", tags:["mining","dlc"] },
  { id: "des-paragons-1",  name:"Paragon's Luster",       region:"deep_roads", category:"metal", rarity:"epic",     tier:4, x:0.55, y:0.40, desc:"Tier-4 metal.", source:"Forgotten Caverns — heavy spawns.", tags:["mining","tier4","dlc"] },
  { id: "des-aurum-1",     name:"Volcanic Aurum",         region:"deep_roads", category:"metal", rarity:"epic",     tier:4, x:0.65, y:0.30, desc:"Tier-4 metal.", source:"Sha-Brytol territory.", tags:["mining","tier4","dlc"] },
  { id: "des-everite-1",   name:"Everite",                region:"deep_roads", category:"metal", rarity:"rare",     tier:3, x:0.30, y:0.45, desc:"Tier-3 metal.", source:"Mid-Deep Roads.", tags:["mining","dlc"] },
  { id: "des-silverite-1", name:"Silverite",              region:"deep_roads", category:"metal", rarity:"uncommon", tier:2, x:0.40, y:0.40, desc:"Silverite.", source:"Many nodes.", tags:["mining","dlc"] },
  { id: "des-silkbrocade-1",name:"Silken Plainweave",     region:"deep_roads", category:"cloth", rarity:"epic",     tier:4, x:0.50, y:0.50, desc:"Tier-4 cloth.", source:"Sha-Brytol drops.", tags:["cloth","tier4","dlc"] },
  { id: "des-felandaris-1",name:"Felandaris",             region:"deep_roads", category:"herb",  rarity:"rare",     tier:3, x:0.45, y:0.60, desc:"Around rift sites.", source:"Drops near active fade tears.", tags:["herb","dlc"] },
  { id: "des-quest-titan", name:"The Heart of It (Titan)",region:"deep_roads", category:"quest", rarity:"unique", x:0.50, y:0.50, desc:"Descent main quest — Titan reveal.", source:"Fight through the Sha-Brytol; descend to the Heart.", tags:["quest","dlc","story"] },
  { id: "des-codex-titan", name:"Notes on the Titan",     region:"deep_roads", category:"codex", rarity:"unique", x:0.55, y:0.45, desc:"Major lore on Titans and lyrium.", source:"Found near Sha-Brytol writings.", tags:["codex","lore","titan"] },

  // ============================================================
  // SKYHOLD (hub-side collectibles)
  // ============================================================
  { id: "sky-bottle-1",    name:"Bottles on the Wall",    region:"skyhold", category:"bottle", rarity:"uncommon", x:0.50, y:0.50, desc:"Collected by Cabot — full set unlocks an achievement.", source:"Found in tavern caches and merchants in many regions.", tags:["bottle","collectible"] },
  { id: "sky-mosaic-1",    name:"Mosaics — five sets",    region:"skyhold", category:"mosaic", rarity:"uncommon", x:0.45, y:0.45, desc:"5 sets: Invasion, Archive of the Inquisitor, The Freed Are Slaves, Spirit, Star of Andoral.", source:"Pieces hidden across nearly every major region; assembled at Skyhold.", tags:["mosaic","collectible"] },
  { id: "sky-songs-1",     name:"Songs (Maryden)",        region:"skyhold", category:"song", rarity:"uncommon", x:0.55, y:0.50, desc:"Maryden's songs, unlocked from sheets in regions.", source:"Sheet music drops e.g. Storm Coast, Hinterlands, Crestwood.", tags:["song","music"] },
  { id: "sky-quest-throne",name:"Judgment Throne",        region:"skyhold", category:"quest", rarity:"unique", x:0.50, y:0.40, desc:"Judge prisoners; outcomes affect war table.", source:"Josephine summons you for each.", tags:["quest","judgment"] },

  // ============================================================
  // VAL ROYEAUX
  // ============================================================
  { id: "val-shop-1",      name:"Tier-2/3 Schematics",    region:"val_royeaux", category:"quest", rarity:"rare", x:0.50, y:0.45, desc:"Several merchants sell uncommon schematics here.", source:"Cassandra & inquisition shop fronts.", tags:["shop","schematic"] },
  { id: "val-codex-1",     name:"Lore — Chantry & Empire",region:"val_royeaux", category:"codex", rarity:"common", x:0.55, y:0.40, desc:"Codex pickups around the city.", source:"Books and notes in side rooms.", tags:["codex","lore"] },

  // ============================================================
  // ARBOR WILDS
  // ============================================================
  { id: "arb-quest-temple",name:"Temple of Mythal",       region:"arbor_wilds", category:"quest", rarity:"unique", x:0.55, y:0.40, desc:"Story-only mission — no farming.", source:"Unlocked from main quest 'What Pride Had Wrought'.", tags:["quest","story","mythal"] },
  { id: "arb-codex-1",     name:"Sentinels & Mythal lore",region:"arbor_wilds", category:"codex", rarity:"unique", x:0.50, y:0.45, desc:"Pre-Veil elven lore.", source:"Found inside the Temple chambers.", tags:["codex","lore"] },

  // ============================================================
  // HAVEN
  // ============================================================
  { id: "hav-iron-1",      name:"Iron",                   region:"haven", category:"metal", rarity:"common", tier:1, x:0.40, y:0.55, desc:"Few starter nodes.", source:"Around the Chantry and frozen lake.", tags:["mining"] },
  { id: "hav-elfroot-1",   name:"Elfroot",                region:"haven", category:"herb",  rarity:"common", tier:1, x:0.50, y:0.40, desc:"Tutorial herb.", source:"Slopes near the gates.", tags:["herb"] },
  { id: "hav-quest-breach",name:"Closing the Breach (Act I climax)", region:"haven", category:"quest", rarity:"unique", x:0.55, y:0.40, desc:"Sets up Skyhold transition.", source:"Story-driven.", tags:["quest","story"] },

  // ============================================================
  // DARVAARAD (Trespasser DLC)
  // ============================================================
  { id: "dar-quest-tres",  name:"Trespasser main quest",  region:"darvaarad", category:"quest", rarity:"unique", x:0.50, y:0.50, desc:"DLC story epilogue.", source:"Linear story.", tags:["quest","dlc","story"] },
  { id: "dar-codex-1",     name:"Eluvian network notes",  region:"darvaarad", category:"codex", rarity:"unique", x:0.55, y:0.45, desc:"Major lore on Solas and the Eluvians.", source:"Various rooms across the eluvian network.", tags:["codex","lore","solas"] }
];
