const categories=[
"AASH Officer","All Competition","Allen","Apna College","PW BOOK","Career Will","CDS Journey",
"Disha Online","Education Baba","Eduteria","English Speaking","Futurekul","GS Version",
"Gyan Bindu GS Academy","IIT School","Just Padhle","KD Live","Khan Global Studies","Master Sahab",
"MD Classes","MissionJEET","Motion","Munil Sir","Next Toppers","Padhle Akshay","Parmar SSC",
"Physics Wallah","PW OTT - Pi Pro","RG Vikram Jeet","Rojgar With Ankit","Sachin Academy",
"Sarvam Kota","Science And Fun","Selection Way","Study IQ","Taiyari Karlo","Target Board",
"Test Book","Test Ranker","Topper's Wisdom","UnAcademy","Utkarsh Classes","Vibrant Academy",
"Vidhyagram","Vidhyakul","Yes Officer"
];

// APNE COURSES / BATCHES YAHAN ADD KARO
const courses=[
 // {category:"Physics Wallah",name:"Arjuna JEE 2026",url:"https://example.com"}
];

const domains={
"Allen":"allen.in","Apna College":"apnacollege.in","Career Will":"careerwill.com",
"Disha Online":"dishaonlineclasses.com","Khan Global Studies":"kgs.live",
"Physics Wallah":"pw.live","PW OTT - Pi Pro":"pw.live","UnAcademy":"unacademy.com",
"Test Book":"testbook.com","Study IQ":"studyiq.com","Utkarsh Classes":"utkarsh.com",
"Vidhyakul":"vidhyakul.com","Vidhyagram":"vidhyagram.com","Vedantu":"vedantu.com"
};

function esc(x){return String(x||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function logo(name){
 const d=domains[name];
 return d?`<img src="https://www.google.com/s2/favicons?domain=${d}&sz=128" alt="${esc(name)} logo">`
 :esc(name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase());
}
function card(name){
 const n=courses.filter(x=>x.category===name).length;
 const url=courses.find(x=>x.category===name)?.url;
 return `<article class="card" data-name="${esc(name.toLowerCase())}">
 <div class="logo">${logo(name)}</div><h3>${esc(name)}</h3>
 <p>${n} course${n===1?"":"s"} · Batches & Resources</p>
 ${url?`<a class="open" href="${esc(url)}" target="_blank" rel="noopener">OPEN ↗</a>`:`<span class="open">VIEW COURSES →</span>`}
 </article>`;
}
function render(){document.querySelector("#courses").innerHTML=categories.map(card).join("")}
document.querySelector("#search").addEventListener("input",e=>{
 const q=e.target.value.toLowerCase();
 document.querySelectorAll(".card").forEach(c=>c.style.display=c.dataset.name.includes(q)?"block":"none")
});
render();