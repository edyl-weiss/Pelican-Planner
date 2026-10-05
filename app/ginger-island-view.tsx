'use client';
/* eslint-disable @next/next/no-img-element -- The interactive base map is the canonical Ginger Island map from the Stardew Valley Wiki, with an offline-styled fallback behind it. */
import {memo,useCallback,useMemo,useRef,useState} from 'react';
import type {CSSProperties,PointerEvent as ReactPointerEvent} from 'react';
import type {RunState} from '@/lib/game/state';
import type {UpdateRun} from './farm-journal';
import {
 ISLAND_HOTSPOTS,
 ISLAND_REGIONS,
 TOTAL_GOLDEN_WALNUTS,
 WALNUT_ACTIVITIES,
 type IslandRegion,
} from '@/lib/game/ginger-island';
import {dateLabel} from '@/lib/game/planner';

const MAP_URL='https://stardewvalleywiki.com/mediawiki/images/4/47/Ginger_Island_Map.png';
type Hotspot=(typeof ISLAND_HOTSPOTS)[number];

type HotspotPinProps={
 hotspot:Hotspot;
 active:boolean;
 dimmed:boolean;
 index:number;
 onSelect:(id:string,region:IslandRegion)=>void;
};

const HotspotPin=memo(function HotspotPin({hotspot,active,dimmed,index,onSelect}:HotspotPinProps){
 const tooltipId=`ginger-hotspot-${hotspot.id}`;
 const style={
  left:`${hotspot.x}%`,
  top:`${hotspot.y}%`,
  '--pin-delay':`${Math.min(index*38,420)}ms`,
 } as CSSProperties;
 return <button
  className={`island-hotspot ${active?'active':''} ${dimmed?'muted-pin':''}`}
  style={style}
  onClick={()=>onSelect(hotspot.id,hotspot.region)}
  aria-label={`${hotspot.name}: ${hotspot.subtitle}`}
  aria-describedby={tooltipId}
 >
  <span className="hotspot-ripple" aria-hidden="true"/>
  <span className="hotspot-dot"/>
  <span id={tooltipId} role="tooltip" className="hotspot-tooltip"><strong>{hotspot.name}</strong><small>{hotspot.subtitle}</small></span>
 </button>;
});

export default function GingerIslandView({run,update}:{run:RunState;update:UpdateRun}){
 const [region,setRegion]=useState<(typeof ISLAND_REGIONS)[number]>('All');
 const [search,setSearch]=useState('');
 const [selectedHotspot,setSelectedHotspot]=useState<string|null>('farm');
 const [zoom,setZoom]=useState(1);
 const [mapFailed,setMapFailed]=useState(false);
 const [mapLoaded,setMapLoaded]=useState(false);
 const [isPanning,setIsPanning]=useState(false);
 const mapViewportRef=useRef<HTMLDivElement|null>(null);
 const panRef=useRef<{pointerId:number;x:number;y:number;scrollLeft:number;scrollTop:number}|null>(null);
 const progress=run.islandProgress.walnuts;
 const normalizedSearch=search.trim().toLowerCase();

 const found=useMemo(
  ()=>WALNUT_ACTIVITIES.reduce((sum,item)=>sum+Math.min(item.max,progress[item.id]??0),0),
  [progress],
 );
 const progressPercent=found/TOTAL_GOLDEN_WALNUTS*100;
 const activities=useMemo(()=>WALNUT_ACTIVITIES.filter(item=>
  (region==='All'||item.region===region)&&
  (!normalizedSearch||`${item.name} ${item.hint} ${item.region}`.toLowerCase().includes(normalizedSearch))&&
  (!run.islandProgress.hideCompleted||(progress[item.id]??0)<item.max)
 ),[region,normalizedSearch,run.islandProgress.hideCompleted,progress]);
 const visibleHotspots=useMemo(
  ()=>ISLAND_HOTSPOTS.filter(h=>region==='All'||h.region===region),
  [region],
 );
 const selected=useMemo(()=>ISLAND_HOTSPOTS.find(h=>h.id===selectedHotspot),[selectedHotspot]);

 const setCount=useCallback((id:string,max:number,value:number)=>update(current=>({
  ...current,
  islandProgress:{
   ...current.islandProgress,
   walnuts:{...current.islandProgress.walnuts,[id]:Math.max(0,Math.min(max,value))},
  },
 })),[update]);
 const pin=useCallback((name:string)=>update(current=>({
  ...current,
  notes:[...current.notes,{id:crypto.randomUUID(),label:`Ginger Island: ${name}`,date:current.date,done:false}],
 }),`Pinned ${name} for ${dateLabel(run.date)}.`),[run.date,update]);
 const focus=useCallback((id:string,hotspotRegion:IslandRegion)=>{
  setSelectedHotspot(id);
  setRegion(hotspotRegion);
 },[]);
 const zoomBy=useCallback((amount:number)=>setZoom(current=>Math.min(1.8,Math.max(1,Number((current+amount).toFixed(1))))),[]);
 const markMapLoaded=useCallback(()=>setMapLoaded(true),[]);
 const markMapFailed=useCallback(()=>setMapFailed(true),[]);

 const startPan=useCallback((event:ReactPointerEvent<HTMLDivElement>)=>{
  if(event.button!==0||(event.target as HTMLElement).closest('button'))return;
  const viewport=mapViewportRef.current;
  if(!viewport)return;
  if(viewport.scrollWidth<=viewport.clientWidth&&viewport.scrollHeight<=viewport.clientHeight)return;
  panRef.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,scrollLeft:viewport.scrollLeft,scrollTop:viewport.scrollTop};
  viewport.setPointerCapture(event.pointerId);
  setIsPanning(true);
  event.preventDefault();
 },[]);
 const movePan=useCallback((event:ReactPointerEvent<HTMLDivElement>)=>{
  const viewport=mapViewportRef.current;
  const pan=panRef.current;
  if(!viewport||!pan||pan.pointerId!==event.pointerId)return;
  if(event.buttons===0){panRef.current=null;setIsPanning(false);return;}
  viewport.scrollLeft=pan.scrollLeft-(event.clientX-pan.x);
  viewport.scrollTop=pan.scrollTop-(event.clientY-pan.y);
  event.preventDefault();
 },[]);
 const endPan=useCallback((event:ReactPointerEvent<HTMLDivElement>)=>{
  const viewport=mapViewportRef.current;
  const pan=panRef.current;
  if(!pan||pan.pointerId!==event.pointerId)return;
  panRef.current=null;
  setIsPanning(false);
  if(viewport?.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
 },[]);

 return <div className="island-page" translate="no">
  <div className="island-head"><div><p className="eyebrow">Late-game field guide</p><h2>Ginger Island</h2><p className="muted">Use this map as your personal checklist! Just click a location and track Golden Walnuts as you find them. You can also pin anything you want to remember to do today!</p></div><div className="walnut-meter"><strong>{found}<span>/{TOTAL_GOLDEN_WALNUTS}</span></strong><div><b>Golden Walnuts</b><small>{TOTAL_GOLDEN_WALNUTS-found} left</small></div></div></div>
  {!run.unlocks.includes('Island')&&<div className="notice island-lock"><strong>Still working toward Ginger Island?</strong><span>You’re welcome to explore the map now! Island activities will join your daily plan once Ginger Island is marked as unlocked in your farm details.</span></div>}
  <div className="island-map-layout">
   <section className="ginger-map-shell" aria-label="Interactive Ginger Island map">
    <div className="ginger-map-toolbar"><div className="island-region-chips">{ISLAND_REGIONS.map(r=><button key={r} className={`btn compact ${region===r?'selected':''}`} onClick={()=>setRegion(r)}>{r}</button>)}</div><div className="map-zoom"><button className="btn quiet compact" onClick={()=>zoomBy(-.2)} disabled={zoom<=1} aria-label="Zoom map out">−</button><span>{Math.round(zoom*100)}%</span><button className="btn quiet compact" onClick={()=>zoomBy(.2)} disabled={zoom>=1.8} aria-label="Zoom map in">+</button></div></div>
    <div
     ref={mapViewportRef}
     className={`ginger-map-viewport ${isPanning?'is-panning':''}`}
     onPointerDown={startPan}
     onPointerMove={movePan}
     onPointerUp={endPan}
     onPointerCancel={endPan}
     onLostPointerCapture={endPan}
     aria-label="Ginger Island map. Hold left click and drag to pan when zoomed."
    >
     <div className={`ginger-map-stage ${mapLoaded?'is-loaded':''}`} style={{width:`${zoom*100}%`,height:`${zoom*100}%`}}>
      <div className="ginger-map-fallback" aria-hidden="true"><span className="island-mass north"/><span className="island-mass west"/><span className="island-mass east"/><span className="island-mass south"/></div>
      {!mapFailed&&<img className="ginger-map-image" src={MAP_URL} alt="Ginger Island map" draggable={false} onLoad={markMapLoaded} onError={markMapFailed}/>} 
      <div className="island-water-motion" aria-hidden="true"><i/><i/><i/><i/></div>
      {ISLAND_HOTSPOTS.map((hotspot,index)=><HotspotPin key={hotspot.id} hotspot={hotspot} active={selectedHotspot===hotspot.id} dimmed={region!=='All'&&region!==hotspot.region} index={index} onSelect={focus}/>)}
     </div>
    </div>
    <div className="map-location-strip">{visibleHotspots.map(h=><button key={h.id} className={selectedHotspot===h.id?'active':''} onClick={()=>focus(h.id,h.region)}><strong>{h.name}</strong><span>{h.subtitle}</span></button>)}</div>
    {mapFailed&&<p className="label-note map-fallback-note">The map image couldn’t load, but you can still explore the locations and track your walnuts here.</p>}
   </section>
   <aside className="paper island-location-card">{selected?<><p className="eyebrow">{selected.region}</p><h3 key={selected.id}>{selected.name}</h3><p>{selected.subtitle}</p><p className="small muted">Showing checklist items for {selected.region}. Use the region buttons or search to narrow things further.</p><button className="btn primary compact" onClick={()=>pin(selected.name)}>Pin to today</button></>:<p>Click a spot on the map to take a closer look!</p>}<hr/><div className="island-mini-progress"><span>Island progress</span><strong>{Math.round(progressPercent)}%</strong></div><div className="island-progress-track"><span style={{width:`${progressPercent}%`}}/></div><p className="small muted">Qi’s Walnut Room opens at 100 on the game’s walnut counter. Pelican Planner has {found} tracked here, so use the in-game counter as the final check.</p></aside>
  </div>
  <section className="paper walnut-checklist"><div className="section-heading"><div><p className="eyebrow">Walnut tracker</p><h2>{region==='All'?'All island regions':region}</h2></div><div className="island-check-controls"><label className="search-field">Search<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Volcano, fishing, puzzle…"/></label><label className="check-label"><input type="checkbox" checked={run.islandProgress.hideCompleted} onChange={e=>update(current=>({...current,islandProgress:{...current.islandProgress,hideCompleted:e.target.checked}}))}/>Hide completed</label><label className="check-label"><input type="checkbox" checked={run.islandProgress.revealPuzzles} onChange={e=>update(current=>({...current,islandProgress:{...current.islandProgress,revealPuzzles:e.target.checked}}))}/>Reveal puzzle hints</label></div></div>
   <div className="walnut-grid">{activities.map(item=>{const count=Math.min(item.max,progress[item.id]??0);const done=count>=item.max;return <article className={`walnut-row ${done?'is-complete':''}`} key={item.id}><div className="walnut-icon" aria-hidden="true">●</div><div className="walnut-copy"><div><strong>{item.name}</strong><span>{item.region}</span></div><p className="small muted">{item.puzzle&&!run.islandProgress.revealPuzzles?'Puzzle hint hidden. Turn on “Reveal puzzle hints” when you want it.':item.hint}</p></div><div className="walnut-actions">{item.max===1?<button className={`btn compact ${done?'selected':''}`} onClick={()=>setCount(item.id,item.max,done?0:1)}>{done?'Found ✓':'Mark found'}</button>:<div className="walnut-stepper"><button className="btn quiet compact" onClick={()=>setCount(item.id,item.max,count-1)} aria-label={`Decrease ${item.name}`}>−</button><strong>{count}/{item.max}</strong><button className="btn quiet compact" onClick={()=>setCount(item.id,item.max,count+1)} aria-label={`Increase ${item.name}`}>+</button></div>}<button className="btn quiet compact" onClick={()=>pin(item.name)}>Pin</button></div></article>})}</div>{!activities.length&&<p className="empty-note">Nothing left in this view! Try another region or clear your search to see more walnuts.</p>}
  </section>
 </div>;
}
