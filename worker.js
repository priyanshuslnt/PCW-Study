const KEY = "categories";

const DEFAULTS = [
  {id:"web",name:"Web Development",description:"HTML, CSS, JavaScript and modern web resources.",url:"https://developer.mozilla.org/",icon:"💻"},
  {id:"coding",name:"Coding",description:"Programming practice, docs and useful tools.",url:"https://github.com/",icon:"⌨️"},
  {id:"courses",name:"Online Courses",description:"Your favorite learning platforms and courses.",url:"https://www.coursera.org/",icon:"🎓"},
  {id:"notes",name:"Notes & PDFs",description:"Keep your important study material in one place.",url:"https://drive.google.com/",icon:"📚"},
  {id:"tools",name:"Study Tools",description:"Useful calculators, editors and productivity tools.",url:"https://www.google.com/",icon:"⚡"},
  {id:"youtube",name:"Learning Videos",description:"Open your preferred educational video channel.",url:"https://www.youtube.com/",icon:"▶️"}
];

async function getCategories(env){
  const raw = await env.CATEGORIES.get(KEY);
  if (!raw) {
    await env.CATEGORIES.put(KEY, JSON.stringify(DEFAULTS));
    return DEFAULTS;
  }
  try { return JSON.parse(raw); } catch { return DEFAULTS; }
}
function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
}
function authorized(request,env){
  const p=request.headers.get("X-Admin-Password") || "";
  return !!env.ADMIN_PASSWORD && p === env.ADMIN_PASSWORD;
}

export default {
  async fetch(request, env, ctx){
    const url=new URL(request.url);

    if(url.pathname === "/api/categories" && request.method === "GET"){
      return json(await getCategories(env));
    }

    if(url.pathname === "/api/categories" && ["POST","PUT","DELETE"].includes(request.method)){
      if(!authorized(request,env)) return json({error:"Unauthorized"},401);

      let categories=await getCategories(env);
      try{
        if(request.method==="POST"){
          const item=await request.json();
          if(!item.name || !item.url) return json({error:"Name and URL are required"},400);
          item.id=item.id || crypto.randomUUID();
          categories.push({
            id:item.id,name:String(item.name).trim(),description:String(item.description||"").trim(),
            url:String(item.url).trim(),icon:String(item.icon||"📘").trim()
          });
        } else if(request.method==="PUT"){
          const item=await request.json();
          if(!item.id || !item.name || !item.url) return json({error:"ID, name and URL are required"},400);
          const i=categories.findIndex(x=>x.id===item.id);
          if(i<0) return json({error:"Category not found"},404);
          categories[i]={id:item.id,name:String(item.name).trim(),description:String(item.description||"").trim(),
            url:String(item.url).trim(),icon:String(item.icon||"📘").trim()};
        } else {
          const item=await request.json();
          categories=categories.filter(x=>x.id!==item.id);
        }
        await env.CATEGORIES.put(KEY,JSON.stringify(categories));
        return json(categories);
      }catch(e){ return json({error:"Invalid request"},400); }
    }

    // Admin page is still a static asset; it talks to the protected API above.
    return env.ASSETS.fetch(request);
  }
};
