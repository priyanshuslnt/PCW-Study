const categories = ["AASH Officer", "All Competition", "Allen", "Apna College", "PW BOOK", "Career Will", "CDS Journey", "Disha Online", "Education Baba", "Eduteria", "English Speaking", "Futurekul", "GS Version", "Gyan Bindu GS Academy", "IIT School", "Just Padhle", "KD Live", "Khan Global Studies", "Master Sahab", "MD Classes", "MissionJEET", "Motion", "Munil Sir", "Next Toppers", "Padhle Akshay", "Parmar SSC", "Physics Wallah", "PW OTT - Pi Pro", "RG Vikram Jeet", "Rojgar With Ankit", "Sachin Academy", "Sarvam Kota", "Science And Fun", "Selection Way", "Study IQ", "Taiyari Karlo", "Target Board", "Test Book", "Test Ranker", "Topper's Wisdom", "UnAcademy", "Utkarsh Classes", "Vibrant Academy", "Vidhyagram", "Vidhyakul", "Yes Officer"];
const logoDomains = {"Allen": "allen.in", "Apna College": "apnacollege.in", "Career Will": "careerwill.com", "Disha Online": "dishaonlineclasses.com", "Khan Global Studies": "kgs.live", "Physics Wallah": "pw.live", "PW OTT - Pi Pro": "pw.live", "UnAcademy": "unacademy.com", "Test Book": "testbook.com", "Study IQ": "studyiq.com", "Utkarsh Classes": "utkarsh.com", "Vidhyakul": "vidhyakul.com", "Vidhyagram": "vidhyagram.com"};
const quotes = [
"Mehnat itni khamoshi se karo ki safalta shor macha de.",
"Aaj ka 2 ghanta, kal ki tension ko kam karta hai.",
"Slow progress is still progress.",
"Discipline > Motivation. Roz thoda karo.",
"Tumhara future, aaj ke decision se banta hai.",
"Don't stop when you're tired. Stop when you're done."
];

// APNE COURSE/BATCH YAHAN ADD KARO
// Example:
// {category:"Physics Wallah",name:"Arjuna JEE 2026",type:"JEE",tag:"Popular",url:"https://example.com"}
const resources = [];

function fallbackLogo(n){return n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function logoHTML(c){
 const d=logoDomains[c];
 if(d) return `<div class="logo"><img loading="lazy" src="https://www.google.com/s2/favicons?domain=${d}&sz=128" alt="${c} logo" onerror="this.style.display='none';this.parentElement.textContent='${fallbackLogo(c)}'"></div>`;
 return `<div class="logo">${fallbackLogo(c)}</div>`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function platformCard(c){
 const count=resources.filter(r=>r.category===c).length;
 return `<article class="platform-card" onclick="showCategory('${esc(c)}')">${logoHTML(c)}<h3>${esc(c)}</h3><div class="meta">Courses · Batches · Resources</div><div class="count">${count} resources · Open →</div></article>`;
}
function resourceCard(r){
 return `<article class="resource-card">${logoHTML(r.category)}<h3>${esc(r.name)}</h3><p>${esc(r.category)}${r.type?" · "+esc(r.type):""}${r.tag?" · "+esc(r.tag):""}</p><button onclick="window.open(decodeURIComponent('${encodeURIComponent(r.url||"#")}'),'_blank')">Open →</button></article>`;
}
function renderHome(){
 document.getElementById("platformGrid").innerHTML=categories.slice(0,8).map(platformCard).join("");
 document.getElementById("resourceGrid").innerHTML=resources.length?resources.slice(0,8).map(resourceCard).join(""):`<div class="resource-card" style="grid-column:1/-1"><h3>⭐ Your batches will appear here</h3><p>Add a course in script.js and commit the change.</p></div>`;
 document.getElementById("dailyQuote").textContent=quotes[new Date().getDate()%quotes.length];
}
function showHome(){renderHome();scrollTo(0,0)}
function showCategories(){document.getElementById("platformGrid").innerHTML=categories.map(platformCard).join("");document.getElementById("resourceGrid").innerHTML=resources.map(resourceCard).join("");scrollTo(0,0)}
function showCategory(c){const rs=resources.filter(r=>r.category===c);document.getElementById("platformGrid").innerHTML=platformCard(c);document.getElementById("resourceGrid").innerHTML=rs.length?rs.map(resourceCard).join(""):`<div class="resource-card" style="grid-column:1/-1"><h3>${esc(c)}</h3><p>No batches added yet.</p></div>`;scrollTo(0,0)}
function renderSearch(q){q=q.trim().toLowerCase();if(!q)return showHome();const cs=categories.filter(c=>c.toLowerCase().includes(q));const rs=resources.filter(r=>(r.name+" "+r.category+" "+(r.type||"")).toLowerCase().includes(q));document.getElementById("platformGrid").innerHTML=cs.map(platformCard).join("")||`<div class="resource-card"><h3>No platform found</h3></div>`;document.getElementById("resourceGrid").innerHTML=rs.map(resourceCard).join("")||`<div class="resource-card"><h3>No course found</h3></div>`}
function filterType(t){const rs=resources.filter(r=>(r.type||"").toLowerCase()===t.toLowerCase());document.getElementById("platformGrid").innerHTML=categories.map(platformCard).join("");document.getElementById("resourceGrid").innerHTML=rs.length?rs.map(resourceCard).join(""):`<div class="resource-card"><h3>${t} resources</h3><p>Add resources with type "${t}" in script.js.</p></div>`}
function showMotivation(){document.getElementById("platformGrid").innerHTML=quotes.map((q,i)=>`<article class="platform-card"><h3>✦ Motivation #${i+1}</h3><p style="color:#d9e2f7;line-height:1.6">${q}</p></article>`).join("");document.getElementById("resourceGrid").innerHTML=""}
function showResources(){document.getElementById("platformGrid").innerHTML=`<article class="feature-card resource-bg" style="min-height:140px"><b>📚 Study Resources</b><span>Notes · PDFs · Question Papers · Roadmaps</span></article>`;document.getElementById("resourceGrid").innerHTML=resources.map(resourceCard).join("")||`<div class="resource-card"><h3>📁 Resources ready</h3><p>Add authorized resource URLs in script.js.</p></div>`}
function showNotes(){showResources()}
function showLinks(){document.getElementById("platformGrid").innerHTML=`<article class="platform-card" style="grid-column:1/-1"><h3>🔗 Important Links</h3><p class="meta">Add official links inside Quick Links in index.html.</p></article>`;document.getElementById("resourceGrid").innerHTML=""}
function showSaved(){document.getElementById("platformGrid").innerHTML=`<article class="platform-card"><h3>♡ Saved</h3><p class="meta">Saved-course support is ready.</p></article>`;document.getElementById("resourceGrid").innerHTML=""}
function showAbout(){document.getElementById("platformGrid").innerHTML=`<article class="platform-card" style="grid-column:1/-1"><h3>PCW Study</h3><p style="color:#bdc9e3;line-height:1.7">Priyanshu Course World — study platforms, courses, resources and motivation in one place.</p></article>`;document.getElementById("resourceGrid").innerHTML=""}
function toggleTheme(){document.body.classList.toggle("light-mode")}
let timerSeconds=7200,timerInterval=null;
function updateTimer(){let h=String(Math.floor(timerSeconds/3600)).padStart(2,"0"),m=String(Math.floor(timerSeconds%3600/60)).padStart(2,"0"),s=String(timerSeconds%60).padStart(2,"0");document.getElementById("timer").textContent=`${h}:${m}:${s}`}
function startTimer(){if(timerInterval)return;timerInterval=setInterval(()=>{if(timerSeconds>0){timerSeconds--;updateTimer()}else pauseTimer()},1000)}
function pauseTimer(){clearInterval(timerInterval);timerInterval=null}
function resetTimer(){pauseTimer();timerSeconds=7200;updateTimer()}
renderHome();updateTimer();
