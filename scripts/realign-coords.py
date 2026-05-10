#!/usr/bin/env python3
"""
Re-align resource pin coordinates against the real in-game map images
sourced from game-maps.com. The previous coords were chosen against the
procedural SVG maps and don't match the real ones.

Each entry below is keyed by resource id and gives (x, y) in normalized
[0..1] coordinates. The script rewrites js/data/resources.js in place,
matching each entry by `id: "..."` and replacing its `x: N, y: N` pair.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "js" / "data" / "resources.js"

# Coordinates derived from visual inspection of maps/<region>.jpg.
# Conventions:
#   - "general" resources land in the explorable centre of the region
#   - shards spread to corners/edges as the in-game placements indicate
#   - named landmarks (dragons, agents, keeps) sit on the visible feature
COORDS = {
  # ---- HINTERLANDS (square, full canvas explorable) ----
  "hin-iron-1":            (0.45, 0.50),
  "hin-iron-2":            (0.40, 0.30),
  "hin-elfroot-1":         (0.40, 0.55),
  "hin-spindle-1":         (0.30, 0.55),
  "hin-bloodlotus-1":      (0.32, 0.85),
  "hin-embrium-1":         (0.50, 0.35),
  "hin-druffalo-1":        (0.45, 0.55),
  "hin-ramleather-1":      (0.55, 0.45),
  "hin-cotton-1":          (0.40, 0.50),
  "hin-logging-1":         (0.35, 0.30),
  "hin-shard-1":           (0.20, 0.45),
  "hin-shard-2":           (0.45, 0.18),
  "hin-shard-3":           (0.65, 0.45),
  "hin-shard-4":           (0.50, 0.65),
  "hin-shard-5":           (0.32, 0.88),
  "hin-astra-1":           (0.45, 0.22),
  "hin-dragon-fereldan":   (0.22, 0.87),  # Lady Shayna's Valley — south-west of the explorable area
  "hin-agent-blackwall":   (0.30, 0.55),
  "hin-agent-horsemaster": (0.60, 0.65),
  "hin-quest-templars":    (0.40, 0.50),
  "lm-hin-calenhad":       (0.65, 0.10),
  "lm-hin-luthias":        (0.30, 0.45),

  # ---- STORM COAST (portrait 3:4) ----
  # Mainland is the right two-thirds of the image; the left third is ocean.
  # Anything below x≈0.50 in the upper half lands in water.
  "sto-iron-1":            (0.62, 0.52),
  "sto-silverite-1":       (0.66, 0.36),
  "sto-obsidian-1":        (0.78, 0.45),
  "sto-elfroot-1":         (0.55, 0.55),
  "sto-spindle-1":         (0.52, 0.65),
  "sto-rams-1":            (0.62, 0.42),
  "sto-bear-1":            (0.65, 0.58),
  "sto-cotton-1":          (0.58, 0.50),
  "sto-shard-1":           (0.55, 0.13),
  "sto-shard-2":           (0.66, 0.20),
  "sto-shard-3":           (0.80, 0.42),
  "sto-shard-4":           (0.58, 0.75),
  "sto-astra-1":           (0.65, 0.28),
  "sto-dragon-vinsomer":   (0.13, 0.06),  # Dragon Island — small isle top-left
  "sto-agent-bull":        (0.62, 0.42),
  "lm-sto-driftwood":      (0.58, 0.12),
  "lm-sto-lighthouse":     (0.55, 0.20),

  # ---- CRESTWOOD (portrait 4:5) ----
  "cre-iron-1":            (0.40, 0.50),
  "cre-silverite-1":       (0.55, 0.42),
  "cre-elfroot-1":         (0.30, 0.55),
  "cre-velvet-1":          (0.42, 0.18),
  "cre-shard-1":           (0.50, 0.18),
  "cre-shard-2":           (0.65, 0.42),
  "cre-shard-3":           (0.20, 0.40),
  "cre-shard-4":           (0.50, 0.72),
  "cre-astra-1":           (0.45, 0.25),
  "cre-quest-stillwaters": (0.40, 0.45),
  "cre-mosaic-archive-1":  (0.45, 0.50),
  "lm-cre-old-crest":      (0.30, 0.45),
  "lm-cre-bronach":        (0.40, 0.18),

  # ---- FORBIDDEN OASIS (very tall — explorable in top 40%) ----
  "oas-iron-1":            (0.45, 0.18),
  "oas-silverite-1":       (0.35, 0.28),
  "oas-shard-tier":        (0.50, 0.12),
  "oas-quest-jaws":        (0.50, 0.13),
  "oas-codex-solas":       (0.50, 0.16),

  # ---- FALLOW MIRE (portrait) ----
  "fal-iron-1":            (0.45, 0.30),
  "fal-silverite-1":       (0.40, 0.45),
  "fal-bloodlotus-1":      (0.35, 0.55),
  "fal-deepmushroom":      (0.45, 0.40),
  "fal-quest-soldiers":    (0.55, 0.20),
  "lm-fal-hargol":         (0.55, 0.20),

  # ---- WESTERN APPROACH (very tall portrait — explorable upper 75%) ----
  "wes-silverite-1":       (0.45, 0.30),
  "wes-stormheart-1":      (0.30, 0.40),
  "wes-velvet-1":          (0.50, 0.35),
  "wes-snoufleur-1":       (0.50, 0.18),
  "wes-shard-1":           (0.35, 0.08),
  "wes-shard-2":           (0.40, 0.40),
  "wes-shard-3":           (0.20, 0.30),
  "wes-shard-4":           (0.40, 0.65),
  "wes-shard-5":           (0.65, 0.55),
  "wes-astra-1":           (0.45, 0.40),
  "wes-dragon-abyssal":    (0.65, 0.45),
  "wes-quest-here-lies":   (0.50, 0.35),
  "lm-wes-coracavus":      (0.20, 0.28),
  "lm-wes-bridge":         (0.40, 0.42),

  # ---- EXALTED PLAINS (portrait) ----
  "exa-iron-1":            (0.40, 0.40),
  "exa-silverite-1":       (0.45, 0.28),
  "exa-dawnstone-1":       (0.55, 0.18),
  "exa-elfroot-1":         (0.45, 0.35),
  "exa-prophets-1":        (0.30, 0.45),
  "exa-velvet-1":          (0.50, 0.30),
  "exa-shard-1":           (0.18, 0.20),
  "exa-shard-2":           (0.30, 0.05),
  "exa-shard-3":           (0.65, 0.20),
  "exa-shard-4":           (0.35, 0.85),
  "exa-astra-1":           (0.40, 0.50),
  "exa-dragon-storm":      (0.75, 0.20),
  "exa-quest-bones":       (0.40, 0.40),
  "lm-exa-citadelle":      (0.35, 0.10),

  # ---- EMERALD GRAVES (very portrait, river splits) ----
  "eme-iron-1":            (0.40, 0.40),
  "eme-silverite-1":       (0.50, 0.50),
  "eme-everite-1":         (0.55, 0.42),
  "eme-bloodstone-1":      (0.30, 0.28),
  "eme-velvet-1":          (0.50, 0.45),
  "eme-loden-1":            (0.30, 0.35),
  "eme-greatbear-1":       (0.40, 0.55),
  "eme-shard-1":           (0.20, 0.20),
  "eme-shard-2":           (0.45, 0.05),
  "eme-shard-3":           (0.65, 0.40),
  "eme-shard-4":           (0.40, 0.85),
  "eme-astra-1":           (0.45, 0.40),
  "eme-dragon-greater":    (0.20, 0.30),
  "eme-dragon-northern":   (0.65, 0.30),
  "eme-quest-freemen":     (0.40, 0.55),
  "lm-eme-watchers":       (0.40, 0.10),

  # ---- EMPRISE DU LION (square) ----
  "emp-iron-1":            (0.40, 0.50),
  "emp-silverite-1":       (0.45, 0.40),
  "emp-paragons-1":        (0.55, 0.45),
  "emp-aurum-1":           (0.20, 0.18),
  "emp-snoufleur-1":       (0.30, 0.55),
  "emp-greatbear-1":       (0.55, 0.55),
  "emp-loden-1":           (0.40, 0.65),
  "emp-highever-1":        (0.55, 0.30),
  "emp-shard-1":           (0.20, 0.10),
  "emp-shard-2":           (0.40, 0.10),
  "emp-shard-3":           (0.55, 0.40),
  "emp-shard-4":           (0.40, 0.70),
  "emp-shard-5":           (0.70, 0.65),
  "emp-astra-1":           (0.40, 0.30),
  "emp-dragon-hivernal":   (0.10, 0.10),
  "emp-dragon-kalt":       (0.30, 0.10),
  "emp-dragon-highland":   (0.85, 0.20),
  "emp-quest-suledin":     (0.50, 0.40),
  "lm-emp-suledin":        (0.50, 0.40),

  # ---- HISSING WASTES (square) ----
  "his-iron-1":            (0.40, 0.40),
  "his-silverite-1":       (0.45, 0.50),
  "his-aurum-1":            (0.65, 0.30),
  "his-onyx-1":            (0.25, 0.45),
  "his-velvet-1":          (0.50, 0.55),
  "his-highever-1":        (0.65, 0.50),
  "his-felandaris-1":      (0.40, 0.65),
  "his-shard-1":           (0.20, 0.20),
  "his-shard-2":           (0.45, 0.12),
  "his-shard-3":           (0.70, 0.40),
  "his-shard-4":           (0.30, 0.50),
  "his-shard-5":           (0.50, 0.68),
  "his-shard-6":           (0.78, 0.65),
  "his-astra-1":           (0.50, 0.45),
  "his-dragon-sandy":      (0.85, 0.45),
  "his-quest-tombs":       (0.50, 0.40),
  "lm-his-fairel":         (0.50, 0.40),
  "lm-his-stones":         (0.30, 0.68),

  # ---- FROSTBACK BASIN (portrait, Hakkon DLC) ----
  "fro-stormheart-1":      (0.40, 0.40),
  "fro-aurum-1":           (0.50, 0.20),
  "fro-silkbrocade":       (0.40, 0.50),
  "fro-snoufleur-1":       (0.50, 0.50),
  "fro-felandaris-1":      (0.30, 0.50),
  "fro-prophets-1":        (0.35, 0.30),
  "fro-shard-1":           (0.50, 0.40),
  "fro-dragon-hakkon":     (0.45, 0.10),
  "fro-quest-jaws":        (0.50, 0.40),
  "lm-fro-hakkon-peak":    (0.45, 0.10),

  # ---- HAVEN (landscape) ----
  "hav-iron-1":            (0.45, 0.45),
  "hav-elfroot-1":         (0.50, 0.55),
  "hav-quest-breach":      (0.50, 0.45),

  # ---- VAL ROYEAUX (very portrait) ----
  "val-shop-1":            (0.50, 0.30),
  "val-codex-1":           (0.50, 0.35),

  # ---- ARBOR WILDS (Temple of Mythal — small near-square) ----
  "arb-quest-temple":      (0.50, 0.50),
  "arb-codex-1":           (0.50, 0.50),
}

def apply():
    text = SRC.read_text()
    updated = 0
    missed = []

    # Match: { id: "<id>", ... x: <num>, y: <num>, ...
    # We rewrite x and y individually within the line that contains the id.
    for rid, (nx, ny) in COORDS.items():
        # Build a regex that finds the entire entry line for this id and
        # replaces its x: and y: numeric pairs.
        # The id appears inside a single object literal ending with `}` on
        # the same line in this file format.
        line_pat = re.compile(
            r'(\{[^{}]*\bid:\s*"' + re.escape(rid) + r'"[^{}]*?)'
            r'\bx:\s*-?\d*\.?\d+([^{}]*?)'
            r'\by:\s*-?\d*\.?\d+',
            re.S)
        new_text, n = line_pat.subn(
            lambda m: m.group(1) + f"x: {nx}" + m.group(2) + f"y: {ny}",
            text, count=1)
        if n == 0:
            missed.append(rid)
        else:
            text = new_text
            updated += 1

    SRC.write_text(text)
    print(f"updated {updated} resources")
    if missed:
        print(f"WARN: {len(missed)} ids not matched:", ", ".join(missed))
        sys.exit(1)

if __name__ == "__main__":
    apply()
