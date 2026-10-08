let categories=[];
let saved=JSON.parse(localStorage.getItem("pr_saved")||"[]");
const grid=document.getElementById("categoryGrid"), savedList=document.getElementById("savedList");

async function loadCategories(){
  try{
    const res=await fetch("/api/categories",{cache:"no-store"});
    if(!res.ok) throw new Error("API error");
    categories=await res.json();
    render();
  }catch(e){
    grid.innerHTML='<p class="empty">Could not load categories. Please refresh.</p>';
  }
}
function persistSaved(){localStorage.setItem("pr_saved",JSON.stringify(saved))}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function safeUrl(u){try{const x=new URL(u);return ["http:","https:"].includes(x.protocol)?x.href:"#"}catch{return "#"}}
function render(){
 grid.innerHTML=categories.map(c=>`
 <article class="card">
   <button class="save ${saved.includes(c.id)?"active":""}" onclick="toggleSave('${c.id}')" title="Save">${saved.includes(c.id)?"★":"☆"}</button>
   <div class="card-icon">${esc(c.icon||"📘")}</div>
   <h3>${esc(c.name)}</h3><p>${esc(c.description||"")}</p>
   <a class="open-link" href="${safeUrl(c.url)}" target="_blank" rel="noopener">OPEN LINK →</a>
 </article>`).join("");
 const items=categories.filter(c=>saved.includes(c.id));
 saved=saved.filter(id=>categories.some(c=>c.id===id));
 persistSaved();
 savedList.innerHTML=items.length?items.map(c=>`<a class="saved-chip" href="${safeUrl(c.url)}" target="_blank" rel="noopener">${esc(c.icon||"📘")} ${esc(c.name)}</a>`).join(""):`<p class="empty">No saved categories yet. Tap ☆ on a course to save it.</p>`;
}
window.toggleSave=id=>{saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];persistSaved();render()};
document.getElementById("menuBtn").onclick=()=>document.getElementById("navLinks").classList.toggle("open");
document.querySelectorAll("#navLinks a").forEach(a=>a.onclick=()=>document.getElementById("navLinks").classList.remove("open"));
loadCategories();
