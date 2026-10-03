'use client';
import {useMemo,useState,useCallback} from 'react';
import {Download,Search,WifiOff,ExternalLink,ArrowLeft} from 'lucide-react';
import {useLocale} from './locale-provider';
import {Sprite} from './farm-ui';
import {encyclopediaCategories,encyclopediaEntries,encyclopediaByTitle,encyclopediaSpritePath,exactEncyclopediaMatch,normalizeEncyclopediaQuery,relatedEncyclopediaEntries,searchEncyclopedia,type EncyclopediaCategory,type EncyclopediaEntry} from '@/lib/game/encyclopedia';
import {buildOfflineEncyclopediaHtml} from '@/lib/game/encyclopedia-offline';

const escapeRegExp=(text:string)=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const linkableEntries=encyclopediaEntries.filter(entry=>entry.sprite&&entry.title.length>2).sort((a,b)=>b.title.length-a.title.length);
const termMap=new Map<string,EncyclopediaEntry>();
for(const entry of linkableEntries){for(const term of [entry.title,...entry.aliases]){const key=term.toLowerCase();if(term.length>2&&!termMap.has(key))termMap.set(key,entry)}}
const entityPattern=new RegExp(`(${[...termMap.keys()].sort((a,b)=>b.length-a.length).map(escapeRegExp).join('|')})`,'gi');

function EntityText({text,current,onOpen}:{text:string;current:string;onOpen:(entry:EncyclopediaEntry)=>void}){
 const chunks=text.split(entityPattern);
 return <>{chunks.map((chunk,index)=>{const target=termMap.get(chunk.toLowerCase());if(!target||target.id===current)return <span key={index}>{chunk}</span>;return <span className="encyclopedia-inline-entity" key={index}><span>{chunk}</span><button type="button" className="encyclopedia-inline-sprite" title={`Open ${target.title}`} aria-label={`Open ${target.title}`} onClick={()=>onOpen(target)}><Sprite name={target.sprite!} size={20}/></button></span>})}</>;
}

function EntryArticle({entry,onOpen,onBack}:{entry:EncyclopediaEntry;onOpen:(entry:EncyclopediaEntry)=>void;onBack:()=>void}){
 const related=relatedEncyclopediaEntries(entry).slice(0,12);
 return <article className="encyclopedia-article">
  <div className="encyclopedia-article-top"><button className="btn quiet compact" onClick={onBack}><ArrowLeft size={17}/>Results</button><span className="encyclopedia-local-badge"><WifiOff size={15}/>Built in</span></div>
  <div className="encyclopedia-title-row">{entry.sprite&&<button className="encyclopedia-hero-sprite" aria-label={`${entry.title} sprite`} title={entry.title}><Sprite name={entry.sprite} size={64}/></button>}<div><p className="eyebrow">{entry.category}</p><h1>{entry.title}</h1></div></div>
  <p className="encyclopedia-summary"><EntityText text={entry.summary} current={entry.id} onOpen={onOpen}/></p>
  {entry.facts.length>0&&<section className="encyclopedia-facts"><h2>Good to know</h2><ul>{entry.facts.map((fact,index)=><li key={index}><EntityText text={fact} current={entry.id} onOpen={onOpen}/></li>)}</ul></section>}
  {related.length>0&&<section className="encyclopedia-related"><h2>Related</h2><div className="encyclopedia-related-grid">{related.map(item=><button key={item.id} className="encyclopedia-result-card compact" onClick={()=>onOpen(item)}>{item.sprite&&<Sprite name={item.sprite} size={34}/>}<span><strong>{item.title}</strong><small>{item.category}</small></span></button>)}</div></section>}
  <section className="encyclopedia-sources"><h2>Sources</h2><p className="small muted">The summary above is stored locally. These links are there for the full source page when you’re online.</p><div className="encyclopedia-source-links">{entry.sources.map((item,index)=><a className="btn compact" key={index} href={item.url} target="_blank" rel="noreferrer">{item.label}<ExternalLink size={15}/></a>)}</div></section>
 </article>;
}

function ResultCard({entry,onOpen}:{entry:EncyclopediaEntry;onOpen:(entry:EncyclopediaEntry)=>void}){return <button className="encyclopedia-result-card" onClick={()=>onOpen(entry)}>{entry.sprite&&<Sprite name={entry.sprite} size={42}/>}<span><strong>{entry.title}</strong><small>{entry.category}</small><em>{entry.summary}</em></span></button>}

function OfflineButton(){
 const[busy,setBusy]=useState(false);const[done,setDone]=useState(false);
 const download=useCallback(async()=>{if(busy)return;setBusy(true);setDone(false);try{
  const spritePaths=distinct(encyclopediaEntries.map(encyclopediaSpritePath).filter((path):path is string=>!!path));
  const spriteData:Record<string,string>={};
  await Promise.all(spritePaths.map(async path=>{try{const response=await fetch(path,{cache:'force-cache'});if(!response.ok)return;const blob=await response.blob();spriteData[path]=await blobToDataUrl(blob)}catch{}}));
  const html=buildOfflineEncyclopediaHtml(spriteData);const blob=new Blob([html],{type:'text/html;charset=utf-8'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='pelican-planner-encyclopedia-offline.html';document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(href),1000);setDone(true);
 }finally{setBusy(false)}} , [busy]);
 return <div className="encyclopedia-offline-action"><button className="btn" disabled={busy} onClick={()=>void download()}><Download size={18}/>{busy?'Building offline copy…':'Save offline copy'}</button><small>{done?'Offline copy saved. It will search and open entries without a network connection.':'Includes the built-in entry index and local sprites.'}</small></div>;
}
function distinct<T>(items:T[]){return [...new Set(items)]}
function blobToDataUrl(blob:Blob){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}

export default function EncyclopediaView(){
 const{render}=useLocale();const[query,setQuery]=useState('');const[submitted,setSubmitted]=useState('');const[category,setCategory]=useState<'All'|EncyclopediaCategory>('All');const[active,setActive]=useState<EncyclopediaEntry|null>(null);
 const results=useMemo(()=>searchEncyclopedia(submitted||query,category),[submitted,query,category]);
 const exactCandidate=useMemo(()=>exactEncyclopediaMatch(submitted||query),[submitted,query]);
 const exact=useMemo(()=>exactCandidate&&results.some(item=>item.id===exactCandidate.id)?exactCandidate:undefined,[exactCandidate,results]);
 const hasSearch=normalizeEncyclopediaQuery(submitted||query).length>0;
 const open=(entry:EncyclopediaEntry)=>{setActive(entry);setSubmitted(entry.title);setQuery(entry.title);window.requestAnimationFrame(()=>document.getElementById('encyclopedia-top')?.scrollIntoView({behavior:'smooth',block:'start'}))};
 const runSearch=()=>{setSubmitted(query.trim());setActive(null)};
 const back=()=>setActive(null);
 const broadMatches=results.filter(item=>item.id!==exact?.id);
 return render(<div className="encyclopedia-shell" id="encyclopedia-top"><section className="paper encyclopedia-search-panel"><div className="encyclopedia-search-heading"><div><p className="eyebrow">Pelican Planner reference</p><h1>Encyclopedia</h1><p>Look up crops, fish, villagers, events, bundles, items, places, and game systems. The useful part is stored here, so you’re not stuck if the Wiki is down.</p></div><OfflineButton/></div><form className="encyclopedia-search-form" onSubmit={e=>{e.preventDefault();runSearch()}}><label className="encyclopedia-search-box"><Search size={21}/><input value={query} onChange={e=>{setQuery(e.target.value);setSubmitted('');setActive(null)}} placeholder="Try Cabbage, sword, Wood, Abigail…" aria-label="Search the Stardew Encyclopedia"/><button className="btn primary" type="submit">Search</button></label><div className="encyclopedia-category-row" role="group" aria-label="Filter encyclopedia category"><button type="button" className={'btn compact '+(category==='All'?'selected':'')} onClick={()=>{setCategory('All');setActive(null)}}>All</button>{encyclopediaCategories.filter(c=>c!=='Overview').map(item=><button type="button" key={item} className={'btn compact '+(category===item?'selected':'')} onClick={()=>{setCategory(item);setActive(null)}}>{item}</button>)}</div></form></section>
 {active?<EntryArticle entry={active} onOpen={open} onBack={back}/>:<section className="paper encyclopedia-results-panel">
  {!hasSearch?<><div className="section-heading ruled"><div><h2>Browse the Valley</h2><p className="small muted">{encyclopediaEntries.length} built-in entries · no live Wiki lookup required</p></div></div><div className="encyclopedia-feature-grid">{['Crops','Fish','Villagers','Festivals','Bundles','Sword','Community Center','Crafting'].map(name=>encyclopediaByTitle.get(name.toLowerCase())).filter((entry):entry is EncyclopediaEntry=>!!entry).map(entry=><ResultCard key={entry.id} entry={entry} onOpen={open}/>)}</div></>:
  results.length===0?<div className="encyclopedia-empty"><Sprite name="Krobus Icon" size={56}/><h2>No built-in match yet</h2><p>Try a shorter or more specific Stardew term. You can still search the Wiki directly when you’re online.</p><a className="btn" href={`https://stardewvalleywiki.com/Special:Search?search=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer">Search Stardew Valley Wiki<ExternalLink size={15}/></a></div>:
  <><div className="section-heading ruled"><div><h2>{results.length===1?'Found it':`${results.length} matches`}</h2><p className="small muted">{results.length>1?'Pick the one you meant. Broad searches refine automatically.':'Open the entry for the local summary and source links.'}</p></div></div>{exact&&results.length>1&&<div className="encyclopedia-overview-hit"><p className="eyebrow">General article</p><ResultCard entry={exact} onOpen={open}/></div>}{results.length>1&&<h3 className="encyclopedia-refine-title">{exact?'Or choose something more specific':'Refine your search'}</h3>}<div className="encyclopedia-results-grid">{(exact&&results.length>1?broadMatches:results).slice(0,60).map(entry=><ResultCard key={entry.id} entry={entry} onOpen={open}/>)}</div>{results.length>60&&<p className="small muted gap-top">Showing the first 60 matches. Add another word to narrow it down.</p>}</>}
 </section>}</div>);
}
