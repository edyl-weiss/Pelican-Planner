'use client';
import {useState,type ReactNode} from 'react';
import {Tooltip} from 'radix-ui';
import {useLocale} from './locale-provider';
import type {Crop} from '@/lib/game/data';
import type {Plot,GameDate} from '@/lib/game/state';
import {absoluteDay,dateLabel,fromDay,gold} from '@/lib/game/planner';
export function InfoTip({label,text,chinese,children,trigger}:{label:string;text?:string;chinese?:string;children?:ReactNode;trigger?:ReactNode}){
 const {locale,t}=useLocale();const[open,setOpen]=useState(false);
 return <Tooltip.Provider delayDuration={180}><Tooltip.Root open={open} onOpenChange={setOpen}><Tooltip.Trigger asChild><button type="button" className={trigger?"item-tip-trigger":"info-tip"} aria-label={locale==='zh-CN'?'查看详细说明':label} onClick={e=>{e.preventDefault();setOpen(!open)}}>{trigger??'?'}</button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="farm-tooltip" sideOffset={8} collisionPadding={16} translate="no">{children??(locale==='zh-CN'&&chinese?chinese:t(text??label))}<Tooltip.Arrow className="tooltip-arrow"/></Tooltip.Content></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>;
}
export function CropTip({crop,plot,date,trigger}:{crop?:Crop;plot?:Plot;date?:GameDate;trigger?:ReactNode}){
 const {locale,t}=useLocale();if(!crop)return null;const zh=locale==='zh-CN';
 return <InfoTip label={`About ${crop.name}`} trigger={trigger}><div className="crop-tooltip"><strong>{plot?.customCrop?crop.name:t(crop.name)}</strong>{plot&&date?<><p>{zh?'下次收获':'Next harvest'}: {t(dateLabel(fromDay(Math.max(plot.nextHarvest,absoluteDay(date)))))}</p><p>{Math.max(0,plot.nextHarvest-absoluteDay(date))} {zh?'天后收获':'days remaining'} · {plot.quantity} {zh?'块地':'tiles'}</p><p>{zh?'地点':'Location'}: {t(plot.location??'Farm')}</p></>:<p>{crop.days} {zh?'天成熟':'days to mature'} · {zh?'种子':'Seeds'} {gold(crop.seed)}</p>}<p>{zh?'生长季节':'Seasons'}: {crop.seasons.map(t).join(' · ')}</p><p>{zh?'基础售价':'Base sale'}: {gold(crop.sell)} · {zh?'每块地最低产量':'Min. yield / tile'}: {crop.yield}</p><p>{crop.regrow?(zh?`每 ${crop.regrow} 天再生`:`Regrows every ${crop.regrow} days`):(zh?'收获一次后需重新种植':'Replant after one harvest')}</p>{crop.note&&<p>{t(crop.note)}</p>}<small>{zh?'预测假设每天浇水。售价按普通品质计算，蒂勒职业加成在收入预测中另计。':'Forecasts assume daily watering. Base prices use normal quality; Tiller is applied separately in income estimates.'}</small></div></InfoTip>;
}
