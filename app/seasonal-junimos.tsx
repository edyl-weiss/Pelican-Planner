'use client';
/* eslint-disable @next/next/no-img-element -- Same-origin routes proxy the canonical Stardew Valley Wiki GIFs so decorative animations do not depend on browser hotlinking. */
import type {GameDate} from '@/lib/game/state';

const JUNIMO='/api/ambient-sprite/junimo';

function AmbientGif({src,className,width,height}:{src:string;className:string;width:number;height:number}){
 return <span className={className}><img src={src} alt="" width={width} height={height} loading="eager" decoding="async"/></span>;
}

export default function SeasonalJunimos({season}:{season:GameDate['season']}){
 return <div className="junimo-background" data-season={season} aria-hidden="true">
  {[0,1,2,3,4].map(index=><AmbientGif src={JUNIMO} className={`background-junimo junimo-${index+1}`} width={48} height={48} key={`junimo-${index}`}/>) }
 </div>;
}
