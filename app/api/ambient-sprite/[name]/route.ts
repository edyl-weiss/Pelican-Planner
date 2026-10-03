const SOURCES:Record<string,string[]>={
  junimo:[
    'https://stardewvalleywiki.com/mediawiki/images/5/57/Junimo.gif',
    'https://wiki.stardewvalley.net/mediawiki/images/5/57/Junimo.gif',
  ],
  butterfly:[
    'https://stardewvalleywiki.com/mediawiki/images/6/6c/ButterflyAnimated.gif',
    'https://wiki.stardewvalley.net/mediawiki/images/6/6c/ButterflyAnimated.gif',
  ],
  cat:[
    'https://stardewvalleywiki.com/mediawiki/images/2/29/Cat.gif',
    'https://wiki.stardewvalley.net/mediawiki/images/2/29/Cat.gif',
  ],
  dog:[
    'https://stardewvalleywiki.com/mediawiki/images/9/99/Dog.gif',
    'https://wiki.stardewvalley.net/mediawiki/images/9/99/Dog.gif',
  ],
  snow:[
    'https://stardewvalleywiki.com/mediawiki/images/c/c0/SnowAnimated.gif',
    'https://wiki.stardewvalley.net/mediawiki/images/c/c0/SnowAnimated.gif',
  ],
};

export const runtime='nodejs';
export const revalidate=604800;

async function load(url:string){
  const response=await fetch(url,{
    redirect:'follow',
    headers:{
      'User-Agent':'Mozilla/5.0 (compatible; PelicanPlanner/1.0; +https://stardewvalleywiki.com/)',
      'Accept':'image/gif,image/*;q=0.9,*/*;q=0.5',
      'Referer':'https://stardewvalleywiki.com/',
    },
    cache:'force-cache',
  });
  if(!response.ok)throw new Error(`Sprite source returned ${response.status}`);
  const type=response.headers.get('content-type')??'';
  if(!type.startsWith('image/'))throw new Error(`Unexpected sprite content type: ${type||'unknown'}`);
  const bytes=await response.arrayBuffer();
  if(!bytes.byteLength||bytes.byteLength>2_000_000)throw new Error('Sprite response size was invalid.');
  return new Response(bytes,{headers:{
    'Content-Type':type,
    'Cache-Control':'public, max-age=604800, stale-while-revalidate=2592000',
    'X-Content-Type-Options':'nosniff',
  }});
}

export async function GET(_request:Request,{params}:{params:Promise<{name:string}>}){
  const {name}=await params;
  const urls=SOURCES[name];
  if(!urls)return new Response('Not found',{status:404});
  for(const url of urls){
    try{return await load(url)}catch(error){
      console.warn(`Ambient sprite fetch failed for ${name} from ${url}:`,error instanceof Error?error.message:error);
    }
  }
  return new Response('Sprite temporarily unavailable',{status:502,headers:{'Cache-Control':'no-store'}});
}
