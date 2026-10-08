let categories = [];
let saved = JSON.parse(localStorage.getItem("pr_saved") || "[]");
const grid = document.getElementById("categoryGrid");
const savedList = document.getElementById("savedList");

async function loadData() {
  try {
    const [catRes, settingsRes] = await Promise.all([
      fetch("/api/categories", { cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" })
    ]);
    if (!catRes.ok) throw new Error("Category API error");
    categories = await catRes.json();
    if (settingsRes.ok) applySettings(await settingsRes.json());
    render();
  } catch (e) {
    grid.innerHTML = '<p class="empty">Could not load categories. Please refresh.</p>';
  }
}

function applySettings(s) {
  const section = document.getElementById("download");
  if (!section) return;
  const eyebrow = section.querySelector(".eyebrow");
  const title = section.querySelector("h2");
  const text = section.querySelector("p:not(.eyebrow)");
  const button = section.querySelector("a.btn");
  if (eyebrow) eyebrow.textContent = s.downloadEyebrow || "MOBILE";
  if (title) title.innerHTML = s.downloadTitle || "Take it<br>with you.";
  if (text) text.textContent = s.downloadText || "";
  if (button) {
    button.textContent = s.downloadButton || "Download APK ↓";
    button.href = safeUrl(s.downloadUrl || "app-release.apk");
  }
}

function persistSaved() {
  localStorage.setItem("pr_saved", JSON.stringify(saved));
}

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[m]));
}

function safeUrl(u) {
  try {
    const x = new URL(u, location.href);
    return ["http:", "https:"].includes(x.protocol) ? x.href : "#";
  } catch {
    return "#";
  }
}

function render() {
  grid.innerHTML = categories.map(c => {
    const visual = c.logo
      ? `<img class="card-logo" src="${safeUrl(c.logo)}" alt="" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="card-icon">${esc(c.icon || "📘")}</div>`;

    return `
      <article class="card">
        <button class="save ${saved.includes(c.id) ? "active" : ""}" onclick="toggleSave('${esc(c.id)}')" title="Save">
          ${saved.includes(c.id) ? "★" : "☆"}
        </button>
        ${visual}
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.description || "")}</p>
        <a class="open-link" href="${safeUrl(c.url)}" target="_blank" rel="noopener">OPEN LINK →</a>
      </article>`;
  }).join("");

  const items = categories.filter(c => saved.includes(c.id));
  saved = saved.filter(id => categories.some(c => c.id === id));
  persistSaved();

  savedList.innerHTML = items.length
    ? items.map(c => `<a class="saved-chip" href="${safeUrl(c.url)}" target="_blank" rel="noopener">${c.logo ? "◉" : esc(c.icon || "📘")} ${esc(c.name)}</a>`).join("")
    : `<p class="empty">No saved categories yet. Tap ☆ on a course to save it.</p>`;
}

window.toggleSave = id => {
  saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
  persistSaved();
  render();
};

document.getElementById("menuBtn").onclick = () =>
  document.getElementById("navLinks").classList.toggle("open");

document.querySelectorAll("#navLinks a").forEach(a =>
  a.onclick = () => document.getElementById("navLinks").classList.remove("open")
);

loadData();
