const SOURCES:Record<string,string[]>={
  'coffee':[
    "https://stardewvalleywiki.com/mediawiki/images/e/e9/Coffee.png",
    "https://wiki.stardewvalley.net/mediawiki/images/e/e9/Coffee.png",
  ],
  'green-tea':[
    "https://stardewvalleywiki.com/mediawiki/images/8/8f/Green_Tea.png",
    "https://wiki.stardewvalley.net/mediawiki/images/8/8f/Green_Tea.png",
  ],
  'mead':[
    "https://stardewvalleywiki.com/mediawiki/images/8/84/Mead.png",
    "https://wiki.stardewvalley.net/mediawiki/images/8/84/Mead.png",
  ],
  'vinegar':[
    "https://stardewvalleywiki.com/mediawiki/images/f/fe/Vinegar.png",
    "https://wiki.stardewvalley.net/mediawiki/images/f/fe/Vinegar.png",
  ],
  'beer':[
    "https://stardewvalleywiki.com/mediawiki/images/b/b3/Beer.png",
    "https://wiki.stardewvalley.net/mediawiki/images/b/b3/Beer.png",
  ],
  'pale-ale':[
    "https://stardewvalleywiki.com/mediawiki/images/7/78/Pale_Ale.png",
    "https://wiki.stardewvalley.net/mediawiki/images/7/78/Pale_Ale.png",
  ],
  'juice':[
    "https://stardewvalleywiki.com/mediawiki/images/f/f1/Juice.png",
    "https://wiki.stardewvalley.net/mediawiki/images/f/f1/Juice.png",
  ],
  'mayonnaise':[
    "https://stardewvalleywiki.com/mediawiki/images/4/4e/Mayonnaise.png",
    "https://wiki.stardewvalley.net/mediawiki/images/4/4e/Mayonnaise.png",
  ],
  'smoked-fish':[
    "https://stardewvalleywiki.com/mediawiki/images/4/4c/Smoked_Fish.png",
    "https://wiki.stardewvalley.net/mediawiki/images/4/4c/Smoked_Fish.png",
  ],
  'dried-fruit':[
    "https://stardewvalleywiki.com/mediawiki/images/6/66/Dried_Fruit.png",
    "https://wiki.stardewvalley.net/mediawiki/images/6/66/Dried_Fruit.png",
  ],
  'dried-mushrooms':[
    "https://stardewvalleywiki.com/mediawiki/images/1/1a/Dried_Mushrooms.png",
    "https://wiki.stardewvalley.net/mediawiki/images/1/1a/Dried_Mushrooms.png",
  ],
  'raisins':[
    "https://stardewvalleywiki.com/mediawiki/images/0/06/Raisins.png",
    "https://wiki.stardewvalley.net/mediawiki/images/0/06/Raisins.png",
  ],
  'oil':[
    "https://stardewvalleywiki.com/mediawiki/images/0/06/Oil.png",
    "https://wiki.stardewvalley.net/mediawiki/images/0/06/Oil.png",
  ],
  'pickles':[
    "https://stardewvalleywiki.com/mediawiki/images/c/c7/Pickles.png",
    "https://wiki.stardewvalley.net/mediawiki/images/c/c7/Pickles.png",
  ],
  'aged-roe':[
    "https://stardewvalleywiki.com/mediawiki/images/0/0e/Aged_Roe.png",
    "https://wiki.stardewvalley.net/mediawiki/images/0/0e/Aged_Roe.png",
  ],
};

export const runtime='nodejs';
export const revalidate=2592000;
const SPRITE_TIMEOUT_MS=5_000;

const fallback=`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" shape-rendering="crispEdges"><rect width="48" height="48" fill="none"/><path fill="#d7b55d" d="M12 14h24v20H12z"/><path fill="#795538" d="M12 14h24v4H12v-4zm0 16h24v4H12v-4z"/></svg>`;

async function load(url:string){
 const response=await fetch(url,{redirect:'follow',cache:'force-cache',signal:AbortSignal.timeout(SPRITE_TIMEOUT_MS),headers:{'User-Agent':'Mozilla/5.0 (compatible; PelicanPlanner/1.0; +https://stardewvalleywiki.com/)','Accept':'image/png,image/*;q=0.9,*/*;q=0.5','Referer':'https://stardewvalleywiki.com/'}});
 if(!response.ok)throw new Error(`Sprite source returned ${response.status}`);
 const type=response.headers.get('content-type')??'';
 if(!type.startsWith('image/'))throw new Error(`Unexpected sprite content type: ${type||'unknown'}`);
 const bytes=await response.arrayBuffer();
 if(!bytes.byteLength||bytes.byteLength>250000)throw new Error('Sprite response size was invalid');
 return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=2592000, stale-while-revalidate=2592000','X-Content-Type-Options':'nosniff'}});
}

export async function GET(_request:Request,{params}:{params:Promise<{name:string}>}){
 const {name}=await params;
 const urls=SOURCES[name];
 if(!urls)return new Response('Not found',{status:404});
 for(const url of urls){
  try{return await load(url)}catch(error){console.warn(`Planner sprite fetch failed for ${name} from ${url}:`,error instanceof Error?error.message:error);}
 }
 return new Response(fallback,{status:200,headers:{'Content-Type':'image/svg+xml;charset=utf-8','Cache-Control':'public, max-age=300, stale-while-revalidate=86400'}});
}
