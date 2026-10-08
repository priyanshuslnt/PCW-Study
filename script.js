const defaults=[
  {id:"web",name:"Web Development",description:"HTML, CSS, JavaScript and modern web resources.",url:"https://developer.mozilla.org/",icon:"💻"},
  {id:"coding",name:"Coding",description:"Programming practice, docs and useful tools.",url:"https://github.com/",icon:"⌨️"},
  {id:"courses",name:"Online Courses",description:"Your favorite learning platforms and courses.",url:"https://www.coursera.org/",icon:"🎓"},
  {id:"notes",name:"Notes & PDFs",description:"Keep your important study material in one place.",url:"https://drive.google.com/",icon:"📚"},
  {id:"tools",name:"Study Tools",description:"Useful calculators, editors and productivity tools.",url:"https://www.google.com/",icon:"⚡"},
  {id:"youtube",name:"Learning Videos",description:"Open your preferred educational video channel.",url:"https://www.youtube.com/",icon:"▶️"}
];
let categories=JSON.parse(localStorage.getItem("pr_categories")||"null")||defaults;
let saved=JSON.parse(localStorage.getItem("pr_saved")||"[]");

const grid=document.getElementById("categoryGrid"), savedList=document.getElementById("savedList");

function persist(){localStorage.setItem("pr_categories",JSON.stringify(categories));localStorage.setItem("pr_saved",JSON.stringify(saved))}
function render(){
 grid.innerHTML=categories.map(c=>`
 <article class="card">
   <button class="save ${saved.includes(c.id)?"active":""}" onclick="toggleSave('${c.id}')" title="Save">${saved.includes(c.id)?"★":"☆"}</button>

   <div class="card-icon">${c.icon||"📘"}</div>
   <h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.description||"")}</p>
   <a class="open-link" href="${safeUrl(c.url)}" target="_blank" rel="noopener">OPEN LINK →</a>
 </article>`).join("");
 const items=categories.filter(c=>saved.includes(c.id));
 savedList.innerHTML=items.length?items.map(c=>`<a class="saved-chip" href="${safeUrl(c.url)}" target="_blank" rel="noopener">${c.icon||"📘"} ${escapeHtml(c.name)}</a>`).join(""):`<p class="empty">No saved categories yet. Tap ☆ on a course to save it.</p>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function safeUrl(u){try{const x=new URL(u);return ["http:","https:"].includes(x.protocol)?x.href:"#"}catch{return "#"}}
window.toggleSave=id=>{saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];persist();render()}

document.getElementById("menuBtn").onclick=()=>document.getElementById("navLinks").classList.toggle("open");
document.querySelectorAll("#navLinks a").forEach(a=>a.onclick=()=>document.getElementById("navLinks").classList.remove("open"));
render();
