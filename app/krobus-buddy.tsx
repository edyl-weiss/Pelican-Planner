'use client';
import {useEffect,useState} from 'react';
import {Sprite} from './farm-ui';
import {useLocale} from './locale-provider';
const greetings=[
 ['I brought moral support. And a void egg.','我带来了精神支持，还有一颗虚空蛋。'],
 ['I checked the weather. From indoors.','我看过天气了。在屋里看的。'],
 ['The crops are growing. I remain short.','作物长高了。我还是这么矮。'],
 ['A little progress deserves a little snack.','有一点进展，就值得吃一点零食。'],
];
export default function KrobusBuddy(){
 const {locale}=useLocale();const [visits,setVisits]=useState(0);const [open,setOpen]=useState(false);
 useEffect(()=>{if(!open)return;const timer=window.setTimeout(()=>setOpen(false),5000);return()=>window.clearTimeout(timer)},[open,visits]);
 const label=locale==='zh-CN'?'和科罗布斯打个招呼':'Say hello to Krobus';
 return <div className="krobus-buddy"><button type="button" className="krobus-button" aria-label={label} title={label} aria-expanded={open} onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);event.stopPropagation()}}} onClick={()=>{setVisits(n=>n+1);setOpen(true)}}><span key={visits} className={visits&&open?'krobus-hello':''}><Sprite name="Krobus" size={48}/></span></button>{open&&<div className="krobus-comment" role="status">{greetings[(visits-1)%greetings.length][locale==='zh-CN'?1:0]}</div>}</div>;
}
