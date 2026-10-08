// ================= PCW STUDY =================
// Add your own authorized course/batch URLs below.
// Example:
// { category: "Physics Wallah", name: "My Batch", type: "JEE", url: "https://example.com" }

const categories = [
"AASH Officer","All Competition","Allen","Apna College","PW BOOK","Career Will","CDS Journey",
"Disha Online","Education Baba","Eduteria","English Speaking","Futurekul","GS Version",
"Gyan Bindu GS Academy","IIT School","Just Padhle","KD Live","Khan Global Studies","Master Sahab",
"MD Classes","MissionJEET","Motion","Munil Sir","Next Toppers","Padhle Akshay","Parmar SSC",
"Physics Wallah","PW OTT - Pi Pro","RG Vikram Jeet","Rojgar With Ankit","Sachin Academy",
"Sarvam Kota","Science And Fun","Selection Way","Study IQ","Taiyari Karlo","Target Board",
"Test Book","Test Ranker","Topper's Wisdom","UnAcademy","Utkarsh Classes","Vibrant Academy",
"Vidhyagram","Vidhyakul","Yes Officer"
];

// ================= APNE COURSES YAHAN ADD KARO =================
const resources = [
  // { category: "Physics Wallah", name: "Arjuna JEE 2026", type: "JEE", tag: "Popular", url: "https://example.com" },
  // { category: "Disha Online", name: "Class 12 Physics", type: "Board", tag: "New", url: "https://example.com" },
];
// =============================================================

const logoDomains = {
  "Allen":"allen.in","Apna College":"apnacollege.in","Career Will":"careerwill.com",
  "Disha Online":"dishaonlineclasses.com","Khan Global Studies":"kgs.live",
  "Physics Wallah":"pw.live","PW OTT - Pi Pro":"pw.live","UnAcademy":"unacademy.com",
  "Test Book":"testbook.com","Study IQ":"studyiq.com","Utkarsh Classes":"utkarsh.com",
  "Vidhyakul":"vidhyakul.com","Vidhyagram":"vidhyagram.com"
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function logoFor(name){
  const domain = logoDomains[name];
  if(domain) return `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=128" alt="">`;
  return name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
}

function platformCard(category){
  const count = resources.filter(r => r.category === category).length;
  return `<article class="platform-card" data-category="${escapeHtml(category)}">
    <div class="logo">${logoFor(category)}</div>
    <h3>${escapeHtml(category)}</h3>
    <small>Courses · Batches · Resources</small>
    <span class="count">${count} resources · Open →</span>
  </article>`;
}
function renderPlatforms(){
  $("#platformGrid").innerHTML = categories.slice(0,8).map(platformCard).join("");
  $("#allPlatformGrid").innerHTML = categories.map(platformCard).join("");
}
function resourceCard(r){
  const saved = getSaved().includes(r.name);
  return `<article class="resource-card">
    <button class="save" data-save="${encodeURIComponent(r.name)}">${saved ? "♥":"♡"}</button>
    <div class="eyebrow">${escapeHtml(r.category)}</div>
    <h3>${escapeHtml(r.name)}</h3>
    <p>${escapeHtml(r.type || "Course")} ${r.tag ? "· "+escapeHtml(r.tag):""}</p>
    <a class="open" href="${safeUrl(r.url)}" target="_blank" rel="noopener">OPEN ↗</a>
  </article>`;
}
function renderResources(){
  const all = resources;
  $("#jeeGrid").innerHTML = all.filter(r => /jee/i.test((r.type||"")+" "+(r.name||""))).map(resourceCard).join("") || empty("No JEE courses added yet.");
  $("#neetGrid").innerHTML = all.filter(r => /neet/i.test((r.type||"")+" "+(r.name||""))).map(resourceCard).join("") || empty("No NEET courses added yet.");
  $("#boardGrid").innerHTML = all.filter(r => /board|class/i.test((r.type||"")+" "+(r.name||""))).map(resourceCard).join("") || empty("No board courses added yet.");
  const savedNames = getSaved();
  $("#savedGrid").innerHTML = all.filter(r => savedNames.includes(r.name)).map(resourceCard).join("") || empty("Save a course with ♡ and it will appear here.");
}
function empty(t){ return `<div class="resource-card"><p>${t}</p></div>`; }

function getSaved(){ try{return JSON.parse(localStorage.getItem("pcw_saved")||"[]")}catch{return[]}}
function toggleSave(name){
  let a=getSaved(); a=a.includes(name)?a.filter(x=>x!==name):[...a,name];
  localStorage.setItem("pcw_saved",JSON.stringify(a)); renderResources();
}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function safeUrl(v=""){try{const u=new URL(v);return /^https?:$/.test(u.protocol)?u.href:"#"}catch{return"#"}}

function showSection(id){
  $$(".section").forEach(x=>x.classList.toggle("active",x.id===id));
  $$(".side-btn,.bottom-nav button,.top-nav button").forEach(x=>x.classList.toggle("active",x.dataset.section===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
document.addEventListener("click",e=>{
  const sec=e.target.closest("[data-section]");
  if(sec){ showSection(sec.dataset.section); return; }
  const card=e.target.closest(".platform-card");
  if(card){
    const name=card.dataset.category;
    const q=encodeURIComponent(name.toLowerCase());
    $("#search").value=name;
    filterAll(name);
    showSection("platforms");
  }
  const save=e.target.closest("[data-save]");
  if(save){toggleSave(decodeURIComponent(save.dataset.save));}
});
function filterAll(term){
  const t=term.toLowerCase();
  $$(".platform-card").forEach(c=>c.style.display=c.innerText.toLowerCase().includes(t)?"block":"none");
}
$("#search").addEventListener("input",e=>{
  const t=e.target.value.toLowerCase().trim();
  $$(".platform-card").forEach(c=>c.style.display=!t||c.innerText.toLowerCase().includes(t)?"block":"none");
});
$("#themeBtn").addEventListener("click",()=>{
  document.body.classList.toggle("gold-mode");
});

const motivations=[
"Slow progress is still progress.","Your future self will thank you.",
"Consistency beats motivation.","One chapter at a time.",
"Study now. Celebrate later.","Don't stop when it gets hard."
];
$("#motivationText").textContent=motivations[new Date().getDate()%motivations.length];

for(let i=0;i<38;i++){
  const p=document.createElement("i"); p.className="particle";
  p.style.left=Math.random()*100+"%"; p.style.animationDelay=(-Math.random()*7)+"s";
  p.style.animationDuration=(4+Math.random()*8)+"s"; $("#particles").appendChild(p);
}
renderPlatforms(); renderResources();
