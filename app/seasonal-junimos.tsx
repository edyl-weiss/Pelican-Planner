'use client';
/* eslint-disable @next/next/no-img-element -- Same-origin routes proxy the canonical Stardew Valley Wiki GIFs so decorative animations do not depend on browser hotlinking. */
import type {GameDate} from '@/lib/game/state';

const ASSETS={
 junimo:'/api/ambient-sprite/junimo',
 butterfly:'/api/ambient-sprite/butterfly',
 cat:'/api/ambient-sprite/cat',
 dog:'/api/ambient-sprite/dog',
 snow:'/api/ambient-sprite/snow',
} as const;

function AmbientGif({src,className,width,height}:{src:string;className:string;width:number;height:number}){
 return <span className={className}><img src={src} alt="" width={width} height={height} loading="eager" decoding="async"/></span>;
}

export default function SeasonalJunimos({season}:{season:GameDate['season']}){
 const warm=season==='Spring'||season==='Summer';
 return <div className="junimo-background" data-season={season} aria-hidden="true">
  {[0,1,2,3,4].map(index=><AmbientGif src={ASSETS.junimo} className={`background-junimo junimo-${index+1}`} width={48} height={48} key={`junimo-${index}`}/>) }
  <AmbientGif src={ASSETS.cat} className="ambient-sprite ambient-cat" width={64} height={64}/>
  <AmbientGif src={ASSETS.dog} className="ambient-sprite ambient-dog" width={96} height={96}/>
  {warm&&<>
   <AmbientGif src={ASSETS.butterfly} className="ambient-sprite ambient-butterfly butterfly-1" width={67} height={51}/>
   <AmbientGif src={ASSETS.butterfly} className="ambient-sprite ambient-butterfly butterfly-2" width={67} height={51}/>
  </>}
  {season==='Winter'&&[1,2,3].map(index=><AmbientGif src={ASSETS.snow} className={`ambient-sprite ambient-snow snow-${index}`} width={45} height={45} key={`snow-${index}`}/>)}
 </div>;
}
