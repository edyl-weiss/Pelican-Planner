'use client';
import {useEffect,useState} from 'react';
import {Sprite} from './farm-ui';
import {useLocale} from './locale-provider';
import type {RunState} from '@/lib/game/state';

type Line=[string,string];
const idle:Line[]=[
 ['Only a few things today. That seems peaceful. I approve.','今天事情不多。这样很安静。我赞成。'],
 ['The sun is very bright today. I’ll stay here, if you don’t mind.','今天太阳很亮。如果你不介意，我就待在这里。'],
 ['You have many things planned today. Humans seem to enjoy being busy... I think.','你今天安排了很多事。人类似乎很喜欢忙碌……大概吧。'],
 ['I was going to bring you something from the sewer, but... perhaps another time.','我本来想从下水道带点东西给你，不过……还是下次吧。'],
];
const repeated:Line[]=[
 ['You’ve spoken to me several times now. ...Is something wrong?','你已经和我说了好几次话了。……出什么事了吗？'],
 ['I’m beginning to suspect you’re doing this intentionally.','我开始怀疑你是故意一直来找我的。'],
 ['I have very little else to say. I could tell you about the sewer.','我已经没什么可说的了。要不我给你讲讲下水道？'],
 ['...The sewer has excellent acoustics.','……下水道的回声效果很好。'],
];
function contextual(run:RunState,taskCount:number):Line[]{
 const lines:Line[]=[];
 if(run.weather==='Rain'||run.weather==='Storm')lines.push(['The rain makes everything smell damp. It’s nice. ...Is that strange?','雨让所有东西都带着潮湿的味道。挺好的。……这样说很奇怪吗？']);
 if(run.gold<500)lines.push(["You don’t have much gold left. I have lived in a sewer, so... I think you’ll manage.",'你的金币不多了。不过我住过下水道，所以……我觉得你会没事的。']);
 if(run.gold>=50000)lines.push(["That’s a lot of gold. Please don’t tell anyone I’m impressed.",'好多金币。请不要告诉别人我觉得很厉害。']);
 if(taskCount>=7)lines.push(['That is... a lot. Will you still have time to eat?','这……真的很多。你还会有时间吃饭吗？']);
 if(taskCount<=2)lines.push(['Only a few things today. That seems peaceful. I approve.','今天只有几件事。很安静。我赞成。']);
 if(run.mineFloor>=80)lines.push(["You’ve gone very deep underground. Finally, a sensible hobby.",'你已经去了很深的地下。终于有个合理的爱好了。']);
 if(run.date.day===28)lines.push(['Another season is ending. Things change very quickly above ground.','又一个季节要结束了。地面上的东西变化得真快。']);
 return lines.length?lines:idle;
}
export default function KrobusBuddy({run,taskCount=0}:{run:RunState;taskCount?:number}){
 const {locale}=useLocale();const [visits,setVisits]=useState(0);const [open,setOpen]=useState(false);
 useEffect(()=>{if(!open)return;const timer=window.setTimeout(()=>setOpen(false),5000);return()=>window.clearTimeout(timer)},[open,visits]);
 const label=locale==='zh-CN'?'和科罗布斯打个招呼':'Say hello to Krobus';
 const pool=visits>=5?repeated:contextual(run,taskCount);const line=pool[Math.max(0,visits-1)%pool.length];
 return <div className="krobus-buddy"><button type="button" className="krobus-button" aria-label={label} title={label} aria-expanded={open} onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);event.stopPropagation()}}} onClick={()=>{setVisits(n=>n+1);setOpen(true)}}><span key={visits} className={visits&&open?'krobus-hello':''}><Sprite name="Krobus" size={48}/></span></button>{open&&<div className="krobus-comment" role="status">{line[locale==='zh-CN'?1:0]}</div>}</div>;
}
