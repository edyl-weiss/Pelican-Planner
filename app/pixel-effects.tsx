'use client';
import {useEffect} from 'react';
import {useLocale} from './locale-provider';
export default function PixelEffects(){
 const{effects}=useLocale();
 useEffect(()=>{
  if(!effects)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles=new Set<HTMLElement>();let last=0;
  const sparkle=(event:MouseEvent)=>{
   if(reduced.matches||Date.now()-last<100||!(event.target instanceof Element))return;
   const control=event.target.closest('button,a,[role="checkbox"],[role="tab"],[role="slider"]');
   if(!(control instanceof HTMLElement)||control.matches(':disabled,[aria-disabled="true"]'))return;
   last=Date.now();const rect=control.getBoundingClientRect();
   const x=event.detail===0?rect.left+rect.width/2:event.clientX;const y=event.detail===0?rect.top+rect.height/2:event.clientY;
   const burst=document.createElement('span');burst.className='pixel-burst';burst.setAttribute('aria-hidden','true');burst.style.left=x+'px';burst.style.top=y+'px';
   const celebration=control.getAttribute('role')==='checkbox'||control.classList.contains('primary');
   for(let i=0;i<(celebration?7:5);i++){const spark=document.createElement('i');const angle=i*Math.PI*2/(celebration?7:5)-Math.PI/2;spark.style.setProperty('--dx',Math.cos(angle)*(18+i%2*9)+'px');spark.style.setProperty('--dy',Math.sin(angle)*24-14+'px');spark.style.setProperty('--turn',i%2?'90deg':'-90deg');spark.style.background=['#f5bf35','#fff5b2','#86bd52','#e8875d'][i%4];burst.appendChild(spark);}
   document.body.appendChild(burst);particles.add(burst);
   const timer=window.setTimeout(()=>{burst.remove();particles.delete(burst)},650);burst.dataset.timer=String(timer);
  };
  document.addEventListener('click',sparkle);
  return()=>{document.removeEventListener('click',sparkle);for(const particle of particles){clearTimeout(Number(particle.dataset.timer));particle.remove();}};
 },[effects]);
 return null;
}
