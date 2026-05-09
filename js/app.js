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
    route: "atlas",                   // "atlas" | "wartable"
    // atlas
    search: "",
    activeRegions: new Set(),
    activeCategories: new Set(),
    activeRarities: new Set(),
    selected: null,
    view: "map",                      // "map" | "list"
    currentRegion: REGIONS[0].id,
    // war table
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
    // routes
    routeAtlas:    $("#route-atlas"),
    routeWartable: $("#route-wartable"),
    navlinks:      document.querySelectorAll(".navlink"),
    counts:        $("#counts"),
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

  // ---- Routing ----
  function applyRoute() {
    const r = state.route;
    els.routeAtlas.classList.toggle("hidden", r !== "atlas");
    els.routeWartable.classList.toggle("hidden", r !== "wartable");
    els.navlinks.forEach(a => {
      a.classList.toggle("active", a.getAttribute("data-route") === r);
    });
    if (r === "atlas") {
      const total = RESOURCES.length;
      const visible = filterResources().length;
      els.counts.textContent = visible + " / " + total + " resources";
    } else {
      const total = WT.length;
      const visible = filterMissions().length;
      els.counts.textContent = visible + " / " + total + " missions";
    }
  }

  function parseRoute() {
    const hash = (location.hash || "").replace(/^#\/?/, "");
    if (hash === "wartable") state.route = "wartable";
    else state.route = "atlas";
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

  function renderPillList(container, items, activeSet, getColor) {
    container.innerHTML = "";
    items.forEach(item => {
      const pill = document.createElement("button");
      pill.className = "pill" + (activeSet.has(item.id) ? " active" : "");
      pill.textContent = item.name;
      if (getColor) {
        const c = getColor(item);
        if (!activeSet.has(item.id)) pill.style.borderLeft = "3px solid " + c;
      }
      pill.addEventListener("click", () => {
        if (activeSet.has(item.id)) activeSet.delete(item.id);
        else activeSet.add(item.id);
        render();
      });
      container.appendChild(pill);
    });
  }

  function renderLegend() {
    els.legendList.innerHTML = "";
    CATEGORIES.forEach(c => {
      const li = document.createElement("li");
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = c.color;
      const label = document.createElement("span");
      label.textContent = c.name;
      li.appendChild(dot);
      li.appendChild(label);
      els.legendList.appendChild(li);
    });
  }

  function renderRegionSelect() {
    els.regionSelect.innerHTML = "";
    REGIONS.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.name + " — " + r.act;
      els.regionSelect.appendChild(opt);
    });
    els.regionSelect.value = state.currentRegion;
    const region = REGIONS.find(r => r.id === state.currentRegion);
    els.regionMeta.textContent = region ? region.notes : "";
  }

  function renderMapSvg() {
    els.mapSvgHost.innerHTML = MAPS.render(state.currentRegion);
  }

  function renderPins() {
    els.pinLayer.innerHTML = "";
    const filtered = filterResources();
    const inRegion = filtered.filter(r => r.region === state.currentRegion);

    inRegion.forEach(r => {
      if (typeof r.x !== "number" || typeof r.y !== "number") return;
      const pin = document.createElement("div");
      pin.className = "pin" + (state.selected && state.selected.id === r.id ? " selected" : "");
      pin.style.background = catColor(r.category);
      pin.style.left = (r.x * 100) + "%";
      pin.style.top  = (r.y * 100) + "%";
      pin.title = r.name + " — " + catName(r.category);
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
        const row = document.createElement("div");
        row.className = "resource-row" + (state.selected && state.selected.id === r.id ? " selected" : "");

        const dot = document.createElement("span");
        dot.className = "dot";
        dot.style.background = catColor(r.category);
        row.appendChild(dot);

        const name = document.createElement("span");
        name.className = "resource-name";
        name.textContent = r.name;
        row.appendChild(name);

        const meta = document.createElement("span");
        meta.className = "resource-meta";
        meta.textContent = catName(r.category) + (r.tier ? " · T" + r.tier : "");
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
    html.push('    <button class="btn ghost full" id="jumpToRegion">Jump map to ' + escapeHtml(region.name || r.region) + '</button>');
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
        // mission must have at least one of the active advisors
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

  function renderWtFilters() {
    // Acts
    renderPillList(els.wtActList,
      ACTS.map(a => ({ id: a, name: a })),
      state.wtActiveActs);

    // Advisors
    renderPillList(els.wtAdvisorList,
      Object.keys(ADVISOR_META).map(a => ({ id: a, name: ADVISOR_META[a].name })),
      state.wtActiveAdvisors,
      item => ADVISOR_META[item.id].color);

    // Categories
    renderPillList(els.wtCategoryList, WT_CATEGORIES, state.wtActiveCategories);

    // Regions referenced by missions
    const regionSet = new Set(WT.map(m => m.region).filter(r => r && r !== "war-table"));
    const regionItems = REGIONS.filter(r => regionSet.has(r.id));
    renderPillList(els.wtRegionList, regionItems, state.wtActiveRegions);
  }

  function advisorPill(advisor, selected, recommended) {
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
      return;
    }
    list.forEach(m => {
      const card = document.createElement("div");
      card.className = "wt-card" + (state.wtSelected && state.wtSelected.id === m.id ? " selected" : "");

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
        (m.advisors || []).map(a => advisorPill(a, false, m.recommended === a)).join("");
      card.appendChild(row);

      if (m.outcome) {
        const body = document.createElement("div");
        body.className = "wt-card-body";
        body.textContent = m.outcome;
        card.appendChild(body);
      }

      card.addEventListener("click", () => {
        state.wtSelected = m;
        render();
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
        html.push('<p style="margin-top:6px"><span class="wt-pill recommended">★ Recommended: ' +
                  escapeHtml(ADVISOR_META[m.recommended].name) + '</span></p>');
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

    if (m.tags && m.tags.length) {
      html.push('<div class="detail-section"><h4>Tags</h4><div class="tags">');
      m.tags.forEach(t => html.push('<span class="tag">' + escapeHtml(t) + '</span>'));
      html.push('</div></div>');
    }

    if (m.region && m.region !== "war-table") {
      html.push('<div class="detail-section">');
      html.push('  <button class="btn ghost full" id="jumpToAtlas">View ' + escapeHtml(regionName(m.region)) + ' on map</button>');
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
  const STORAGE_KEY = "dai-atlas-v2";
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        route: state.route,
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
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
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
    } catch (e) { /* ignore */ }
  }

  // ---- Top-level render ----
  function render() {
    parseRoute();
    applyRoute();

    if (state.route === "atlas") {
      renderPillList(els.regionList,    REGIONS,    state.activeRegions);
      renderPillList(els.categoryList,  CATEGORIES, state.activeCategories, c => c.color);
      renderPillList(els.rarityList,    RARITY,     state.activeRarities,   r => r.color);
      renderRegionSelect();
      applyAtlasView();
      renderMapSvg();
      renderPins();
      renderList();
      renderDetail();
    } else {
      renderWtFilters();
      renderWtList();
      renderWtDetail();
    }
    saveState();
  }

  // ---- Wire up ----
  function init() {
    loadState();
    parseRoute();
    renderLegend();

    // Atlas
    els.search.value = state.search;
    els.search.addEventListener("input", debounce(e => {
      state.search = e.target.value;
      render();
    }, 120));

    els.clearFilters.addEventListener("click", () => {
      state.activeRegions.clear();
      state.activeCategories.clear();
      state.activeRarities.clear();
      state.search = "";
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

    // War table
    els.wtSearch.value = state.wtSearch;
    els.wtSearch.addEventListener("input", debounce(e => {
      state.wtSearch = e.target.value;
      render();
    }, 120));

    els.wtClearFilters.addEventListener("click", () => {
      state.wtActiveActs.clear();
      state.wtActiveAdvisors.clear();
      state.wtActiveCategories.clear();
      state.wtActiveRegions.clear();
      state.wtSearch = "";
      els.wtSearch.value = "";
      render();
    });

    // Routing — listen to hash changes
    window.addEventListener("hashchange", () => render());
    els.navlinks.forEach(a => {
      a.addEventListener("click", e => {
        // let default hash navigation happen, then re-render via hashchange
      });
    });

    // Keyboard
    document.addEventListener("keydown", e => {
      const target = state.route === "atlas" ? els.search : els.wtSearch;
      if (e.key === "/" && document.activeElement !== target) {
        e.preventDefault();
        target.focus();
        target.select();
      } else if (e.key === "Escape") {
        if (state.route === "atlas") state.selected = null;
        else state.wtSelected = null;
        render();
      } else if (e.key === "1" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)) {
        location.hash = "#/atlas";
      } else if (e.key === "2" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)) {
        location.hash = "#/wartable";
      }
    });

    // Set default hash if missing
    if (!location.hash) location.hash = "#/atlas";
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
