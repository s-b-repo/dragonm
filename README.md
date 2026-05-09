# DAI Atlas & War Table

A static, fan-made companion tool for **Dragon Age: Inquisition** with two
pages, switchable from the top nav:

1. **Resource Atlas** — every region, every farmable resource, with
   procedurally-generated in-engine-style maps and pin overlays.
2. **War Table** — every notable war-table operation with prerequisites,
   advisor breakdown (time + reward), recommended pick, outcomes, and notes.

> Why a companion tool and not a true mod? DAI runs on the Frostbite engine,
> which has no public modding SDK. Established community projects (DAI Map,
> Map Genie, Fextralife wiki, BSN archives) are all out-of-game web
> companions. This tool follows that approach.

## Features

### Atlas page (`#/atlas`)
- **162 resource entries** across 17 regions including Hakkon, Descent, and
  Trespasser DLC.
- **Dynamic, procedurally-generated SVG maps** for each region — themed by
  biome (snow for Emprise, dunes for Hissing Wastes, jungle for Arbor Wilds,
  cave system for Deep Roads, castle for Skyhold, etc.). Seeded so every
  region renders consistently.
- **Search** by name, source, tag, region, category, rarity.
- **Filters** for region, category (metal, herb, leather, cloth, shard,
  astrarium, dragon, agent, codex, …), rarity tier.
- **List view** grouped by region with category color dots and rarity tags.
- **Detail panel** with description, where-to-find, region notes, normalized
  coordinates, and tags.

### War Table page (`#/wartable`)
- **55+ missions** covering Prologue → Trespasser, including all major story
  gates, region unlocks, recruitments, judgements, and DLC ops.
- Each mission card shows: act, category, region tie-in, power cost,
  available advisors with the recommended pick highlighted (★).
- **Per-advisor table** for time and reward differences.
- **Outcomes & notes** explaining missable rewards, world-state flags, and
  Trespasser-relevant choices.
- **Filter** by act/DLC, advisor, category (story / region-unlock / recruit /
  approval / reward / choice / DLC), and region tie-in.

## Run it

It's a static page. Open `index.html` directly in any modern browser, or:

```bash
cd /home/cortix/Downloads/dragonm
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

This repo is already configured for GitHub Pages with an Actions workflow
(`.github/workflows/pages.yml`) and a `.nojekyll` marker so the JS folder
ships untouched.

**Quick path:**

```bash
# 1. Create an empty repo on GitHub (web UI). Don't initialize with a README.
# 2. From this directory:
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git branch -M main
git push -u origin main
```

**Then on GitHub:**

1. Repo → **Settings** → **Pages**
2. **Source**: `GitHub Actions` (the included workflow auto-deploys on push to `main`)
3. The first push triggers the workflow; the URL appears at the top of the
   Pages settings page (typically `https://<YOUR_USER>.github.io/<YOUR_REPO>/`).

All paths in `index.html` are relative, so the site works at any subpath
(project pages or user/org pages). Hash routing (`#/atlas`, `#/wartable`)
means refreshes don't 404.

**Alternative — branch deploy without Actions:**
Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`. Same
result, no workflow file needed.

## Keyboard shortcuts

- `1` — switch to Atlas
- `2` — switch to War Table
- `/` — focus the search box for the active page
- `Esc` — clear current selection

## Routes

Hash-based routing — both pages share state but persist independently:
- `#/atlas` — Resource Atlas
- `#/wartable` — War Table

## Maps

Maps are generated at runtime by `js/maps.js` using a seeded PRNG and
SVG primitives (forest, dunes, mountains, ruins, waterways, settlements,
keeps, etc.). No external assets — works fully offline. The same region
always renders the same map.

Themes by region:
- **forest**: Hinterlands, Crestwood
- **coast**: Storm Coast
- **desert**: Western Approach, Hissing Wastes
- **sand**: Forbidden Oasis
- **swamp**: Fallow Mire
- **plains**: Exalted Plains
- **jungle**: Emerald Graves, Arbor Wilds
- **snow**: Emprise du Lion, Frostback Basin
- **village**: Haven
- **castle**: Skyhold
- **city**: Val Royeaux, Darvaarad
- **cave**: Deep Roads

## Extending

- Resources: add entries to `js/data/resources.js` (schema documented in the
  file header). Pins use normalized 0..1 coordinates.
- Missions: add entries to `js/data/wartable.js`. Schema documented in the
  file header (advisors / time per advisor / rewards per advisor / outcome).
- Maps: add a new theme or builder in `js/maps.js` if you want to refine
  any region's appearance.

## Sources

Compiled from public, fan-curated references:
- Dragon Age Wiki (`dragonage.fandom.com`) — region articles, war-table
  operations category, mission summaries.
- Fextralife DAI wiki — mission and resource pages.
- `/r/dragonage` collected guides (Sutherland chain, Halamshiral prep,
  shard hunting routes).
- GameFAQs DAI guides.
- BSN archive threads (community).

This is a **fan project**. Not affiliated with BioWare or EA.

## Project layout

```
dragonm/
├── index.html
├── css/style.css
├── js/
│   ├── app.js               # routing + atlas + war table views
│   ├── maps.js              # procedural SVG map generator (per region)
│   └── data/
│       ├── regions.js       # 17 regions
│       ├── categories.js    # 15 categories + 5 rarity tiers
│       ├── resources.js     # 162 resource entries
│       └── wartable.js      # 55+ war-table missions
└── docs/
    └── maps-preview.html    # sample render of all 17 maps for QA
```

## License

MIT for the code. Mission outcomes and resource locations are derived from
publicly documented community knowledge of a copyrighted game; this project
ships no game assets.
