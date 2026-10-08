(() => {
  "use strict";

  let categories = [];
  let saved = [];
  try {
    const raw = localStorage.getItem("pr_saved");
    const parsed = raw ? JSON.parse(raw) : [];
    saved = Array.isArray(parsed) ? parsed.map(String) : [];
  } catch { saved = []; }

  const $ = (id) => document.getElementById(id);
  const grid = $("categoryGrid");
  const savedList = $("savedList");
  const count = $("categoryCount");

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
    } catch { return "#"; }
  }

  function safeImageUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  }

  function persistSaved() {
    try { localStorage.setItem("pr_saved", JSON.stringify(saved)); } catch {}
  }

  function logoMarkup(category) {
    const logo = safeImageUrl(category.logo);
    const icon = escapeHtml(category.icon || "📚");
    if (!logo) return `<div class="card-logo fallback" aria-hidden="true">${icon}</div>`;
    return `<div class="card-logo"><img src="${escapeHtml(logo)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="logo-fallback" hidden>${icon}</span></div>`;
  }

  function render() {
    if (!grid || !savedList) return;
    categories = Array.isArray(categories) ? categories : [];
    const validIds = new Set(categories.map(c => String(c.id)));
    saved = saved.filter(id => validIds.has(String(id)));
    persistSaved();

    if (count) count.textContent = `${categories.length} ${categories.length === 1 ? "resource" : "resources"}`;

    if (!categories.length) {
      grid.innerHTML = `<div class="state-card"><div class="empty-icon">✦</div><p>No categories yet.</p><small>The site is ready — add resources from Admin.</small></div>`;
    } else {
      grid.innerHTML = categories.map((c) => {
        const id = String(c.id || "");
        const isSaved = saved.includes(id);
        return `<article class="card">
          <button class="save ${isSaved ? "active" : ""}" data-save="${escapeHtml(id)}" type="button" aria-label="${isSaved ? "Remove from saved" : "Save category"}">${isSaved ? "★" : "☆"}</button>
          ${logoMarkup(c)}
          <div class="card-body"><h3>${escapeHtml(c.name || "Untitled")}</h3><p>${escapeHtml(c.description || "Study resource")}</p></div>
          <a class="open-link" href="${escapeHtml(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">OPEN →</a>
        </article>`;
      }).join("");
    }

    const savedItems = categories.filter(c => saved.includes(String(c.id)));
    savedList.innerHTML = savedItems.length
      ? savedItems.map(c => `<a class="saved-chip" href="${escapeHtml(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.icon || "📚")} ${escapeHtml(c.name || "Untitled")}</a>`).join("")
      : `<p class="empty">No saved categories yet. Tap ☆ on a course to save it.</p>`;
  }

  function toggleSave(id) {
    const key = String(id);
    saved = saved.includes(key) ? saved.filter(item => item !== key) : [...saved, key];
    persistSaved();
    render();
  }

  async function loadCategories() {
    try {
      const response = await fetch("/api/categories", { cache: "no-store" });
      if (!response.ok) throw new Error("Category API unavailable");
      const data = await response.json();
      categories = Array.isArray(data) ? data : [];
    } catch {
      categories = [];
    }
    render();
  }

  async function loadSettings() {
    try {
      const response = await fetch("/api/settings", { cache: "no-store" });
      if (!response.ok) throw new Error("Settings unavailable");
      const settings = await response.json();
      if ($("downloadEyebrow")) $("downloadEyebrow").textContent = settings.downloadEyebrow || "MOBILE";
      if ($("downloadTitle")) $("downloadTitle").textContent = settings.downloadTitle || "Take it with you.";
      if ($("downloadText")) $("downloadText").textContent = settings.downloadText || "Put your Android APK link here and use the button below.";
      const button = $("downloadButton");
      if (button) {
        button.textContent = settings.downloadButton || "Download APK ↓";
        const url = safeUrl(settings.downloadUrl);
        button.href = url;
        button.hidden = url === "#";
      }
    } catch {
      // Defaults in HTML remain visible if the API/KV is empty or unavailable.
    }
  }

  function initNav() {
    const menu = $("menuBtn");
    const nav = $("navLinks");
    if (!menu || !nav) return;
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    }));
  }

  if (grid) grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-save]");
    if (button) toggleSave(button.dataset.save);
  });

  initNav();
  render();
  loadCategories();
  loadSettings();
})();
