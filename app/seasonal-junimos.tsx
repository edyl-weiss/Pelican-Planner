'use client';
/* eslint-disable @next/next/no-img-element -- The animated Junimo is a tiny canonical Stardew Valley Wiki GIF. */
import type {GameDate} from '@/lib/game/state';

const JUNIMO_GIF='https://www.stardewvalleywiki.com/mediawiki/images/5/57/Junimo.gif';

export default function SeasonalJunimos({season}:{season:GameDate['season']}){
 return <div className="junimo-background" data-season={season} aria-hidden="true">
  {[0,1,2].map(index=><span className={`background-junimo junimo-${index+1}`} key={index}>
   <img src={JUNIMO_GIF} alt="" width="48" height="48" loading="eager" referrerPolicy="no-referrer" onError={event=>{event.currentTarget.style.display='none'}}/>
  </span>)}
 </div>;
}
