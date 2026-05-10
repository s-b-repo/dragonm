(function () {
  "use strict";

  const REGIONS    = window.DAI_REGIONS;
  const CATEGORIES = window.DAI_CATEGORIES;
  const RARITY     = window.DAI_RARITY;
  const RESOURCES  = window.DAI_RESOURCES;
  const WT         = window.DAI_WARTABLE;
  const MAPS       = window.DAI_MAPS;

  const ADVISOR_META = {
    cullen:    { name: "Cullen",    color: "#b04a3a" },
    josephine: { name: "Josephine", color: "#c9a14a" },
    leliana:   { name: "Leliana",   color: "#4f7ea3" }
  };

  const WT_CATEGORIES = [
    { id: "story",         name: "Story" },
    { id: "region-unlock", name: "Region unlock" },
    { id: "recruit",       name: "Recruit" },
    { id: "approval",      name: "Approval" },
    { id: "reward",        name: "Reward" },
    { id: "choice",        name: "Choice" },
    { id: "dlc",           name: "DLC" },
    { id: "misc",          name: "Other" }
  ];

  const ACTS = ["Prologue", "Act 1", "Act 1+", "Act 2", "Act 3", "DLC: Hakkon", "DLC: Descent", "DLC: Trespasser"];

  const catColor    = id => (CATEGORIES.find(c => c.id === id) || {}).color || "#888";
  const catName     = id => (CATEGORIES.find(c => c.id === id) || {}).name  || id;
  const regionName  = id => (REGIONS.find(r => r.id === id)    || {}).name  || id;
  const rarityName  = id => (RARITY.find(r => r.id === id)     || {}).name  || id;
  const rarityColor = id => (RARITY.find(r => r.id === id)     || {}).color || "#888";
  const wtCatName   = id => (WT_CATEGORIES.find(c => c.id === id) || {}).name || id;

  // ---- App state ----
  const state = {
    route: "atlas",
    search: "",
    activeRegions: new Set(),
    activeCategories: new Set(),
    activeRarities: new Set(),
    selected: null,
    view: "map",
    currentRegion: REGIONS[0].id,
    wtSearch: "",
    wtActiveActs: new Set(),
    wtActiveAdvisors: new Set(),
    wtActiveCategories: new Set(),
    wtActiveRegions: new Set(),
    wtSelected: null
  };

  // ---- DOM refs ----
  const $ = sel => document.querySelector(sel);
  const els = {
    body:          document.body,
    routeAtlas:    $("#route-atlas"),
    routeWartable: $("#route-wartable"),
    navlinks:      document.querySelectorAll(".navlink"),
    counts:        $("#counts"),
    toggleSidebar: $("#toggleSidebar"),
    toggleDetail:  $("#toggleDetail"),
    mobileBackdrop:$("#mobileBackdrop"),
    // atlas
    search:        $("#search"),
    regionList:    $("#regionList"),
    categoryList:  $("#categoryList"),
    rarityList:    $("#rarityList"),
    legendList:    $("#legendList"),
    clearFilters:  $("#clearFilters"),
    toggleView:    $("#toggleView"),
    regionSelect:  $("#regionSelect"),
    regionMeta:    $("#regionMeta"),
    mapStage:      $("#mapStage"),
    mapSvgHost:    $("#mapSvgHost"),
    pinLayer:      $("#pinLayer"),
    mapView:       $("#mapView"),
    listView:      $("#listView"),
    resultsList:   $("#resultsList"),
    detail:        $("#detail"),
    // war table
    wtSearch:        $("#wtSearch"),
    wtActList:       $("#wtActList"),
    wtAdvisorList:   $("#wtAdvisorList"),
    wtCategoryList:  $("#wtCategoryList"),
    wtRegionList:    $("#wtRegionList"),
    wtClearFilters:  $("#wtClearFilters"),
    wtList:          $("#wtList"),
    wtDetail:        $("#wtDetail"),
    wtCounts:        $("#wtCounts")
  };

  // pillGroups[key] = { container, items: [{ id, button }], activeSet, getColor }
  const pillGroups = {};

  // ---- Routing ----
  function applyRoute() {
    const r = state.route;
    els.routeAtlas.classList.toggle("hidden", r !== "atlas");
    els.routeWartable.classList.toggle("hidden", r !== "wartable");
    els.navlinks.forEach(a => {
      const isActive = a.getAttribute("data-route") === r;
      a.classList.toggle("active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (r === "atlas") {
      const total = RESOURCES.length;
      const visible = filterResources().length;
      const fc = activeFilterCount("atlas");
      els.counts.textContent = visible + " / " + total + " resources" + (fc ? " · " + fc + " filter" + (fc > 1 ? "s" : "") + " active" : "");
    } else {
      const total = WT.length;
      const visible = filterMissions().length;
      const fc = activeFilterCount("wt");
      els.counts.textContent = visible + " / " + total + " missions" + (fc ? " · " + fc + " filter" + (fc > 1 ? "s" : "") + " active" : "");
    }
  }

  function activeFilterCount(which) {
    if (which === "atlas") {
      return state.activeRegions.size + state.activeCategories.size + state.activeRarities.size + (state.search ? 1 : 0);
    }
    return state.wtActiveActs.size + state.wtActiveAdvisors.size + state.wtActiveCategories.size + state.wtActiveRegions.size + (state.wtSearch ? 1 : 0);
  }

  function parseRoute() {
    const hash = (location.hash || "").replace(/^#\/?/, "");
    // Strip query/sub-path, e.g. "wartable?foo=1" or "wartable/extra"
    const path = hash.split(/[?\/]/)[0];
    state.route = path === "wartable" ? "wartable" : "atlas";
  }

  // ============================================================
  // ATLAS
  // ============================================================
  function filterResources() {
    const q = state.search.trim().toLowerCase();
    return RESOURCES.filter(r => {
      if (state.activeRegions.size && !state.activeRegions.has(r.region)) return false;
      if (state.activeCategories.size && !state.activeCategories.has(r.category)) return false;
      if (state.activeRarities.size && !state.activeRarities.has(r.rarity)) return false;
      if (!q) return true;
      const haystack = [
        r.name, r.desc || "", r.source || "",
        regionName(r.region), catName(r.category), rarityName(r.rarity),
        ...(r.tags || [])
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }

  function buildPillGroup(key, container, items, activeSet, getColor) {
    container.innerHTML = "";
    const entry = { container, items: [], activeSet, getColor: getColor || null };
    items.forEach(item => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "pill";
      pill.textContent = item.name;
      pill.setAttribute("aria-pressed", activeSet.has(item.id) ? "true" : "false");
      if (getColor) {
        pill.dataset.color = getColor(item);
      }
      pill.addEventListener("click", () => {
        // Atlas region is single-select: the map only shows one region at a
        // time, so clicking a region replaces the previous selection rather
        // than stacking. Clicking the active region deselects it.
        if (key === "atlas-region") {
          const wasActive = activeSet.has(item.id);
          activeSet.clear();
          if (!wasActive) {
            activeSet.add(item.id);
            state.currentRegion = item.id;
          }
        } else {
          if (activeSet.has(item.id)) activeSet.delete(item.id);
          else activeSet.add(item.id);
        }
        // Filter changes can leave a now-hidden selection; clear it.
        if (key.startsWith("atlas-")) state.selected = null;
        if (key.startsWith("wt-"))    state.wtSelected = null;
        render();
      });
      container.appendChild(pill);
      entry.items.push({ id: item.id, button: pill });
    });
    pillGroups[key] = entry;
    syncPillGroup(key);
  }

  function syncPillGroup(key) {
    const entry = pillGroups[key];
    if (!entry) return;
    entry.items.forEach(({ id, button }) => {
      const active = entry.activeSet.has(id);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      if (entry.getColor) {
        button.style.borderLeft = active ? "" : ("3px solid " + button.dataset.color);
      }
    });
  }

  function renderLegend() {
    els.legendList.innerHTML = "";
    CATEGORIES.forEach(c => {
      const li = document.createElement("li");
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = c.color;
      dot.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.textContent = c.name;
      li.appendChild(dot);
      li.appendChild(label);
      els.legendList.appendChild(li);
    });
  }

  function renderRegionSelect() {
    if (!els.regionSelect.options.length) {
      REGIONS.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.id;
        opt.textContent = r.name + " — " + r.act;
        els.regionSelect.appendChild(opt);
      });
    }
    els.regionSelect.value = state.currentRegion;
    const region = REGIONS.find(r => r.id === state.currentRegion);
    els.regionMeta.textContent = region ? region.notes : "";
  }

  let lastMapRegion = null;
  function renderMapSvg() {
    if (lastMapRegion === state.currentRegion) return;
    const region = REGIONS.find(r => r.id === state.currentRegion);
    els.mapSvgHost.innerHTML = region
      ? MAPS.renderForRegion(region)
      : MAPS.renderProcedural(state.currentRegion, state.currentRegion);

    // Lock the host's aspect ratio to the image so pins (positioned in 0..1
    // coords inside the host) land on the correct image pixels at every zoom.
    const size = (region && region.mapImageSize) || { w: 1000, h: 600 };
    els.mapSvgHost.style.setProperty("--map-aspect",   size.w + " / " + size.h);
    els.mapSvgHost.style.setProperty("--map-aspect-w", size.w);
    els.mapSvgHost.style.setProperty("--map-aspect-h", size.h);

    // Co-locate the pin layer with the host so they share the same box.
    if (els.pinLayer.parentNode !== els.mapSvgHost) {
      els.mapSvgHost.appendChild(els.pinLayer);
    }

    if (typeof MAPS.attachFailover === "function") {
      MAPS.attachFailover(els.mapSvgHost);
    }
    lastMapRegion = state.currentRegion;
  }

  function renderPins() {
    els.pinLayer.innerHTML = "";
    const filtered = filterResources();
    const inRegion = filtered.filter(r => r.region === state.currentRegion);

    inRegion.forEach(r => {
      if (typeof r.x !== "number" || typeof r.y !== "number") return;
      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = "pin" + (state.selected && state.selected.id === r.id ? " selected" : "");
      pin.style.background = catColor(r.category);
      pin.style.left = (r.x * 100) + "%";
      pin.style.top  = (r.y * 100) + "%";
      const label = r.name + " — " + catName(r.category) + " · " + rarityName(r.rarity);
      pin.title = label;
      pin.setAttribute("aria-label", label);
      pin.setAttribute("aria-pressed", state.selected && state.selected.id === r.id ? "true" : "false");
      pin.addEventListener("click", () => {
        state.selected = r;
        render();
      });
      els.pinLayer.appendChild(pin);
    });
  }

  function renderList() {
    const filtered = filterResources();
    const byRegion = {};
    filtered.forEach(r => {
      (byRegion[r.region] = byRegion[r.region] || []).push(r);
    });

    els.resultsList.innerHTML = "";
    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.className = "dim";
      empty.textContent = "No resources match the current filters.";
      els.resultsList.appendChild(empty);
      return;
    }

    REGIONS.forEach(region => {
      const items = byRegion[region.id];
      if (!items || items.length === 0) return;
      const block = document.createElement("div");
      block.className = "region-block";
      const h2 = document.createElement("h2");
      h2.textContent = region.name + " — " + region.act + "  (" + items.length + ")";
      block.appendChild(h2);

      items.forEach(r => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "resource-row" + (state.selected && state.selected.id === r.id ? " selected" : "");

        const dot = document.createElement("span");
        dot.className = "dot";
        dot.style.background = catColor(r.category);
        dot.setAttribute("aria-hidden", "true");
        row.appendChild(dot);

        const name = document.createElement("span");
        name.className = "resource-name";
        name.textContent = r.name;
        row.appendChild(name);

        const catBadge = document.createElement("span");
        catBadge.className = "resource-cat-badge";
        catBadge.textContent = catName(r.category);
        catBadge.style.color = catColor(r.category);
        row.appendChild(catBadge);

        const meta = document.createElement("span");
        meta.className = "resource-meta";
        meta.textContent = r.tier ? "T" + r.tier : "";
        row.appendChild(meta);

        const rar = document.createElement("span");
        rar.className = "resource-rarity";
        rar.textContent = rarityName(r.rarity);
        rar.style.color = rarityColor(r.rarity);
        rar.style.borderColor = rarityColor(r.rarity);
        row.appendChild(rar);

        row.addEventListener("click", () => {
          state.selected = r;
          render();
        });

        block.appendChild(row);
      });
      els.resultsList.appendChild(block);
    });
  }

  function renderDetail() {
    if (!state.selected) {
      els.detail.innerHTML = '<div class="detail-empty">Select a pin or list entry to see details.</div>';
      return;
    }
    const r = state.selected;
    const region = REGIONS.find(x => x.id === r.region) || {};
    const html = [];
    html.push('<div class="detail-card">');
    html.push('  <h2>' + escapeHtml(r.name) + '</h2>');
    html.push('  <div class="sub">' + escapeHtml(catName(r.category)) +
              ' · ' + escapeHtml(region.name || r.region) +
              ' · ' + escapeHtml(rarityName(r.rarity)) +
              (r.tier ? ' · Tier ' + r.tier : '') + '</div>');

    if (r.desc) {
      html.push('<div class="detail-section"><h4>Description</h4><p>' + escapeHtml(r.desc) + '</p></div>');
    }
    if (r.source) {
      html.push('<div class="detail-section"><h4>Where / How</h4><p>' + escapeHtml(r.source) + '</p></div>');
    }
    if (region.notes) {
      html.push('<div class="detail-section"><h4>Region Notes</h4><p>' + escapeHtml(region.notes) + '</p></div>');
    }
    if (typeof r.x === "number" && typeof r.y === "number") {
      html.push('<div class="detail-section"><h4>Map Coords (normalized)</h4>');
      html.push('  <table class="coords-table">');
      html.push('    <tr><td>x</td><td>' + r.x.toFixed(3) + '</td></tr>');
      html.push('    <tr><td>y</td><td>' + r.y.toFixed(3) + '</td></tr>');
      html.push('  </table></div>');
    }
    if (r.tags && r.tags.length) {
      html.push('<div class="detail-section"><h4>Tags</h4><div class="tags">');
      r.tags.forEach(t => html.push('<span class="tag">' + escapeHtml(t) + '</span>'));
      html.push('</div></div>');
    }
    html.push('  <div class="detail-section">');
    html.push('    <button class="btn ghost full" id="jumpToRegion" type="button">Jump map to ' + escapeHtml(region.name || r.region) + '</button>');
    html.push('  </div>');
    html.push('</div>');

    els.detail.innerHTML = html.join("\n");
    const btn = document.getElementById("jumpToRegion");
    if (btn) {
      btn.addEventListener("click", () => {
        state.currentRegion = r.region;
        state.view = "map";
        render();
      });
    }
  }

  function applyAtlasView() {
    if (state.view === "map") {
      els.mapView.classList.remove("hidden");
      els.listView.classList.add("hidden");
    } else {
      els.mapView.classList.add("hidden");
      els.listView.classList.remove("hidden");
    }
  }

  // ============================================================
  // WAR TABLE
  // ============================================================
  function filterMissions() {
    const q = state.wtSearch.trim().toLowerCase();
    return WT.filter(m => {
      if (state.wtActiveActs.size && !state.wtActiveActs.has(m.act)) return false;
      if (state.wtActiveCategories.size && !state.wtActiveCategories.has(m.category)) return false;
      if (state.wtActiveRegions.size && !state.wtActiveRegions.has(m.region)) return false;
      if (state.wtActiveAdvisors.size) {
        const ms = new Set(m.advisors || []);
        let any = false;
        state.wtActiveAdvisors.forEach(a => { if (ms.has(a)) any = true; });
        if (!any) return false;
      }
      if (!q) return true;
      const hay = [
        m.name, m.act, m.category,
        m.prerequisites || "", m.defaultRewards || "", m.outcome || "",
        m.notes || "", regionName(m.region) || "",
        ...(m.advisors || []),
        ...(m.tags || [])
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  function buildWtFilters() {
    buildPillGroup("wt-act", els.wtActList,
      ACTS.map(a => ({ id: a, name: a })),
      state.wtActiveActs);
    buildPillGroup("wt-advisor", els.wtAdvisorList,
      Object.keys(ADVISOR_META).map(a => ({ id: a, name: ADVISOR_META[a].name })),
      state.wtActiveAdvisors,
      item => ADVISOR_META[item.id].color);
    buildPillGroup("wt-category", els.wtCategoryList, WT_CATEGORIES, state.wtActiveCategories);
    const regionSet = new Set(WT.map(m => m.region).filter(r => r && r !== "war-table"));
    const regionItems = REGIONS.filter(r => regionSet.has(r.id));
    buildPillGroup("wt-region", els.wtRegionList, regionItems, state.wtActiveRegions);
  }

  function syncWtFilters() {
    syncPillGroup("wt-act");
    syncPillGroup("wt-advisor");
    syncPillGroup("wt-category");
    syncPillGroup("wt-region");
  }

  function advisorPill(advisor, recommended) {
    const cls = ["wt-pill", "advisor-" + advisor];
    if (recommended) cls.push("recommended");
    return '<span class="' + cls.join(" ") + '">' + escapeHtml(ADVISOR_META[advisor].name) +
           (recommended ? " ★" : "") + '</span>';
  }

  function renderWtList() {
    const list = filterMissions();
    els.wtList.innerHTML = "";
    if (list.length === 0) {
      els.wtList.innerHTML = '<div class="wt-empty">No missions match the current filters.</div>';
      els.wtCounts.textContent = "0 of " + WT.length + " missions";
      return;
    }
    list.forEach(m => {
      const card = document.createElement("div");
      card.className = "wt-card" + (state.wtSelected && state.wtSelected.id === m.id ? " selected" : "");
      // Card contains an <h3>; a <button> wrapper would be invalid HTML.
      // Use ARIA + tabindex + Enter/Space keyboard handler.
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-pressed", state.wtSelected && state.wtSelected.id === m.id ? "true" : "false");
      card.setAttribute("aria-label", m.name + " — " + m.act + " — " + wtCatName(m.category));

      const head = document.createElement("div");
      head.className = "wt-card-head";
      head.innerHTML =
        '<h3>' + escapeHtml(m.name) + '</h3>' +
        '<span class="wt-act">' + escapeHtml(m.act) + '</span>';
      card.appendChild(head);

      const row = document.createElement("div");
      row.className = "wt-card-row";
      row.innerHTML =
        '<span class="wt-pill cat">' + escapeHtml(wtCatName(m.category)) + '</span>' +
        (m.region && m.region !== "war-table"
          ? '<span class="wt-pill">' + escapeHtml(regionName(m.region)) + '</span>'
          : '') +
        (typeof m.power === "number" && m.power > 0
          ? '<span class="wt-pill">Power ' + m.power + '</span>'
          : '') +
        (m.advisors || []).map(a => advisorPill(a, m.recommended === a)).join("");
      card.appendChild(row);

      if (m.outcome) {
        const body = document.createElement("div");
        body.className = "wt-card-body";
        body.textContent = m.outcome;
        card.appendChild(body);
      }

      const select = () => {
        state.wtSelected = m;
        render();
      };
      card.addEventListener("click", select);
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      });

      els.wtList.appendChild(card);
    });
    els.wtCounts.textContent = list.length + " of " + WT.length + " missions";
  }

  function renderWtDetail() {
    if (!state.wtSelected) {
      els.wtDetail.innerHTML = '<div class="detail-empty">Select a mission for full requirements and outcomes.</div>';
      return;
    }
    const m = state.wtSelected;
    const html = [];
    html.push('<div class="detail-card">');
    html.push('  <h2>' + escapeHtml(m.name) + '</h2>');
    const sub = [m.act, wtCatName(m.category)];
    if (m.region && m.region !== "war-table") sub.push(regionName(m.region));
    html.push('  <div class="sub">' + escapeHtml(sub.join(" · ")) + '</div>');

    if (m.prerequisites) {
      html.push('<div class="detail-section"><h4>Prerequisites</h4><p>' + escapeHtml(m.prerequisites) + '</p></div>');
    }

    if (typeof m.power === "number" && m.power > 0) {
      html.push('<div class="detail-section"><h4>Power Cost</h4><p>' + m.power + '</p></div>');
    }

    if (m.advisors && m.advisors.length) {
      html.push('<div class="detail-section"><h4>Advisors &amp; Time</h4>');
      html.push('<table class="advisor-table"><tr><th>Advisor</th><th>Time</th><th>Reward</th></tr>');
      m.advisors.forEach(a => {
        const rec = m.recommended === a;
        const t = (m.time && m.time[a]) ? m.time[a] : "—";
        const r = (m.rewardsBy && m.rewardsBy[a]) ? m.rewardsBy[a] : "—";
        html.push('<tr' + (rec ? ' class="rec-row"' : '') + '>' +
                  '<td>' + escapeHtml(ADVISOR_META[a].name) + (rec ? ' ★' : '') + '</td>' +
                  '<td>' + escapeHtml(t) + '</td>' +
                  '<td>' + escapeHtml(r) + '</td></tr>');
      });
      html.push('</table>');
      if (m.recommended) {
        const recMeta = ADVISOR_META[m.recommended] || { name: m.recommended };
        html.push('<p style="margin-top:6px"><span class="wt-pill recommended">★ Recommended: ' +
                  escapeHtml(recMeta.name) + '</span></p>');
      }
      html.push('</div>');
    }

    if (m.defaultRewards) {
      html.push('<div class="detail-section"><h4>Rewards</h4><p>' + escapeHtml(m.defaultRewards) + '</p></div>');
    }

    if (m.outcome) {
      html.push('<div class="detail-section"><h4>Outcome</h4><p>' + escapeHtml(m.outcome) + '</p></div>');
    }

    if (m.notes) {
      html.push('<div class="detail-section"><h4>Strategy / Notes</h4><p>' + escapeHtml(m.notes) + '</p></div>');
    }

    if (m.levelUnlocked) {
      html.push('<div class="detail-section"><h4>Level / Unlock</h4><p>' + escapeHtml(m.levelUnlocked) + '</p></div>');
    }

    if (m.tags && m.tags.length) {
      html.push('<div class="detail-section"><h4>Tags</h4><div class="tags">');
      m.tags.forEach(t => html.push('<span class="tag">' + escapeHtml(t) + '</span>'));
      html.push('</div></div>');
    }

    if (m.region && m.region !== "war-table") {
      html.push('<div class="detail-section">');
      html.push('  <button class="btn ghost full" id="jumpToAtlas" type="button">View ' + escapeHtml(regionName(m.region)) + ' on map</button>');
      html.push('</div>');
    }

    html.push('</div>');
    els.wtDetail.innerHTML = html.join("\n");

    const jump = document.getElementById("jumpToAtlas");
    if (jump) {
      jump.addEventListener("click", () => {
        state.currentRegion = m.region;
        state.view = "map";
        location.hash = "#/atlas";
      });
    }
  }

  // ============================================================
  // SHARED
  // ============================================================
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function debounce(fn, ms) {
    let t; return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  }

  // ---- Persistence ----
  // Bump STORAGE_VERSION on any breaking change to the saved shape; the key
  // suffix moves with it so old payloads are simply orphaned.
  const STORAGE_VERSION = 2;
  const STORAGE_KEY = "dai-atlas-v" + STORAGE_VERSION;
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: STORAGE_VERSION,
        search: state.search,
        activeRegions: [...state.activeRegions],
        activeCategories: [...state.activeCategories],
        activeRarities: [...state.activeRarities],
        view: state.view,
        currentRegion: state.currentRegion,
        wtSearch: state.wtSearch,
        wtActiveActs: [...state.wtActiveActs],
        wtActiveAdvisors: [...state.wtActiveAdvisors],
        wtActiveCategories: [...state.wtActiveCategories],
        wtActiveRegions: [...state.wtActiveRegions]
      }));
    } catch (e) { /* ignore */ }
  }
  function loadState() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (_) { return; }
    if (!raw) return;
    let s;
    try { s = JSON.parse(raw); } catch (_) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (__) { /* ignore */ }
      return;
    }
    if (s.v !== STORAGE_VERSION) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
      return;
    }
    state.search = s.search || "";
    state.activeRegions = new Set(s.activeRegions || []);
    state.activeCategories = new Set(s.activeCategories || []);
    state.activeRarities = new Set(s.activeRarities || []);
    state.view = s.view || "map";
    state.currentRegion = s.currentRegion || REGIONS[0].id;
    state.wtSearch = s.wtSearch || "";
    state.wtActiveActs = new Set(s.wtActiveActs || []);
    state.wtActiveAdvisors = new Set(s.wtActiveAdvisors || []);
    state.wtActiveCategories = new Set(s.wtActiveCategories || []);
    state.wtActiveRegions = new Set(s.wtActiveRegions || []);
  }

  // ---- Mobile drawers ----
  function closeDrawers() {
    els.body.classList.remove("sidebar-open", "detail-open");
    if (els.mobileBackdrop) els.mobileBackdrop.hidden = true;
    if (els.toggleSidebar) els.toggleSidebar.setAttribute("aria-expanded", "false");
    if (els.toggleDetail)  els.toggleDetail.setAttribute("aria-expanded", "false");
  }
  function toggleSidebarDrawer() {
    const open = !els.body.classList.contains("sidebar-open");
    els.body.classList.toggle("sidebar-open", open);
    els.body.classList.remove("detail-open");
    if (els.mobileBackdrop) els.mobileBackdrop.hidden = !open;
    els.toggleSidebar.setAttribute("aria-expanded", open ? "true" : "false");
    els.toggleDetail.setAttribute("aria-expanded", "false");
  }
  function toggleDetailDrawer() {
    const open = !els.body.classList.contains("detail-open");
    els.body.classList.toggle("detail-open", open);
    els.body.classList.remove("sidebar-open");
    if (els.mobileBackdrop) els.mobileBackdrop.hidden = !open;
    els.toggleDetail.setAttribute("aria-expanded", open ? "true" : "false");
    els.toggleSidebar.setAttribute("aria-expanded", "false");
  }

  // ---- Top-level render ----
  function render() {
    parseRoute();
    applyRoute();

    if (state.route === "atlas") {
      syncPillGroup("atlas-region");
      syncPillGroup("atlas-category");
      syncPillGroup("atlas-rarity");
      renderRegionSelect();
      applyAtlasView();
      renderMapSvg();
      renderPins();
      renderList();
      renderDetail();
    } else {
      syncWtFilters();
      renderWtList();
      renderWtDetail();
    }
    saveState();
  }

  // ---- Wire up ----
  function init() {
    loadState();
    renderLegend();

    // Pills built once; sync flips active class on subsequent renders.
    buildPillGroup("atlas-region",   els.regionList,   REGIONS,    state.activeRegions);
    buildPillGroup("atlas-category", els.categoryList, CATEGORIES, state.activeCategories, c => c.color);
    buildPillGroup("atlas-rarity",   els.rarityList,   RARITY,     state.activeRarities,   r => r.color);
    buildWtFilters();

    els.search.value = state.search;
    els.search.addEventListener("input", debounce(e => {
      state.search = e.target.value;
      state.selected = null;
      render();
    }, 120));

    els.clearFilters.addEventListener("click", () => {
      state.activeRegions.clear();
      state.activeCategories.clear();
      state.activeRarities.clear();
      state.search = "";
      state.selected = null;
      els.search.value = "";
      render();
    });

    els.toggleView.addEventListener("click", () => {
      state.view = state.view === "map" ? "list" : "map";
      render();
    });

    els.regionSelect.addEventListener("change", e => {
      state.currentRegion = e.target.value;
      state.selected = null;
      render();
    });

    els.wtSearch.value = state.wtSearch;
    els.wtSearch.addEventListener("input", debounce(e => {
      state.wtSearch = e.target.value;
      state.wtSelected = null;
      render();
    }, 120));

    els.wtClearFilters.addEventListener("click", () => {
      state.wtActiveActs.clear();
      state.wtActiveAdvisors.clear();
      state.wtActiveCategories.clear();
      state.wtActiveRegions.clear();
      state.wtSearch = "";
      state.wtSelected = null;
      els.wtSearch.value = "";
      render();
    });

    if (els.toggleSidebar)  els.toggleSidebar.addEventListener("click", toggleSidebarDrawer);
    if (els.toggleDetail)   els.toggleDetail.addEventListener("click", toggleDetailDrawer);
    if (els.mobileBackdrop) els.mobileBackdrop.addEventListener("click", closeDrawers);

    window.addEventListener("hashchange", () => render());

    document.addEventListener("keydown", e => {
      const target = state.route === "atlas" ? els.search : els.wtSearch;
      if (e.key === "/" && document.activeElement !== target) {
        e.preventDefault();
        target.focus();
        target.select();
      } else if (e.key === "Escape") {
        if (els.body.classList.contains("sidebar-open") || els.body.classList.contains("detail-open")) {
          closeDrawers();
          return;
        }
        if (state.route === "atlas") state.selected = null;
        else state.wtSelected = null;
        render();
      } else if (e.key === "1" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)) {
        location.hash = "#/atlas";
      } else if (e.key === "2" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)) {
        location.hash = "#/wartable";
      }
    });

    if (!location.hash) location.hash = "#/atlas";
    render();
  }

  // Scripts use `defer`, so DOM is ready when this runs.
  init();
})();
