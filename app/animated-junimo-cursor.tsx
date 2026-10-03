'use client';
/* eslint-disable @next/next/no-img-element -- The cursor uses the same-origin animated Junimo GIF route with a bundled fallback. */

import {useEffect,useRef,useState} from 'react';

const TEXT_INPUT_SELECTOR='input[type="text"],input[type="search"],input[type="email"],input[type="number"],textarea,[contenteditable="true"]';

export default function AnimatedJunimoCursor(){
 const cursorRef=useRef<HTMLSpanElement>(null);
 const frameRef=useRef<number|null>(null);
 const latest=useRef({x:0,y:0,visible:false,overText:false});
 const[useFallback,setUseFallback]=useState(false);

 useEffect(()=>{
  const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
  const cursor=cursorRef.current;
  if(!cursor)return;

  const paint=()=>{
   frameRef.current=null;
   const {x,y,visible,overText}=latest.current;
   cursor.style.transform=`translate3d(${x}px,${y}px,0)`;
   cursor.dataset.visible=visible&&!overText?'true':'false';
  };
  const schedule=()=>{if(frameRef.current===null)frameRef.current=window.requestAnimationFrame(paint)};
  const onMove=(event:PointerEvent)=>{
   const target=event.target instanceof Element?event.target:null;
   latest.current={x:event.clientX,y:event.clientY,visible:finePointer.matches,overText:!!target?.closest(TEXT_INPUT_SELECTOR)};
   schedule();
  };
  const onEnter=()=>{latest.current.visible=finePointer.matches;schedule()};
  const onLeave=()=>{latest.current.visible=false;schedule()};
  const syncMode=()=>{cursor.dataset.enabled=finePointer.matches?'true':'false';if(!finePointer.matches)latest.current.visible=false;schedule()};

  syncMode();
  window.addEventListener('pointermove',onMove,{passive:true});
  document.documentElement.addEventListener('pointerenter',onEnter,{passive:true});
  document.documentElement.addEventListener('pointerleave',onLeave,{passive:true});
  finePointer.addEventListener('change',syncMode);
  return()=>{
   if(frameRef.current!==null)window.cancelAnimationFrame(frameRef.current);
   window.removeEventListener('pointermove',onMove);
   document.documentElement.removeEventListener('pointerenter',onEnter);
   document.documentElement.removeEventListener('pointerleave',onLeave);
   finePointer.removeEventListener('change',syncMode);
  };
 },[]);

 return <span ref={cursorRef} className="animated-junimo-cursor" data-visible="false" data-enabled="false" aria-hidden="true">
  <span className="animated-junimo-cursor-tip"/>
  <span className="animated-junimo-cursor-bob"><img src={useFallback?'/sprites/junimo-cursor.svg':'/api/ambient-sprite/junimo'} alt="" width="32" height="32" draggable={false} onError={()=>setUseFallback(true)}/></span>
 </span>;
}
