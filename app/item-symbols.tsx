'use client';
/* eslint-disable @next/next/no-img-element -- Preserve native game pixel art. */
import {Tooltip} from 'radix-ui';
import type {ReactNode} from 'react';
import assets from '@/lib/game/assets-source.json';
import {obtainMethods} from '@/lib/game/obtain';
import {translate,type Locale} from '@/lib/i18n/translate';

const materials=['Copper Bar','Iron Bar','Gold Bar','Hardwood','Wood','Stone','Gold'] as const;
const registry=assets as Record<string,{local_path:string}>;
export function MaterialSymbol({name,locale='en'}:{name:string;locale?:Locale}){
 const label=translate(name,locale);const record=registry[name];if(!record)return <>{label}</>;
 const details=obtainMethods(name).map(text=>translate(text,locale));
 return <Tooltip.Provider delayDuration={180}><Tooltip.Root><Tooltip.Trigger asChild><span className="material-symbol" tabIndex={0} role="img" aria-label={label} translate="no"><img src={record.local_path} width={22} height={22} alt=""/></span></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="farm-tooltip material-symbol-tip" sideOffset={7} collisionPadding={12} translate="no"><strong>{label}</strong>{details.map((detail,index)=><p key={index}>{detail}</p>)}<Tooltip.Arrow className="tooltip-arrow"/></Tooltip.Content></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>;
}
export function QualitySymbol({quality,locale='en'}:{quality:'Normal'|'Silver'|'Gold'|'Iridium';locale?:Locale}){
 const label=translate(quality==='Gold'?'Gold quality':quality,locale);
 return quality==='Normal'?<span className="normal-quality" title={locale==='zh-CN'?'普通品质（无星）':'Normal quality (no star)'}>{label}</span>:<span className="quality-symbol" role="img" aria-label={label} title={label} translate="no"><img src={'/sprites/'+quality.toLowerCase()+'-quality.png'} width={18} height={18} alt=""/></span>;
}
// Match whole resource names, with quality phrases taking precedence over currency.
const pattern=/(\b(?:normal|silver|gold|iridium)[ -]quality\b|普通品质|白银品质|银星品质|黄金品质|金星品质|铱星品质|铱品质|金星|银星|铱星|\b(?:Copper Bar|Iron Bar|Gold Bar|Hardwood|Wood|Stone|Gold)\b(?!\s+(?:Ore|Clock|Brazier|Floor|Fence|Sign))|铜锭|铁锭|金锭|硬木|木材|石头|金币)/gi;
const chinese:Record<string,string>={'铜锭':'Copper Bar','铁锭':'Iron Bar','金锭':'Gold Bar','硬木':'Hardwood','木材':'Wood','石头':'Stone','金币':'Gold'};
export function symbolizeText(text:string,locale:Locale):ReactNode{
 if(!text.match(pattern))return text;
 return text.split(pattern).map((part,index)=>{
  if(/quality|品质|金星|银星|铱星/i.test(part)){
   const quality=/normal|普通/i.test(part)?'Normal':/silver|白银|银星/i.test(part)?'Silver':/iridium|铱/i.test(part)?'Iridium':/gold|黄金|金星/i.test(part)?'Gold':null;
   if(quality&&/^(?:(?:normal|silver|gold|iridium)[ -]quality|普通品质|白银品质|银星品质|黄金品质|金星品质|铱星品质|铱品质|金星|银星|铱星)$/i.test(part))return <QualitySymbol key={index} quality={quality} locale={locale}/>;
  }
  const name=chinese[part]??materials.find(name=>name.toLowerCase()===part.toLowerCase());
  return name?<MaterialSymbol key={index} name={name} locale={locale}/>:part;
 });
}
