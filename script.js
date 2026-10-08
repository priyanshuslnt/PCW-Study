// ============================================================
// PCW STUDY: APNE BATCH / COURSE YAHAN ADD KARO
// ============================================================
// Har naya batch ke liye is format ko copy karo:
//
// {
//   category: "Physics Wallah",
//   name: "Batch Name",
//   url: "https://your-link.com"
// },
//
// category = upar wali 46 categories me se exact naam
// name     = card par dikhne wala batch/course naam
// url      = OPEN button dabane par khulne wala URL
// ============================================================

const resources = [
  // 👇 YAHAN SE APNE BATCH ADD KARO 👇
  // { category: "Physics Wallah", name: "Example Batch", url: "https://example.com" },
];

const categories = ["AASH Officer", "All Competition", "Allen", "Apna College", "PW BOOK", "Career Will", "CDS Journey", "Disha Online", "Education Baba", "Eduteria", "English Speaking", "Futurekul", "GS Version", "Gyan Bindu GS Academy", "IIT School", "Just Padhle", "KD Live", "Khan Global Studies", "Master Sahab", "MD Classes", "MissionJEET", "Motion", "Munil Sir", "Next Toppers", "Padhle Akshay", "Parmar SSC", "Physics Wallah", "PW OTT - Pi Pro", "RG Vikram Jeet", "Rojgar With Ankit", "Sachin Academy", "Sarvam Kota", "Science And Fun", "Selection Way", "Study IQ", "Taiyari Karlo", "Target Board", "Test Book", "Test Ranker", "Topper's Wisdom", "UnAcademy", "Utkarsh Classes", "Vibrant Academy", "Vidhyagram", "Vidhyakul", "Yes Officer"];

const $=id=>document.getElementById(id);
function initials(s){return s.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}
function renderCats(q=""){
  const f=q.toLowerCase(), list=categories.filter(c=>c.toLowerCase().includes(f));
  $("count").textContent=list.length+" categories";
  $("categories").innerHTML=list.map(c=>{
    const n=resources.filter(r=>r.category===c).length;
    return `<article class="card" onclick='openCat(${JSON.stringify(c)})'><div class="icon">${initials(c)}</div><h3>${c}</h3><p>${n} resource${n===1?"":"s"} • Open →</p></article>`;
  }).join("")||"<p style='padding:16px;color:#8f9abb'>No category found.</p>";
}
function openCat(c){
  $("catSection").classList.add("hidden");$("resSection").classList.remove("hidden");
  $("title").textContent=c;
  const list=resources.filter(r=>r.category===c);$("rcount").textContent=list.length+" resources";
  $("resources").innerHTML=list.length?list.map(r=>`<article class="resource"><div><h3>${esc(r.name)}</h3><p>${esc(r.description||"Free study resource")}</p></div><button class="open" onclick='event.stopPropagation();openUrl(${JSON.stringify(r.url)})'>Open ↗</button></article>`).join(""):`<article class="resource"><div><h3>No batches added yet</h3><p>Edit script.js at the marked section.</p></div></article>`;
  scrollTo(0,0);
}
function openUrl(u){if(!u)return alert("URL add nahi kiya gaya hai.");window.open(u,"_blank","noopener,noreferrer")}
function showCats(){$("resSection").classList.add("hidden");$("catSection").classList.remove("hidden");renderCats($("search").value)}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("search").addEventListener("input",()=>renderCats($("search").value));
$("back").onclick=showCats;$("theme").onclick=()=>document.body.classList.toggle("light");renderCats();
