// Dynamic, procedurally-generated, in-engine-style SVG maps for each DAI region.
// No external assets. Deterministic per region (seeded) so a region always renders
// the same map. Themes match the in-game biomes (snow, desert, forest, swamp...).
//
// Each generator returns SVG markup sized to a 1000x600 viewBox. Pins overlay
// using the same normalized 0..1 coordinates as the resource data.

(function () {
  "use strict";

  // ---- Seeded PRNG (mulberry32) ----
  function seededRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // ---- Helpers ----
  const W = 1000, H = 600;

  function cloud(rng, cx, cy, r, points) {
    let d = "";
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2;
      const rr = r * (0.7 + rng() * 0.6);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
    }
    return d + "Z";
  }

  function jaggedLine(rng, x1, y1, x2, y2, segments, jitter) {
    let d = "M" + x1 + "," + y1 + " ";
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t + (rng() - 0.5) * jitter;
      const y = y1 + (y2 - y1) * t + (rng() - 0.5) * jitter;
      d += "L" + x.toFixed(1) + "," + y.toFixed(1) + " ";
    }
    d += "L" + x2 + "," + y2;
    return d;
  }

  function frame(theme) {
    return `
      <rect x="0" y="0" width="${W}" height="${H}" fill="${theme.base}" />
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#vignette)" />
      <rect x="6" y="6" width="${W-12}" height="${H-12}" fill="none" stroke="${theme.frame}" stroke-width="2" />
      <rect x="14" y="14" width="${W-28}" height="${H-28}" fill="none" stroke="${theme.frame}" stroke-width="0.6" opacity="0.6" />
    `;
  }

  function compass(x, y, theme) {
    return `
      <g transform="translate(${x},${y})" opacity="0.85">
        <circle r="22" fill="none" stroke="${theme.frame}" stroke-width="1" />
        <path d="M0,-22 L4,0 L0,22 L-4,0 Z" fill="${theme.frame}" opacity="0.6"/>
        <path d="M-22,0 L0,4 L22,0 L0,-4 Z" fill="${theme.frame}" opacity="0.3"/>
        <text x="0" y="-26" text-anchor="middle" font-size="9" fill="${theme.frame}" font-family="serif">N</text>
      </g>
    `;
  }

  function defs(theme) {
    return `
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="50%" stop-color="rgba(0,0,0,0)"/>
          <stop offset="100%" stop-color="${theme.vignette}"/>
        </radialGradient>
        <pattern id="parch" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="${theme.base}"/>
          <circle cx="3" cy="5" r="0.6" fill="${theme.frame}" opacity="0.07"/>
          <circle cx="14" cy="13" r="0.5" fill="${theme.frame}" opacity="0.05"/>
        </pattern>
      </defs>
    `;
  }

  function label(text, x, y, theme, size) {
    size = size || 14;
    return `<text x="${x}" y="${y}" text-anchor="middle"
      font-family="'Iowan Old Style', Georgia, serif" font-size="${size}"
      fill="${theme.frame}" font-style="italic" letter-spacing="2"
      opacity="0.85">${text}</text>`;
  }

  // ---- Theme presets ----
  const THEMES = {
    forest:   { base:"#2b3a22", frame:"#c9a14a", vignette:"rgba(0,0,0,0.7)", accent:"#4a6b35", water:"#3a5a78" },
    coast:    { base:"#1f2c3a", frame:"#c9a14a", vignette:"rgba(0,0,0,0.7)", accent:"#3a4a5e", water:"#2a4862" },
    desert:   { base:"#5e4628", frame:"#3b2a16", vignette:"rgba(0,0,0,0.5)", accent:"#82612f", water:"#4a6b78" },
    sand:     { base:"#7a5a32", frame:"#3b2a16", vignette:"rgba(0,0,0,0.45)", accent:"#a08050", water:"#5a8092" },
    snow:     { base:"#dbe6ee", frame:"#2a3848", vignette:"rgba(50,80,120,0.4)", accent:"#a8bccd", water:"#6f8ba8" },
    swamp:    { base:"#22281a", frame:"#83824a", vignette:"rgba(0,0,0,0.7)", accent:"#3a4128", water:"#1f2a22" },
    plains:   { base:"#5a5232", frame:"#c9a14a", vignette:"rgba(0,0,0,0.55)", accent:"#7a6f3e", water:"#3e5868" },
    cave:     { base:"#1a1410", frame:"#c9a14a", vignette:"rgba(0,0,0,0.85)", accent:"#332618", water:"#4a3018" },
    castle:   { base:"#2a241c", frame:"#c9a14a", vignette:"rgba(0,0,0,0.7)", accent:"#4a3e2c", water:"#2a4862" },
    city:     { base:"#3a302a", frame:"#c9a14a", vignette:"rgba(0,0,0,0.6)", accent:"#5a4a3a", water:"#2a4862" },
    village:  { base:"#cdd5db", frame:"#2a3848", vignette:"rgba(40,60,90,0.4)", accent:"#a8b0b8", water:"#5a7898" },
    jungle:   { base:"#1f3322", frame:"#c9a14a", vignette:"rgba(0,0,0,0.75)", accent:"#386040", water:"#2f5a4a" }
  };

  // ---- Reusable terrain primitives ----
  function trees(rng, theme, count, area) {
    let s = "";
    for (let i = 0; i < count; i++) {
      const x = area.x + rng() * area.w;
      const y = area.y + rng() * area.h;
      const r = 5 + rng() * 7;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${theme.accent}" opacity="${(0.5+rng()*0.4).toFixed(2)}"/>`;
      s += `<circle cx="${(x-r*0.3).toFixed(1)}" cy="${(y-r*0.3).toFixed(1)}" r="${(r*0.5).toFixed(1)}" fill="${theme.accent}" opacity="0.4"/>`;
    }
    return s;
  }

  function dunes(rng, theme, count) {
    let s = "";
    for (let i = 0; i < count; i++) {
      const cx = rng() * W;
      const cy = rng() * H;
      const w = 80 + rng() * 200;
      const h = 30 + rng() * 60;
      s += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${w.toFixed(0)}" ry="${h.toFixed(0)}" fill="${theme.accent}" opacity="${(0.15+rng()*0.25).toFixed(2)}"/>`;
    }
    return s;
  }

  function mountains(rng, theme, count, baseY) {
    let s = "";
    for (let i = 0; i < count; i++) {
      const cx = (i / count) * W + (rng() - 0.5) * 60;
      const w = 60 + rng() * 120;
      const h = 60 + rng() * 90;
      s += `<polygon points="${(cx-w/2).toFixed(0)},${baseY} ${cx.toFixed(0)},${(baseY-h).toFixed(0)} ${(cx+w/2).toFixed(0)},${baseY}" fill="${theme.accent}" opacity="0.7"/>`;
      s += `<polygon points="${(cx-w/4).toFixed(0)},${(baseY-h*0.6).toFixed(0)} ${cx.toFixed(0)},${(baseY-h).toFixed(0)} ${(cx+w/8).toFixed(0)},${(baseY-h*0.7).toFixed(0)}" fill="#fff" opacity="0.25"/>`;
    }
    return s;
  }

  function ruins(rng, theme, count) {
    let s = "";
    for (let i = 0; i < count; i++) {
      const x = 50 + rng() * (W - 100);
      const y = 80 + rng() * (H - 160);
      const w = 8 + rng() * 16;
      const h = 18 + rng() * 24;
      s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${theme.frame}" opacity="0.5"/>`;
      s += `<rect x="${(x-3).toFixed(0)}" y="${(y-4).toFixed(0)}" width="${(w+6).toFixed(0)}" height="4" fill="${theme.frame}" opacity="0.7"/>`;
    }
    return s;
  }

  function settlement(rng, theme, x, y, name) {
    let s = "";
    for (let i = 0; i < 6; i++) {
      const dx = (rng() - 0.5) * 50;
      const dy = (rng() - 0.5) * 30;
      s += `<rect x="${(x+dx).toFixed(0)}" y="${(y+dy).toFixed(0)}" width="10" height="8" fill="${theme.frame}" opacity="0.7"/>`;
      s += `<polygon points="${(x+dx).toFixed(0)},${(y+dy).toFixed(0)} ${(x+dx+5).toFixed(0)},${(y+dy-4).toFixed(0)} ${(x+dx+10).toFixed(0)},${(y+dy).toFixed(0)}" fill="${theme.frame}" opacity="0.9"/>`;
    }
    if (name) s += label(name, x, y - 28, theme, 12);
    return s;
  }

  function water(rng, theme, points) {
    let d = "M";
    points.forEach((p, i) => {
      d += (i === 0 ? "" : "L") + p[0] + "," + p[1] + " ";
    });
    d += "Z";
    return `<path d="${d}" fill="${theme.water}" opacity="0.85"/>
      <path d="${d}" fill="none" stroke="${theme.frame}" stroke-width="0.8" opacity="0.4"/>`;
  }

  function rivers(rng, theme, count) {
    let s = "";
    for (let i = 0; i < count; i++) {
      const x1 = rng() * W, y1 = rng() * H;
      const x2 = rng() * W, y2 = rng() * H;
      s += `<path d="${jaggedLine(rng, x1, y1, x2, y2, 14, 18)}" fill="none"
        stroke="${theme.water}" stroke-width="3" opacity="0.7" stroke-linecap="round"/>`;
    }
    return s;
  }

  function paths(rng, theme, count) {
    let s = "";
    for (let i = 0; i < count; i++) {
      const x1 = rng() * W, y1 = rng() * H;
      const x2 = rng() * W, y2 = rng() * H;
      s += `<path d="${jaggedLine(rng, x1, y1, x2, y2, 12, 14)}" fill="none"
        stroke="${theme.frame}" stroke-width="1" stroke-dasharray="3,4" opacity="0.4"/>`;
    }
    return s;
  }

  // ---- Per-region builders ----
  // Each returns an SVG string. Keep procedural seeds tied to region id.
  const BUILDERS = {

    hinterlands: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Lake Luthias
      s += water(rng, theme, [[300,360],[420,330],[520,380],[480,460],[360,470],[290,420]]);
      // Forest patches
      s += trees(rng, theme, 80, {x:60,y:50,w:380,h:300});
      s += trees(rng, theme, 60, {x:550,y:80,w:380,h:280});
      // Mountains south
      s += mountains(rng, theme, 8, 560);
      // Rivers
      s += rivers(rng, theme, 3);
      // Roads
      s += paths(rng, theme, 4);
      // Settlements
      s += settlement(rng, theme, 220, 280, "Crossroads");
      s += settlement(rng, theme, 620, 240, "Redcliffe");
      s += settlement(rng, theme, 480, 180, "Outskirts Camp");
      s += compass(940, 540, theme);
      s += label("THE HINTERLANDS", W/2, 50, theme, 22);
      return s;
    },

    storm_coast: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Sea on the left with jagged coast
      let d = "M0,0 ";
      for (let y = 0; y <= H; y += 25) {
        d += "L" + (240 + rng() * 60).toFixed(0) + "," + y + " ";
      }
      d += "L0," + H + " Z";
      s += `<path d="${d}" fill="${theme.water}" opacity="0.85"/>`;
      // Inland forest + cliffs
      s += trees(rng, theme, 90, {x:320,y:60,w:620,h:480});
      s += mountains(rng, theme, 6, 540);
      // Wave decoration
      for (let i = 0; i < 18; i++) {
        const x = rng() * 250;
        const y = rng() * H;
        s += `<path d="M${x},${y} q5,-3 10,0 t10,0" stroke="${theme.frame}" stroke-width="0.8" fill="none" opacity="0.4"/>`;
      }
      s += paths(rng, theme, 3);
      s += settlement(rng, theme, 550, 320, "Apostate's Landing");
      s += compass(940, 540, theme);
      s += label("THE STORM COAST", W/2, 50, theme, 22);
      return s;
    },

    crestwood: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Lake (post-drain visible)
      s += water(rng, theme, [[280,200],[520,180],[640,260],[600,360],[420,390],[260,330]]);
      // Forest
      s += trees(rng, theme, 110, {x:60,y:50,w:880,h:480});
      s += mountains(rng, theme, 5, 540);
      s += rivers(rng, theme, 2);
      s += paths(rng, theme, 3);
      // Caer Bronach (castle)
      s += `<rect x="700" y="180" width="50" height="50" fill="${theme.frame}" opacity="0.7"/>`;
      s += `<rect x="690" y="170" width="10" height="20" fill="${theme.frame}" opacity="0.9"/>`;
      s += `<rect x="745" y="170" width="10" height="20" fill="${theme.frame}" opacity="0.9"/>`;
      s += label("Caer Bronach", 725, 165, theme, 11);
      s += settlement(rng, theme, 240, 460, "Crestwood Village");
      s += compass(940, 540, theme);
      s += label("CRESTWOOD", W/2, 50, theme, 22);
      return s;
    },

    forbidden_oasis: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      s += dunes(rng, theme, 8);
      // Oasis pool
      s += water(rng, theme, [[440,300],[540,290],[580,340],[540,380],[450,370],[420,330]]);
      s += trees(rng, theme, 14, {x:430,y:280,w:160,h:100}); // palms
      // Solasan temple
      s += `<rect x="460" y="200" width="80" height="60" fill="${theme.frame}" opacity="0.65"/>`;
      s += `<polygon points="460,200 500,160 540,200" fill="${theme.frame}" opacity="0.8"/>`;
      s += label("Solasan", 500, 195, theme, 12);
      s += compass(940, 540, theme);
      s += label("THE FORBIDDEN OASIS", W/2, 50, theme, 22);
      return s;
    },

    fallow_mire: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Swamp pools
      for (let i = 0; i < 14; i++) {
        const cx = rng() * W;
        const cy = 120 + rng() * 380;
        const r = 30 + rng() * 60;
        s += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r*0.5).toFixed(0)}" fill="${theme.water}" opacity="0.85"/>`;
      }
      // Twisted dead trees
      for (let i = 0; i < 30; i++) {
        const x = rng() * W;
        const y = 60 + rng() * (H - 120);
        s += `<line x1="${x}" y1="${y}" x2="${x+(rng()-0.5)*8}" y2="${y-15-rng()*15}" stroke="${theme.frame}" stroke-width="1.4" opacity="0.7"/>`;
      }
      s += ruins(rng, theme, 5);
      s += paths(rng, theme, 2);
      // Avvar fortress
      s += `<rect x="700" y="240" width="60" height="50" fill="${theme.frame}" opacity="0.7"/>`;
      s += label("Hargol's Stronghold", 730, 230, theme, 11);
      s += compass(940, 540, theme);
      s += label("THE FALLOW MIRE", W/2, 50, theme, 22);
      return s;
    },

    western_approach: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      s += dunes(rng, theme, 10);
      // Canyon cracks
      for (let i = 0; i < 3; i++) {
        const x1 = rng() * W, y1 = rng() * H;
        const x2 = rng() * W, y2 = rng() * H;
        s += `<path d="${jaggedLine(rng, x1, y1, x2, y2, 16, 24)}" fill="none" stroke="#1a0e08" stroke-width="6" opacity="0.5"/>`;
      }
      s += ruins(rng, theme, 10);
      // Adamant fortress
      s += `<rect x="680" y="260" width="80" height="60" fill="${theme.frame}" opacity="0.65"/>`;
      s += `<rect x="670" y="250" width="12" height="20" fill="${theme.frame}" opacity="0.9"/>`;
      s += `<rect x="755" y="250" width="12" height="20" fill="${theme.frame}" opacity="0.9"/>`;
      s += label("Adamant Fortress", 720, 245, theme, 11);
      s += paths(rng, theme, 4);
      s += compass(940, 540, theme);
      s += label("THE WESTERN APPROACH", W/2, 50, theme, 22);
      return s;
    },

    exalted_plains: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Plains with battlefield ruins
      s += dunes(rng, theme, 4);
      s += ruins(rng, theme, 12);
      s += rivers(rng, theme, 2);
      // Citadelle
      s += `<rect x="500" y="160" width="80" height="60" fill="${theme.frame}" opacity="0.6"/>`;
      s += `<rect x="490" y="150" width="12" height="20" fill="${theme.frame}" opacity="0.85"/>`;
      s += `<rect x="575" y="150" width="12" height="20" fill="${theme.frame}" opacity="0.85"/>`;
      s += label("Citadelle du Corbeau", 540, 145, theme, 11);
      s += settlement(rng, theme, 280, 380, "Dalish Camp");
      s += paths(rng, theme, 5);
      s += compass(940, 540, theme);
      s += label("THE EXALTED PLAINS", W/2, 50, theme, 22);
      return s;
    },

    emerald_graves: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Dense forest with giant trees
      s += trees(rng, theme, 200, {x:30,y:50,w:940,h:500});
      // Giant ancient trees
      for (let i = 0; i < 5; i++) {
        const x = 100 + i * 180 + rng() * 40;
        const y = 200 + rng() * 200;
        s += `<circle cx="${x}" cy="${y}" r="36" fill="${theme.accent}" opacity="0.85"/>`;
        s += `<circle cx="${x-12}" cy="${y-12}" r="22" fill="${theme.accent}" opacity="0.6"/>`;
      }
      s += rivers(rng, theme, 2);
      s += ruins(rng, theme, 6);
      s += paths(rng, theme, 3);
      s += `<rect x="760" y="220" width="50" height="40" fill="${theme.frame}" opacity="0.6"/>`;
      s += label("Argon's Lodge", 785, 215, theme, 11);
      s += compass(940, 540, theme);
      s += label("THE EMERALD GRAVES", W/2, 50, theme, 22);
      return s;
    },

    emprise_du_lion: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Snow ground variations
      for (let i = 0; i < 30; i++) {
        const cx = rng() * W, cy = rng() * H;
        s += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(20+rng()*40).toFixed(0)}" fill="#fff" opacity="${(0.05+rng()*0.15).toFixed(2)}"/>`;
      }
      // Mountains
      s += mountains(rng, theme, 10, 540);
      // Frozen lake
      s += water(rng, theme, [[150,180],[330,170],[420,230],[380,310],[200,300],[120,240]]);
      // Suledin Keep
      s += `<rect x="640" y="220" width="90" height="70" fill="${theme.accent}" opacity="0.85"/>`;
      s += `<rect x="630" y="208" width="14" height="22" fill="${theme.accent}" opacity="0.95"/>`;
      s += `<rect x="725" y="208" width="14" height="22" fill="${theme.accent}" opacity="0.95"/>`;
      s += `<rect x="678" y="200" width="14" height="30" fill="${theme.accent}" opacity="0.95"/>`;
      s += label("Suledin Keep", 685, 195, theme, 11);
      s += settlement(rng, theme, 480, 420, "Sahrnia");
      // Snow flurries
      for (let i = 0; i < 50; i++) {
        const x = rng() * W, y = rng() * H;
        s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1" fill="#fff" opacity="0.6"/>`;
      }
      s += paths(rng, theme, 3);
      s += compass(940, 540, theme);
      s += label("EMPRISE DU LION", W/2, 50, theme, 22);
      return s;
    },

    hissing_wastes: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      s += dunes(rng, theme, 14);
      // Tomb pyramids (4 cardinal + central)
      const tombs = [[180,180],[800,180],[180,420],[800,420],[500,300]];
      tombs.forEach((t, i) => {
        const cx = t[0], cy = t[1];
        s += `<polygon points="${cx-40},${cy+30} ${cx},${cy-50} ${cx+40},${cy+30}" fill="${theme.frame}" opacity="0.7"/>`;
        s += `<polygon points="${cx-15},${cy-15} ${cx},${cy-50} ${cx+15},${cy-15}" fill="${theme.frame}" opacity="0.95"/>`;
      });
      s += label("Tomb of Fairel", 500, 350, theme, 11);
      // Stars (night theme)
      for (let i = 0; i < 60; i++) {
        const x = rng() * W, y = rng() * H * 0.6;
        s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="0.8" fill="#fff" opacity="${(0.3+rng()*0.5).toFixed(2)}"/>`;
      }
      s += paths(rng, theme, 2);
      s += compass(940, 540, theme);
      s += label("THE HISSING WASTES", W/2, 50, theme, 22);
      return s;
    },

    skyhold: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      s += mountains(rng, theme, 8, 560);
      // Castle complex
      const cx = 500, cy = 280;
      s += `<rect x="${cx-140}" y="${cy-30}" width="280" height="160" fill="${theme.accent}" opacity="0.8"/>`;
      // Towers
      [[-150,-60],[150,-60],[-150,140],[150,140],[0,-90]].forEach(t => {
        const x = cx + t[0], y = cy + t[1];
        s += `<rect x="${x-14}" y="${y}" width="28" height="50" fill="${theme.accent}" opacity="0.95"/>`;
        s += `<polygon points="${x-18},${y} ${x},${y-22} ${x+18},${y}" fill="${theme.accent}" opacity="0.95"/>`;
        // Banner
        s += `<rect x="${x-2}" y="${y-32}" width="4" height="14" fill="${theme.frame}" opacity="0.9"/>`;
      });
      // Bridge
      s += `<rect x="200" y="380" width="120" height="14" fill="${theme.accent}" opacity="0.7"/>`;
      s += label("SKYHOLD", W/2, 50, theme, 26);
      s += compass(940, 540, theme);
      return s;
    },

    haven: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      s += mountains(rng, theme, 9, 540);
      // Snowy ground
      for (let i = 0; i < 40; i++) {
        const cx = rng() * W, cy = 200 + rng() * 360;
        s += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(10+rng()*30).toFixed(0)}" fill="#fff" opacity="${(0.08+rng()*0.12).toFixed(2)}"/>`;
      }
      // Chantry
      s += `<rect x="450" y="280" width="100" height="60" fill="${theme.accent}" opacity="0.85"/>`;
      s += `<polygon points="450,280 500,240 550,280" fill="${theme.accent}" opacity="0.95"/>`;
      s += label("Haven Chantry", 500, 235, theme, 11);
      // Village houses
      s += settlement(rng, theme, 360, 380, "Haven");
      s += settlement(rng, theme, 620, 380, "");
      // Frozen lake
      s += water(rng, theme, [[260,460],[400,440],[480,490],[420,540],[280,540],[230,500]]);
      // Snow flurry
      for (let i = 0; i < 60; i++) {
        const x = rng() * W, y = rng() * H;
        s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1" fill="#fff" opacity="0.6"/>`;
      }
      s += compass(940, 540, theme);
      s += label("HAVEN", W/2, 50, theme, 22);
      return s;
    },

    val_royeaux: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // City grid
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 10; c++) {
          if (rng() < 0.7) {
            const x = 80 + c * 85 + rng() * 10;
            const y = 100 + r * 65 + rng() * 6;
            s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(40+rng()*30).toFixed(0)}" height="${(28+rng()*16).toFixed(0)}" fill="${theme.accent}" opacity="${(0.5+rng()*0.4).toFixed(2)}"/>`;
          }
        }
      }
      // Grand cathedral
      s += `<rect x="450" y="240" width="100" height="80" fill="${theme.frame}" opacity="0.85"/>`;
      s += `<polygon points="430,240 500,180 570,240" fill="${theme.frame}" opacity="0.95"/>`;
      s += `<rect x="494" y="200" width="12" height="50" fill="${theme.frame}" opacity="1"/>`;
      s += label("Grand Cathedral", 500, 175, theme, 11);
      s += compass(940, 540, theme);
      s += label("VAL ROYEAUX", W/2, 50, theme, 22);
      return s;
    },

    arbor_wilds: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      s += trees(rng, theme, 260, {x:30,y:50,w:940,h:500});
      // Temple of Mythal
      const cx = 500, cy = 300;
      s += `<rect x="${cx-60}" y="${cy-40}" width="120" height="100" fill="${theme.frame}" opacity="0.7"/>`;
      s += `<polygon points="${cx-70},${cy-40} ${cx},${cy-90} ${cx+70},${cy-40}" fill="${theme.frame}" opacity="0.85"/>`;
      // Eluvian glow
      s += `<ellipse cx="${cx}" cy="${cy+10}" rx="14" ry="22" fill="${theme.frame}" opacity="0.95"/>`;
      s += label("Temple of Mythal", cx, cy-95, theme, 11);
      s += paths(rng, theme, 2);
      s += compass(940, 540, theme);
      s += label("THE ARBOR WILDS", W/2, 50, theme, 22);
      return s;
    },

    frostback_basin: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      s += mountains(rng, theme, 8, 560);
      // Lake Stillwater
      s += water(rng, theme, [[260,260],[540,240],[700,310],[640,420],[420,460],[230,400]]);
      // Hakkon's peak
      s += `<polygon points="430,180 500,80 570,180" fill="${theme.accent}" opacity="0.9"/>`;
      s += `<polygon points="475,150 500,80 525,150" fill="#fff" opacity="0.7"/>`;
      s += label("Hakkon's Peak", 500, 75, theme, 12);
      // Avvar village
      s += settlement(rng, theme, 320, 380, "Stone-Bear Hold");
      s += trees(rng, theme, 60, {x:60,y:80,w:880,h:120});
      // Snow
      for (let i = 0; i < 40; i++) {
        const x = rng() * W, y = rng() * H;
        s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1" fill="#fff" opacity="0.5"/>`;
      }
      s += compass(940, 540, theme);
      s += label("FROSTBACK BASIN", W/2, 50, theme, 22);
      return s;
    },

    deep_roads: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Cavern walls (dark)
      s += `<rect x="0" y="0" width="${W}" height="${H}" fill="${theme.base}"/>`;
      // Tunnels (lighter blobs)
      for (let i = 0; i < 12; i++) {
        const cx = rng() * W;
        const cy = 80 + rng() * (H - 160);
        s += `<path d="${cloud(rng, cx, cy, 60+rng()*60, 14)}" fill="${theme.accent}" opacity="0.85"/>`;
      }
      // Connect tunnels with paths
      for (let i = 0; i < 8; i++) {
        const x1 = rng() * W, y1 = rng() * H;
        const x2 = rng() * W, y2 = rng() * H;
        s += `<path d="${jaggedLine(rng, x1, y1, x2, y2, 14, 16)}" fill="none" stroke="${theme.accent}" stroke-width="14" opacity="0.5" stroke-linecap="round"/>`;
      }
      // Lyrium veins (red glow)
      for (let i = 0; i < 6; i++) {
        const x1 = rng() * W, y1 = rng() * H;
        const x2 = rng() * W, y2 = rng() * H;
        s += `<path d="${jaggedLine(rng, x1, y1, x2, y2, 12, 18)}" fill="none" stroke="#c14a4a" stroke-width="1.6" opacity="0.7"/>`;
      }
      // The Heart
      s += `<circle cx="500" cy="320" r="48" fill="#c14a4a" opacity="0.5"/>`;
      s += `<circle cx="500" cy="320" r="22" fill="#c14a4a" opacity="0.85"/>`;
      s += label("The Heart (Titan)", 500, 270, theme, 12);
      s += compass(940, 540, theme);
      s += label("THE DEEP ROADS", W/2, 50, theme, 22);
      return s;
    },

    darvaarad: function (rng, theme) {
      let s = defs(theme) + frame(theme);
      // Industrial Qunari - orderly grid + red lyrium glow
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 8; c++) {
          if (rng() < 0.65) {
            const x = 100 + c * 100 + rng() * 8;
            const y = 120 + r * 70 + rng() * 6;
            s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="50" height="40" fill="${theme.accent}" opacity="${(0.5+rng()*0.4).toFixed(2)}"/>`;
          }
        }
      }
      // Eluvian
      s += `<ellipse cx="500" cy="320" rx="22" ry="50" fill="#9ad" opacity="0.7"/>`;
      s += `<ellipse cx="500" cy="320" rx="14" ry="40" fill="#cef" opacity="0.5"/>`;
      s += label("Eluvian Crossroads", 500, 260, theme, 12);
      // Red lyrium glow
      for (let i = 0; i < 12; i++) {
        const x = rng() * W, y = rng() * H;
        s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(2+rng()*4).toFixed(1)}" fill="#c14a4a" opacity="0.4"/>`;
      }
      s += compass(940, 540, theme);
      s += label("THE DARVAARAD", W/2, 50, theme, 22);
      return s;
    }
  };

  // ---- Theme picker by region id ----
  const REGION_THEME = {
    hinterlands:      "forest",
    storm_coast:      "coast",
    crestwood:        "forest",
    forbidden_oasis:  "sand",
    fallow_mire:      "swamp",
    western_approach: "desert",
    exalted_plains:   "plains",
    emerald_graves:   "jungle",
    emprise_du_lion:  "snow",
    hissing_wastes:   "desert",
    skyhold:          "castle",
    haven:            "village",
    val_royeaux:      "city",
    arbor_wilds:      "jungle",
    frostback_basin:  "snow",
    deep_roads:       "cave",
    darvaarad:        "city"
  };

  // ---- Public API ----
  window.DAI_MAPS = {
    width:  W,
    height: H,
    render: function (regionId) {
      const theme = THEMES[REGION_THEME[regionId] || "forest"];
      const seed  = hashString(regionId);
      const rng   = seededRng(seed);
      const builder = BUILDERS[regionId];
      const inner = builder ? builder(rng, theme) : defs(theme) + frame(theme) + label((regionId || "").toUpperCase(), W/2, H/2, theme, 24);
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="dai-map-svg">${inner}</svg>`;
    }
  };
})();
