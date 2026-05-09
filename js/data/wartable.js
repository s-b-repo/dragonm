// DAI War Table operations.
// Sources: Dragon Age Wiki "War Table operations" category, Fextralife,
// /r/dragonage compiled threads, GameFAQs guides.
//
// Schema:
//   id            unique slug
//   name          mission name as shown in-game
//   act           Prologue / Act 1 / Act 2 / Act 3 / DLC: Hakkon|Descent|Trespasser
//   category      story | region-unlock | recruit | approval | reward | choice | dlc | misc
//   region        related region id (or "war-table")
//   prerequisites string (what unlocks the mission)
//   power         power required (number or null)
//   time          { cullen?: "h:mm", josephine?: "h:mm", leliana?: "h:mm" }
//   advisors      array of advisor ids that can attempt
//   recommended   id of the optimal advisor (per community consensus) or null
//   rewardsBy     { advisorId: "what they get" } or null
//   defaultRewards string (rewards that always apply)
//   outcome       narrative outcome / world state effect
//   notes         strategy / missable warnings
//   tags

window.DAI_WARTABLE = [

  // ============================================================
  // PROLOGUE / EARLY ACT 1
  // ============================================================
  { id: "wt-threat-remains", name: "The Threat Remains", act: "Prologue", category: "story", region: "war-table",
    prerequisites: "Available immediately after returning from the Breach.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Unlocks Mages or Templars investigation paths.",
    outcome: "Sets the Inquisition's recruitment options and forces the Mage/Templar choice.",
    notes: "Choose 'In Hushed Whispers' (mages) or 'Champions of the Just' (templars). Both branches reach the same beats but recruit different forces.",
    tags: ["story","required"] },

  { id: "wt-scout-hinterlands", name: "Scout the Hinterlands", act: "Prologue", category: "region-unlock", region: "hinterlands",
    prerequisites: "Default unlocked early.",
    power: 0, advisors: ["leliana","cullen"], time: {leliana: "0:12", cullen: "0:12"}, recommended: "leliana",
    rewardsBy: null,
    defaultRewards: "Unlocks travel to the Hinterlands.",
    outcome: "Allows fast travel and full exploration of the Hinterlands.",
    notes: "Do this immediately — most early-game power and resources are here.",
    tags: ["region","unlock","intro"] },

  { id: "wt-address-chantry", name: "Address the Chantry in Val Royeaux", act: "Act 1", category: "story", region: "val_royeaux",
    prerequisites: "Speak to Mother Giselle in the Hinterlands.",
    power: 1, advisors: ["leliana","josephine"], time: {josephine: "0:30"}, recommended: "josephine",
    defaultRewards: "Unlocks Val Royeaux mission.",
    outcome: "Opens main-story branch: meet Vivienne, Sera invitation, mage/templar contact.",
    notes: "Triggers Sera and Vivienne recruitment opportunities.",
    tags: ["story","required"] },

  { id: "wt-foothold-haven", name: "Find a Foothold for the Inquisition", act: "Act 1", category: "story", region: "war-table",
    prerequisites: "Early access.",
    power: 4, advisors: ["cullen"], time: {cullen: "0:12"}, recommended: "cullen",
    defaultRewards: "Establishes Haven as the operating base.",
    outcome: "World-state setup before Skyhold.",
    notes: "Trivial cost; do early.",
    tags: ["story"] },

  { id: "wt-promise-destruction", name: "Promise of Destruction", act: "Act 1", category: "region-unlock", region: "storm_coast",
    prerequisites: "Receive war table letter.",
    power: 0, advisors: ["cullen","josephine","leliana"], time: {cullen:"0:12", josephine:"0:12", leliana:"0:12"}, recommended: "cullen",
    rewardsBy: null,
    defaultRewards: "Unlocks the Storm Coast.",
    outcome: "Opens Storm Coast for travel and recruitment of Bull's Chargers.",
    notes: "Same outcome regardless of advisor — pick whoever has the shortest queue.",
    tags: ["region","unlock"] },

  { id: "wt-mercenary-fortunes", name: "Mercenary Fortunes / Allies on the Storm Coast", act: "Act 1", category: "recruit", region: "storm_coast",
    prerequisites: "Speak to Cullen after Storm Coast unlock; meet Bull's Chargers.",
    power: 2, advisors: ["cullen"], time: {cullen:"0:30"}, recommended: "cullen",
    defaultRewards: "Recruits The Iron Bull as a companion.",
    outcome: "Bull joins the Inquisition; opens Tal-Vashoth questlines and Bull's Chargers as agents.",
    notes: "Required if you want Iron Bull. Also enables 'Demands of the Qun' (saving the Chargers vs. alliance with Qunari).",
    tags: ["recruit","companion","bull"] },

  // ============================================================
  // ACT 1 - REGION UNLOCKS
  // ============================================================
  { id: "wt-rescue-fallow-mire", name: "Rescue Soldiers Trapped in the Fallow Mire", act: "Act 1", category: "region-unlock", region: "fallow_mire",
    prerequisites: "Letter at the war table.",
    power: 8, advisors: ["cullen","josephine","leliana"], time: {cullen:"0:48", josephine:"1:00", leliana:"0:48"}, recommended: "cullen",
    rewardsBy: { cullen: "Soldiers extracted; immediate access.", josephine: "Diplomatic outcome via Bann Loren; minor approval.", leliana: "Stealth extraction; faster recovery." },
    defaultRewards: "Unlocks the Fallow Mire and the Avvar boss arc (Hargol the Hand).",
    outcome: "Captured soldiers freed; opens the region.",
    notes: "Cullen gives the cleanest world-state for follow-up missions.",
    tags: ["region","unlock"] },

  { id: "wt-open-door-crestwood", name: "An Open Door in Crestwood", act: "Act 1", category: "region-unlock", region: "crestwood",
    prerequisites: "After 'The Threat Remains' progress.",
    power: 8, advisors: ["leliana","josephine"], time: {leliana:"0:30", josephine:"0:48"}, recommended: "leliana",
    defaultRewards: "Unlocks Crestwood and 'Here Lies the Abyss' lead-in.",
    outcome: "Opens Crestwood; introduces Warden investigation thread.",
    notes: "Leliana is faster and tonally appropriate.",
    tags: ["region","unlock","wardens"] },

  { id: "wt-glowing-statuette", name: "Investigate a Glowing Statuette", act: "Act 1", category: "region-unlock", region: "forbidden_oasis",
    prerequisites: "Receive the statuette from a war table report.",
    power: 4, advisors: ["josephine","leliana","cullen"], time: {josephine:"0:30", leliana:"0:30", cullen:"0:30"}, recommended: "josephine",
    rewardsBy: { josephine: "Schematic 'Decadent Doublet'.", leliana: "Schematic + minor gold.", cullen: "Schematic + supply boost." },
    defaultRewards: "Unlocks the Forbidden Oasis (Solasan temple).",
    outcome: "Opens Solasan, where shards collected world-wide unlock chambers.",
    notes: "Begin shard hunting before this is unlocked — they retroactively count.",
    tags: ["region","unlock","shard"] },

  { id: "wt-investigate-hunter-fell", name: "Investigate Hunter Fell", act: "Act 1", category: "story", region: "war-table",
    prerequisites: "After Skyhold setup.",
    power: 5, advisors: ["leliana"], time: {leliana:"3:00"}, recommended: "leliana",
    defaultRewards: "Tracks the Grand Enchanter / sets up later investigations.",
    outcome: "Provides intel for following ops.",
    notes: "Long timer — queue and let it run.",
    tags: ["story","intel"] },

  // ============================================================
  // SKYHOLD TRANSITION
  // ============================================================
  { id: "wt-restoration-skyhold", name: "From the Ashes / Restoration of Skyhold", act: "Act 2", category: "story", region: "skyhold",
    prerequisites: "Triggered after 'In Your Heart Shall Burn'.",
    power: 0, advisors: ["josephine"], time: {josephine:"1:00"}, recommended: "josephine",
    defaultRewards: "Skyhold becomes the Inquisition base.",
    outcome: "Unlocks Skyhold-only war table operations and customizations.",
    notes: "Story-mandatory; runs automatically.",
    tags: ["story","skyhold"] },

  { id: "wt-take-throne", name: "Take the Throne (Inquisitor's Judgement)", act: "Act 2", category: "story", region: "skyhold",
    prerequisites: "After Skyhold setup; Cassandra's discussion.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Unlocks the judgement throne — pass sentence on prisoners.",
    outcome: "Each judgement has lasting world-state effects.",
    notes: "Movran the Under, Magister Erimond, Florianne, etc. — choices matter.",
    tags: ["story","judgment"] },

  // ============================================================
  // ACT 2 - REGION UNLOCKS
  // ============================================================
  { id: "wt-investigate-western", name: "Investigate the Western Approach", act: "Act 2", category: "region-unlock", region: "western_approach",
    prerequisites: "After Skyhold; from Hawke/Stroud thread.",
    power: 8, advisors: ["leliana"], time: {leliana:"3:00"}, recommended: "leliana",
    defaultRewards: "Unlocks the Western Approach.",
    outcome: "Opens Adamant lead-in (Here Lies the Abyss).",
    notes: "Long timer — queue early.",
    tags: ["region","unlock","wardens","adamant"] },

  { id: "wt-map-emprise", name: "The Map of Emprise du Lion", act: "Act 2", category: "region-unlock", region: "emprise_du_lion",
    prerequisites: "Reach Skyhold.",
    power: 16, advisors: ["josephine","leliana"], time: {josephine:"1:00", leliana:"0:48"}, recommended: "leliana",
    defaultRewards: "Unlocks Emprise du Lion.",
    outcome: "Opens the highest-level base-game region (3 dragons).",
    notes: "Leveled enemies — wait until ~lvl 18.",
    tags: ["region","unlock","high-level"] },

  { id: "wt-hissing-wastes-map", name: "The Hissing Wastes", act: "Act 2", category: "region-unlock", region: "hissing_wastes",
    prerequisites: "Reach Skyhold; talk to scout.",
    power: 8, advisors: ["josephine","leliana"], time: {josephine:"1:00", leliana:"0:48"}, recommended: "josephine",
    defaultRewards: "Unlocks the Hissing Wastes.",
    outcome: "Opens dwarven tomb questline and Tier 4 mining.",
    notes: "Best region for Tier 4 metal farming once unlocked.",
    tags: ["region","unlock","mining"] },

  { id: "wt-survey-emerald", name: "Survey the Emerald Graves", act: "Act 2", category: "region-unlock", region: "emerald_graves",
    prerequisites: "Skyhold.",
    power: 8, advisors: ["leliana"], time: {leliana:"0:48"}, recommended: "leliana",
    defaultRewards: "Unlocks the Emerald Graves.",
    outcome: "Opens Freemen of the Dales arc and 2 dragons.",
    notes: "",
    tags: ["region","unlock"] },

  { id: "wt-orlesian-civil", name: "Orlesian Civil War / Dalish ally", act: "Act 2", category: "region-unlock", region: "exalted_plains",
    prerequisites: "Skyhold.",
    power: 8, advisors: ["josephine","cullen"], time: {josephine:"0:48", cullen:"1:00"}, recommended: "josephine",
    defaultRewards: "Unlocks the Exalted Plains.",
    outcome: "Sets up Dalish refugee aid; restoration arc.",
    notes: "",
    tags: ["region","unlock","dalish"] },

  // ============================================================
  // HALAMSHIRAL / WICKED EYES
  // ============================================================
  { id: "wt-empress-fire", name: "Empress of Fire / The Imperial Enchanter", act: "Act 2", category: "story", region: "war-table",
    prerequisites: "Speak to Vivienne / Halamshiral arc setup.",
    power: 8, advisors: ["josephine"], time: {josephine:"1:00"}, recommended: "josephine",
    defaultRewards: "Pre-Halamshiral leverage.",
    outcome: "Unlocks 'Wicked Eyes and Wicked Hearts'.",
    notes: "Read every report — gives gossip levers in the ball.",
    tags: ["story","halamshiral"] },

  { id: "wt-halamshiral-prep", name: "An Audience with the Empress", act: "Act 2", category: "story", region: "war-table",
    prerequisites: "After Empress of Fire chain.",
    power: 20, advisors: ["josephine"], time: {josephine:"1:30"}, recommended: "josephine",
    defaultRewards: "Triggers Wicked Eyes and Wicked Hearts.",
    outcome: "Major story choice: support Celene, Briala, Gaspard, or unify.",
    notes: "Outcome locks Orlais's ruler for the rest of the game and Trespasser.",
    tags: ["story","required","choice"] },

  { id: "wt-better-court", name: "A Better Court for Celene", act: "Act 2", category: "choice", region: "war-table",
    prerequisites: "Halamshiral with Celene retained.",
    power: 0, advisors: ["josephine","leliana"], time: {josephine:"1:00", leliana:"1:00"}, recommended: "josephine",
    defaultRewards: "Reform of the Orlesian court — minor approval boosts.",
    outcome: "Stabilizes Celene's reign.",
    notes: "Trespasser-state flag.",
    tags: ["choice","politics"] },

  // ============================================================
  // RECRUITS
  // ============================================================
  { id: "wt-recruit-sutherland", name: "Recruit Sutherland", act: "Act 2", category: "recruit", region: "war-table",
    prerequisites: "Random encounter at Skyhold (after a mission, Sutherland and Voth approach you).",
    power: 0, advisors: ["josephine","cullen","leliana"], time: {josephine:"1:00", cullen:"0:48", leliana:"0:30"}, recommended: "josephine",
    rewardsBy: {
      josephine: "Best long-term: Sutherland's group brings the most gold over time.",
      cullen:    "Solid military gear rewards.",
      leliana:   "Faster but smaller payouts."
    },
    defaultRewards: "Recruits Sutherland's company; ongoing reward chain (Jagged Crown, gold, schematics).",
    outcome: "Up to 6 follow-up war-table operations with stacking rewards.",
    notes: "Pick Josephine — community consensus is that Josephine's 'A Master at Arms' chain pays the most over time.",
    tags: ["recruit","reward","gold"] },

  { id: "wt-jagged-crown", name: "The Verchiel March / Jagged Crown chain", act: "Act 2", category: "reward", region: "war-table",
    prerequisites: "Sutherland recruited.",
    power: 0, advisors: ["josephine","cullen","leliana"], time: {josephine:"3:00", cullen:"3:00", leliana:"3:00"}, recommended: "josephine",
    defaultRewards: "Tier-3+ schematic and gold.",
    outcome: "One in a multi-step Sutherland chain.",
    notes: "",
    tags: ["reward","sutherland"] },

  { id: "wt-recruit-movran", name: "Recruit Movran the Under", act: "Act 2", category: "recruit", region: "war-table",
    prerequisites: "Judge Movran in court (sentence to throw at Tevinter).",
    power: 0, advisors: ["cullen"], time: {cullen:"0:24"}, recommended: "cullen",
    defaultRewards: "Recruits Avvar agent; minor schematic.",
    outcome: "Inquisition agent.",
    notes: "Only available with the throwing-at-Tevinter judgement.",
    tags: ["recruit","agent","judgment"] },

  { id: "wt-friend-red-jenny", name: "Friends of Red Jenny", act: "Act 1", category: "recruit", region: "war-table",
    prerequisites: "Receive Red Jenny letter at war table.",
    power: 0, advisors: ["josephine","leliana"], time: {josephine:"0:24", leliana:"0:30"}, recommended: "leliana",
    defaultRewards: "Sera-related rewards / agent network.",
    outcome: "Strengthens Sera's faction; minor approval.",
    notes: "",
    tags: ["recruit","sera","approval"] },

  { id: "wt-recruit-dagna", name: "The Imperial Enchanter / Recruit Dagna", act: "Act 2", category: "recruit", region: "war-table",
    prerequisites: "Skyhold; speak to Cassandra/Cullen.",
    power: 0, advisors: ["josephine"], time: {josephine:"1:00"}, recommended: "josephine",
    defaultRewards: "Recruits Dagna as Skyhold's arcanist.",
    outcome: "Dagna unlocks rune crafting and rune schematics; some cosmetic Skyhold dialogue.",
    notes: "Highly recommended — runes substantially upgrade weapons.",
    tags: ["recruit","crafting","runes"] },

  { id: "wt-recruit-wagonmaster", name: "Recruit Wagonmaster Brom", act: "Act 1", category: "recruit", region: "war-table",
    prerequisites: "Side encounter.",
    power: 0, advisors: ["cullen"], time: {cullen:"0:24"}, recommended: "cullen",
    defaultRewards: "Inquisition perk discount agent.",
    outcome: "Discount on Skyhold supplies.",
    notes: "",
    tags: ["recruit","agent"] },

  // ============================================================
  // STORY CRITICAL — ACT 2/3
  // ============================================================
  { id: "wt-here-lies-abyss", name: "Here Lies the Abyss", act: "Act 2", category: "story", region: "western_approach",
    prerequisites: "Western Approach lead-up complete.",
    power: 20, advisors: ["josephine","leliana"], time: {}, recommended: null,
    defaultRewards: "Unlocks Adamant Fortress mission.",
    outcome: "Major story: Hawke or Warden sacrificed; Wardens become allies or exiled.",
    notes: "Choice is permanent. Either Hawke or Stroud/Alistair/Loghain dies in the Fade.",
    tags: ["story","required","choice","wardens"] },

  { id: "wt-arbor-wilds", name: "What Pride Had Wrought", act: "Act 3", category: "story", region: "arbor_wilds",
    prerequisites: "Reach late Act 2 / Act 3 main story.",
    power: 20, advisors: ["cullen","josephine","leliana"], time: {}, recommended: null,
    defaultRewards: "Unlocks the Arbor Wilds final assault.",
    outcome: "Major story: lead the assault on Mythal's Temple.",
    notes: "Choose one advisor to lead the army — minor cosmetic differences.",
    tags: ["story","required"] },

  { id: "wt-final-doom", name: "Doom Upon All the World", act: "Act 3", category: "story", region: "war-table",
    prerequisites: "After Arbor Wilds.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Triggers final battle.",
    outcome: "End of base-game story.",
    notes: "Save before starting — affects Trespasser entry state.",
    tags: ["story","required","endgame"] },

  // ============================================================
  // CULLEN / JOSEPHINE / LELIANA — ADVISOR ARCS
  // ============================================================
  { id: "wt-cullen-lyrium", name: "Cullen — Lyrium Withdrawal", act: "Act 2", category: "approval", region: "war-table",
    prerequisites: "Cullen-personal-quest line.",
    power: 0, advisors: ["leliana","josephine"], time: {}, recommended: "leliana",
    defaultRewards: "Cullen approval; advisor-personal flavor.",
    outcome: "Cullen continues lyrium-free path; Trespasser flag.",
    notes: "Talking to him in his office is the key step; the war table mission is supportive.",
    tags: ["approval","cullen"] },

  { id: "wt-leliana-becomes", name: "Leliana — Choose Successor (Most Holy)", act: "Act 3", category: "choice", region: "war-table",
    prerequisites: "After Justinia successor mission set.",
    power: 0, advisors: ["leliana"], time: {leliana:"1:00"}, recommended: "leliana",
    defaultRewards: "Leliana ascends to Divine (one of three possible Divines).",
    outcome: "Trespasser-state: 'gentle/hardened' Divine choice; affects Chantry reform.",
    notes: "Determined by approval and 'soft/hard' state.",
    tags: ["choice","divine","leliana"] },

  { id: "wt-josie-honor", name: "Josephine — A Threat in Antiva (House of Repose)", act: "Act 2", category: "approval", region: "war-table",
    prerequisites: "Speak to Josephine repeatedly.",
    power: 0, advisors: ["josephine","leliana"], time: {}, recommended: "leliana",
    defaultRewards: "Resolves the Montilyet contract with the House of Repose.",
    outcome: "Josephine approval; freedom from the assassins.",
    notes: "Either reinstate the family's nobility (Leliana — kill the writ author), reinstate via diplomacy (Josephine — pay), or resolve via romance.",
    tags: ["approval","josephine"] },

  // ============================================================
  // ACT 1/2 ASSORTED
  // ============================================================
  { id: "wt-build-watchtowers", name: "Build Watchtowers in the Hinterlands", act: "Act 1", category: "misc", region: "hinterlands",
    prerequisites: "Complete the in-region tower quests.",
    power: 1, advisors: ["cullen"], time: {cullen:"0:30"}, recommended: "cullen",
    defaultRewards: "Hinterlands becomes safer; lore log.",
    outcome: "Cosmetic improvement to region.",
    notes: "Pure flavor; no gameplay impact.",
    tags: ["misc"] },

  { id: "wt-stop-tevinter", name: "Stop the Tevinter Imperium", act: "Act 2", category: "story", region: "war-table",
    prerequisites: "After Skyhold.",
    power: 4, advisors: ["leliana","josephine"], time: {leliana:"1:00", josephine:"1:30"}, recommended: "leliana",
    defaultRewards: "Stops Venatori operations; unlocks follow-ups.",
    outcome: "Tevinter network disrupted.",
    notes: "Required for several Hissing Wastes / Approach side missions.",
    tags: ["story"] },

  { id: "wt-bull-vs-qun", name: "Demands of the Qun (Iron Bull loyalty)", act: "Act 2", category: "approval", region: "storm_coast",
    prerequisites: "Iron Bull recruited; alliance offer arrives.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Either save the Chargers (Bull is Tal-Vashoth) OR ally with the Qun (Chargers die).",
    outcome: "Permanent: Bull becomes Tal-Vashoth (lose Qunari alliance) OR Chargers killed (gain Qun alliance fleet).",
    notes: "Trespasser-relevant. Saving the Chargers is the canonical/popular pick; it changes Bull's epilogue and Trespasser scene.",
    tags: ["approval","bull","choice"] },

  { id: "wt-spy-orlais", name: "Spying for the Inquisition (Hossberg / Orlais)", act: "Act 2", category: "misc", region: "war-table",
    prerequisites: "Skyhold.",
    power: 0, advisors: ["leliana"], time: {leliana:"1:00"}, recommended: "leliana",
    defaultRewards: "Schematic + gold.",
    outcome: "Intel.",
    notes: "Filler reward op.",
    tags: ["reward"] },

  { id: "wt-marquise-chevaliers", name: "The Marquise's Chevaliers", act: "Act 1", category: "approval", region: "hinterlands",
    prerequisites: "Hinterlands complete.",
    power: 1, advisors: ["josephine","leliana"], time: {josephine:"0:30", leliana:"0:30"}, recommended: "josephine",
    rewardsBy: { josephine: "Diplomatic resolution.", leliana: "Eliminate the Marquise quietly." },
    defaultRewards: "Chevaliers redirected to harass Tevinter.",
    outcome: "World-state.",
    notes: "Either path is fine; Josephine for 'good' Inquisition.",
    tags: ["choice","approval"] },

  // ============================================================
  // SHARDS / SOLASAN
  // ============================================================
  { id: "wt-temple-pride", name: "What Pride Had Wrought (Solasan)", act: "Act 1+", category: "misc", region: "forbidden_oasis",
    prerequisites: "Find Frederic at the Forbidden Oasis camp.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Each chamber unlocked yields rare-tier weapons / amulets / Reaver specialization tomes.",
    outcome: "Final reward at the deepest chamber: epic-tier accessories and bonuses.",
    notes: "Track shards across all regions — DLC shards count too. Frostback Basin (Hakkon) adds 50+ shards.",
    tags: ["shard","temple","reward"] },

  // ============================================================
  // DLC — JAWS OF HAKKON
  // ============================================================
  { id: "wt-investigate-frostback", name: "Investigate Frostback Basin", act: "DLC: Hakkon", category: "dlc", region: "frostback_basin",
    prerequisites: "Reach Skyhold; have Jaws of Hakkon installed.",
    power: 8, advisors: ["leliana","josephine","cullen"], time: {leliana:"0:30", josephine:"0:48", cullen:"0:48"}, recommended: "leliana",
    defaultRewards: "Unlocks the Frostback Basin.",
    outcome: "Opens Hakkon DLC content.",
    notes: "Available any time after Skyhold. DLC adds a ~10–15 hour storyline.",
    tags: ["dlc","region","unlock","hakkon"] },

  { id: "wt-hakkon-final", name: "Hakkon's Final Champion", act: "DLC: Hakkon", category: "dlc", region: "frostback_basin",
    prerequisites: "Hakkon main quest near complete.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Triggers the final fight at Hakkon's Trial.",
    outcome: "Defeat Hakkon Wintersbreath (level 23 dragon).",
    notes: "Dragon-class fight. Bring CC and electric/cold resist.",
    tags: ["dlc","story","dragon"] },

  // ============================================================
  // DLC — THE DESCENT
  // ============================================================
  { id: "wt-descent-letter", name: "Lost in the Deep Roads", act: "DLC: Descent", category: "dlc", region: "deep_roads",
    prerequisites: "Reach Skyhold; have The Descent installed.",
    power: 8, advisors: ["cullen","leliana"], time: {cullen:"0:48", leliana:"0:48"}, recommended: "cullen",
    defaultRewards: "Unlocks the Deep Roads.",
    outcome: "Opens Descent DLC.",
    notes: "End-game power level expected.",
    tags: ["dlc","region","unlock","descent"] },

  { id: "wt-descent-titan", name: "The Heart of It", act: "DLC: Descent", category: "dlc", region: "deep_roads",
    prerequisites: "Reach the Forgotten Caverns.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Discover the Titan; massive lore reveal.",
    outcome: "Establishes Titans as a foundational lore element (relevant to Dreadwolf).",
    notes: "Endgame DLC reveal — sets up the post-Trespasser direction.",
    tags: ["dlc","story","titan","lore"] },

  // ============================================================
  // DLC — TRESPASSER
  // ============================================================
  { id: "wt-trespasser-letter", name: "An Inquisitor's Last Stand", act: "DLC: Trespasser", category: "dlc", region: "darvaarad",
    prerequisites: "Beat Corypheus (base game endgame); start the DLC from main menu/save.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Begins the Trespasser DLC.",
    outcome: "Two-year time skip; final story arc with Solas reveal.",
    notes: "Trespasser is the canonical bridge to Veilguard. Make all major Inquisition choices before starting — it locks them.",
    tags: ["dlc","story","trespasser"] },

  { id: "wt-trespasser-disband", name: "Disband or Continue the Inquisition", act: "DLC: Trespasser", category: "choice", region: "darvaarad",
    prerequisites: "End of Trespasser.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Final world-state choice.",
    outcome: "Inquisition disbanded as a public institution OR continues as Divine's right-hand. Both paths still hunt Solas.",
    notes: "Trespasser-canonical for Veilguard.",
    tags: ["choice","endgame","trespasser"] },

  // ============================================================
  // SUPPORT / FILLER REWARDS
  // ============================================================
  { id: "wt-merchant-haven", name: "Send Merchant to Skyhold (various)", act: "Act 2", category: "reward", region: "skyhold",
    prerequisites: "Various sub-quest completions.",
    power: 2, advisors: ["josephine"], time: {josephine:"0:48"}, recommended: "josephine",
    defaultRewards: "Adds a merchant to Skyhold (e.g., Tier 3 weapon merchant).",
    outcome: "Permanent merchant at Skyhold.",
    notes: "Several variants — accept all of them.",
    tags: ["reward","merchant"] },

  { id: "wt-recover-treasure", name: "Recover Lost Inquisition Treasure (multiple)", act: "Act 1+", category: "reward", region: "war-table",
    prerequisites: "Various.",
    power: 0, advisors: ["cullen","leliana"], time: {cullen:"0:24", leliana:"0:24"}, recommended: "leliana",
    defaultRewards: "Gold + minor schematic.",
    outcome: "Filler.",
    notes: "Stack these to earn a steady gold income.",
    tags: ["reward","gold"] },

  { id: "wt-judgment-erimond", name: "Judge Magister Livius Erimond", act: "Act 2", category: "choice", region: "skyhold",
    prerequisites: "Capture Erimond at Adamant.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Sentence: dispose of him in Free Marches arena, execution, or hand to Tevinter.",
    outcome: "Each path slightly affects later Tevinter ops.",
    notes: "Execution is the cleanest narrative.",
    tags: ["judgment","choice"] },

  { id: "wt-judgment-florianne", name: "Judge Grand Duchess Florianne", act: "Act 2", category: "choice", region: "skyhold",
    prerequisites: "Capture Florianne at Halamshiral.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Sentence determines Halamshiral aftermath.",
    outcome: "Make her serve, execute, etc.",
    notes: "If alive, she shows up in war-table follow-ups.",
    tags: ["judgment","choice"] },

  // ============================================================
  // INQUISITION PERKS / SUPPORT
  // ============================================================
  { id: "wt-inquisition-perks", name: "Inquisition Perks (Skyhold board)", act: "Act 2", category: "misc", region: "skyhold",
    prerequisites: "Reach Skyhold; allocate Influence at Josephine's nook.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Permanent passive bonuses (loot, dialogue, herb yields, gold).",
    outcome: "Picking Forces / Connections / Secrets / Inquisition perks shapes long-term resources.",
    notes: "Top picks: Optimal Cutting (more herbs), More Healing Potions, Deft Hands Fine Tools (open all locks), Antivan Tailoring (cheaper deluxe armors).",
    tags: ["perks","passive","skyhold"] },

  // ============================================================
  // EXTRA REGION-RELATED
  // ============================================================
  { id: "wt-suledin-prep", name: "Capture Suledin Keep (prep ops)", act: "Act 2", category: "region-unlock", region: "emprise_du_lion",
    prerequisites: "Enter Emprise du Lion.",
    power: 4, advisors: ["cullen"], time: {cullen:"0:48"}, recommended: "cullen",
    defaultRewards: "Reduces enemy reinforcements at Suledin.",
    outcome: "In-region quest 'Capture Suledin Keep' becomes easier.",
    notes: "Optional — can be done in person, but the prep helps.",
    tags: ["region","prep"] },

  { id: "wt-caer-bronach-prep", name: "Capture Caer Bronach (Crestwood)", act: "Act 2", category: "region-unlock", region: "crestwood",
    prerequisites: "Enter Crestwood.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Caer Bronach becomes the Crestwood Inquisition camp.",
    outcome: "Faster travel; unlocks merchant and quartermaster.",
    notes: "Done in-region, not at the war table — included for completeness.",
    tags: ["region","keep"] },

  { id: "wt-griffon-wing", name: "Capture Griffon Wing Keep (Western Approach)", act: "Act 2", category: "region-unlock", region: "western_approach",
    prerequisites: "Reach Griffon Wing area.",
    power: 0, advisors: [], time: {}, recommended: null,
    defaultRewards: "Inquisition keep + merchant.",
    outcome: "In-region staging point for Adamant.",
    notes: "Done in-region.",
    tags: ["region","keep"] },

  { id: "wt-orlesian-couriers", name: "Orlesian Couriers Killed in Forest", act: "Act 1", category: "reward", region: "war-table",
    prerequisites: "Letter at war table.",
    power: 0, advisors: ["josephine","leliana"], time: {josephine:"0:24", leliana:"0:24"}, recommended: "josephine",
    rewardsBy: { josephine: "Inquisition perk: gold + diplomatic boost.", leliana: "Spy network bonus." },
    defaultRewards: "Inquisition perk power (small).",
    outcome: "Recruits a courier network agent.",
    notes: "",
    tags: ["reward","agent"] },

  { id: "wt-noble-loss", name: "A Noble Cause / Recruit Speaker Anais", act: "Act 1", category: "recruit", region: "war-table",
    prerequisites: "Receive letter.",
    power: 0, advisors: ["josephine"], time: {josephine:"0:30"}, recommended: "josephine",
    defaultRewards: "Recruits Speaker Anais (Connections agent).",
    outcome: "Influence reduction perk.",
    notes: "",
    tags: ["recruit","agent"] },

  { id: "wt-chant-light", name: "Spread Word of the Inquisition", act: "Act 1", category: "misc", region: "war-table",
    prerequisites: "Early.",
    power: 0, advisors: ["josephine"], time: {josephine:"0:48"}, recommended: "josephine",
    defaultRewards: "Influence + minor power.",
    outcome: "Builds reputation.",
    notes: "Filler.",
    tags: ["influence"] }
];
