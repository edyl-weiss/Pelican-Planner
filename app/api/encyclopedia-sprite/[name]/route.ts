const SOURCES:Record<string,string>={
  "garlic":"https://cdn.source.gs/stardew-valley/img/garlic-d0f658.webp",
  "kale":"https://cdn.source.gs/stardew-valley/img/kale-71645c.webp",
  "blue-jazz":"https://cdn.source.gs/stardew-valley/img/blue-jazz-ecd4ca.webp",
  "tulip":"https://cdn.source.gs/stardew-valley/img/tulip-e0e65f.webp",
  "rhubarb":"https://cdn.source.gs/stardew-valley/img/rhubarb-98982e.webp",
  "radish":"https://cdn.source.gs/stardew-valley/img/radish-b8df1d.webp",
  "hops":"https://cdn.source.gs/stardew-valley/img/hops-24dfb1.webp",
  "summer-spangle":"https://cdn.source.gs/stardew-valley/img/summer-spangle-fdd7db.webp",
  "starfruit":"https://cdn.source.gs/stardew-valley/img/starfruit-f322a2.webp",
  "artichoke":"https://cdn.source.gs/stardew-valley/img/artichoke-a94710.webp",
  "beet":"https://cdn.source.gs/stardew-valley/img/beet-bd0d67.webp",
  "amaranth":"https://cdn.source.gs/stardew-valley/img/amaranth-95d5e1.webp",
  "fairy-rose":"https://cdn.source.gs/stardew-valley/img/fairy-rose-114e5a.webp",
  "sweet-gem-berry":"https://cdn.source.gs/stardew-valley/img/sweet-gem-berry-d41592.webp",
  "carrot":"https://cdn.source.gs/stardew-valley/img/carrot-7b8c96.webp",
  "summer-squash":"https://cdn.source.gs/stardew-valley/img/summer-squash-84b862.webp",
  "broccoli":"https://cdn.source.gs/stardew-valley/img/broccoli-e650e3.webp",
  "powdermelon":"https://cdn.source.gs/stardew-valley/img/powdermelon-375666.webp",
  "infinity-blade":"https://cdn.source.gs/stardew-valley/img/infinity-blade-e90dc8.webp",
  "galaxy-sword":"https://cdn.source.gs/stardew-valley/img/galaxy-sword-a18f63.webp",
  "dragontooth-cutlass":"https://cdn.source.gs/stardew-valley/img/dragontooth-cutlass-eab81f.webp",
  "lava-katana":"https://cdn.source.gs/stardew-valley/img/lava-katana-78e14c.webp",
  "obsidian-edge":"https://cdn.source.gs/stardew-valley/img/obsidian-edge-d0fef3.webp",
  "neptunes-glaive":"https://cdn.source.gs/stardew-valley/img/neptune-s-glaive-ebd6a5.webp",
  "bone-sword":"https://cdn.source.gs/stardew-valley/img/bone-sword-7e7dae.webp",
  "templars-blade":"https://cdn.source.gs/stardew-valley/img/templar-s-blade-bdb0c6.webp",
  "forest-sword":"https://cdn.source.gs/stardew-valley/img/forest-sword-a925d1.webp",
  "steel-smallsword":"https://cdn.source.gs/stardew-valley/img/steel-smallsword-73dd25.webp",
};

export const runtime='nodejs';
export const revalidate=2592000;

const fallback=`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" shape-rendering="crispEdges"><rect width="48" height="48" fill="none"/><path fill="#6d8f51" d="M22 11h5v8h7v5h-7v13h-6V24h-7v-5h8z"/><path fill="#42693c" d="M14 13h8v6h-8zm13-6h8v7h-8z"/></svg>`;

export async function GET(_request:Request,{params}:{params:Promise<{name:string}>}){
 const {name}=await params;
 const url=SOURCES[name];
 if(!url)return new Response('Not found',{status:404});
 try{
  const response=await fetch(url,{cache:'force-cache',headers:{'User-Agent':'Mozilla/5.0 (compatible; PelicanPlanner/1.0)'}});
  if(!response.ok)throw new Error(`Sprite source returned ${response.status}`);
  const type=response.headers.get('content-type')??'image/webp';
  if(!type.startsWith('image/'))throw new Error('Unexpected sprite content type');
  const bytes=await response.arrayBuffer();
  if(!bytes.byteLength||bytes.byteLength>250000)throw new Error('Sprite response size was invalid');
  return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=2592000, stale-while-revalidate=2592000','X-Content-Type-Options':'nosniff'}});
 }catch(error){
  console.warn(`Encyclopedia sprite fetch failed for ${name}:`,error instanceof Error?error.message:error);
  return new Response(fallback,{status:200,headers:{'Content-Type':'image/svg+xml;charset=utf-8','Cache-Control':'public, max-age=300, stale-while-revalidate=86400'}});
 }
}
