# Contributing

Thanks for helping improve the DAI Atlas & War Table. This is a static
fan-companion — no build step, no framework. Edit a file, refresh the page,
ship.

## Local setup

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static server works (`npx serve`, `caddy file-server`, etc.). Opening
`index.html` directly via `file://` also works for everything except
`localStorage` quirks in some browsers.

## What to change where

| Change                                      | File                       |
| ------------------------------------------- | -------------------------- |
| Add / fix a resource location               | `js/data/resources.js`     |
| Add / fix a War Table mission               | `js/data/wartable.js`      |
| Add a region or rename one                  | `js/data/regions.js`       |
| Add / recolor a category or rarity tier     | `js/data/categories.js`    |
| Tweak the procedural map for a region       | `js/maps.js`               |
| UI / behavior                               | `js/app.js`, `css/style.css` |

The schema for each data file is documented in its header comment. Resource
coordinates are normalized — `x` and `y` go from `0` (top/left) to `1`
(bottom/right) of the map's 1000×600 viewBox.

## Validate before pushing

```bash
node scripts/validate-data.js
```

The validator checks:

- IDs are unique within each file.
- Every `region` referenced exists in `regions.js` (or is `"war-table"` for missions).
- Every `category` and `rarity` is defined.
- `x` and `y` are numbers in `[0,1]` and are set together.
- `tier` is `1..4`.
- War Table `advisors`, `recommended`, `time`, and `rewardsBy` reference
  known advisors (`cullen`, `josephine`, `leliana`).
- War Table `act` is one of the known acts.

CI runs the same validator before deploying to GitHub Pages — a broken data
file blocks deploy.

## Style

- Two-space indent, single-line entries for data records (keeps diffs tight).
- No emojis in code or data values.
- Don't reformat unrelated entries in your PR.

## Sources

When you correct a fact, link the source in the PR description (Dragon Age
Wiki page, Fextralife page, etc.). For coordinate refinements, screenshots
of the in-game map are ideal.

## License

Code is MIT. Data is derived from publicly documented community knowledge of
a copyrighted game; this repo ships no game assets and is not affiliated
with BioWare or EA.
