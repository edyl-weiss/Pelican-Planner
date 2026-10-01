'use client';
import {useEffect} from 'react';
import {useLocale} from './locale-provider';
export default function PixelEffects(){
 const {effects}=useLocale();
 useEffect(()=>{
  if(!effects)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles=new Map<HTMLElement,number>();let last=0;
  const clear=()=>{for(const [node,timer] of particles){window.clearTimeout(timer);node.remove()}particles.clear()};
  const mount=(node:HTMLElement,life:number)=>{document.body.appendChild(node);particles.set(node,window.setTimeout(()=>{node.remove();particles.delete(node)},life))};
  const sparkle=(event:MouseEvent)=>{
   if(reduced.matches||Date.now()-last<100||!(event.target instanceof Element))return;
   const control=event.target.closest('button,a,[role="checkbox"],[role="tab"],[role="slider"]');
   if(!(control instanceof HTMLElement)||control.matches(':disabled,[aria-disabled="true"],.krobus-button'))return;
   last=Date.now();const rect=control.getBoundingClientRect();
   const x=event.detail===0?rect.left+rect.width/2:event.clientX;const y=event.detail===0?rect.top+rect.height/2:event.clientY;
   const burst=document.createElement('span');burst.className='pixel-burst';burst.setAttribute('aria-hidden','true');burst.style.left=x+'px';burst.style.top=y+'px';
   const harvest=control.dataset.cozyEffect==='harvest';
   for(let i=0;i<(harvest?5:3);i++){const spark=document.createElement('i');const angle=i*Math.PI*2/(harvest?5:3)-Math.PI/2;spark.style.setProperty('--dx',Math.cos(angle)*(12+i%2*6)+'px');spark.style.setProperty('--dy',Math.sin(angle)*16-9+'px');spark.style.setProperty('--turn',i%2?'90deg':'-90deg');spark.style.background=['#e3b858','#e8d4a5','#8bb46a'][i%3];burst.appendChild(spark)}
   mount(burst,600);
   if(harvest){
    const source=control.closest('.harvest-inbox-row,.plot-row')?.querySelector<HTMLImageElement>('img.sprite');
    const reward=document.createElement('span');reward.className='cozy-harvest';reward.setAttribute('aria-hidden','true');reward.style.left=Math.min(window.innerWidth-36,Math.max(8,x-16))+'px';reward.style.top=Math.max(42,y-12)+'px';
    const sprite=document.createElement('img');sprite.src=source?.getAttribute('src')??'/sprites/parsnip.png';sprite.alt='';sprite.width=32;sprite.height=32;reward.appendChild(sprite);mount(reward,950);
   }
  };
  const motionChanged=()=>{if(reduced.matches)clear()};const hidden=()=>{if(document.hidden)clear()};
  // Capture the row's sprite and position before a successful harvest removes it.
  document.addEventListener('click',sparkle,true);document.addEventListener('visibilitychange',hidden);reduced.addEventListener('change',motionChanged);
  return()=>{document.removeEventListener('click',sparkle,true);document.removeEventListener('visibilitychange',hidden);reduced.removeEventListener('change',motionChanged);clear()};
 },[effects]);
 return null;
}
