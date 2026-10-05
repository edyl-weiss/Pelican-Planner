'use client';
import {memo,useCallback,useDeferredValue,useMemo,useState} from 'react';
import {Download,Search,WifiOff,ExternalLink,ArrowLeft} from 'lucide-react';
import {useLocale} from './locale-provider';
import {Sprite} from './farm-ui';
import {encyclopediaCategories,encyclopediaEntries,encyclopediaByTitle,exactEncyclopediaMatch,findEncyclopediaInlineMatches,normalizeEncyclopediaQuery,relatedEncyclopediaEntries,searchEncyclopedia,type EncyclopediaCategory,type EncyclopediaEntry} from '@/lib/game/encyclopedia';
import {buildOfflineEncyclopediaHtml} from '@/lib/game/encyclopedia-offline';
import assets from '@/lib/game/assets-source.json';
import {giftSpriteName,giftTasteLabels,universalGiftTastes,villagerProfiles,type GiftTaste,type VillagerProfile} from '@/lib/game/villager-profiles';
import {villagerHeartEvents,type VillagerHeartEvent} from '@/lib/game/villager-heart-events';

const assetRegistry=assets as Record<string,{local_path:string}>;
const availableSprites=new Set(Object.keys(assetRegistry));
const spritePath=(name?:string)=>name?(assetRegistry[name]??assetRegistry[name+' Icon'])?.local_path:null;
const giftTastes:GiftTaste[]=['loves','likes','neutrals','dislikes','hates'];
const browseCategories=encyclopediaCategories.filter(category=>category!=='Overview');
const browseAll=encyclopediaEntries.filter(entry=>entry.category!=='Overview').sort((a,b)=>a.title.localeCompare(b.title));
const browseByCategory=new Map<EncyclopediaCategory,EncyclopediaEntry[]>(browseCategories.map(category=>[category,browseAll.filter(entry=>entry.category===category)]));
function EntityText({text,current,onOpen}:{text:string;current:string;onOpen:(entry:EncyclopediaEntry)=>void}){
 const matches=findEncyclopediaInlineMatches(text);
 if(!matches.length)return <>{text}</>;
 const nodes=[];let cursor=0;
 for(const [index,match] of matches.entries()){
  if(match.start>cursor)nodes.push(<span key={`text-${index}`}>{text.slice(cursor,match.start)}</span>);
  if(match.entry.id===current)nodes.push(<span key={`self-${index}`}>{match.text}</span>);
  else nodes.push(<span className="encyclopedia-inline-entity" key={`entity-${index}`}><span>{match.text}</span><button type="button" className="encyclopedia-inline-sprite" title={`Open ${match.entry.title}`} aria-label={`Open ${match.entry.title}`} onClick={()=>onOpen(match.entry)}><Sprite name={match.entry.sprite!} size={20}/></button></span>);
  cursor=match.end;
 }
 if(cursor<text.length)nodes.push(<span key="text-tail">{text.slice(cursor)}</span>);
 return <>{nodes}</>;
}

function GiftChip({name,onOpen}:{name:string;onOpen:(entry:EncyclopediaEntry)=>void}){
 const sprite=giftSpriteName(name,availableSprites);
 const direct=encyclopediaByTitle.get(name.toLowerCase());
 const clean=name.replace(/^All /,'').replace(/ \(.+\)$/,'').trim();
 const target=direct??encyclopediaByTitle.get(clean.toLowerCase());
 const body=<><Sprite name={sprite} size={32}/><span>{name}</span></>;
 return target?<button type="button" className="villager-gift-chip is-link" onClick={()=>onOpen(target)} title={`Open ${target.title}`}>{body}</button>:<span className="villager-gift-chip">{body}</span>;
}

function GiftTasteBlock({taste,items,onOpen,universal=false}:{taste:GiftTaste;items:string[];onOpen:(entry:EncyclopediaEntry)=>void;universal?:boolean}){
 const meta=giftTasteLabels[taste];
 return <section className={`villager-gift-group taste-${taste}`}><div className="villager-gift-heading"><div><h4>{universal?'Universal ':''}{meta.label}</h4><span>{meta.points}{universal?' · unless this villager overrides it':''}</span></div><strong>{items.length}</strong></div>{items.length?<div className="villager-gift-grid">{items.map((name,index)=><GiftChip key={`${taste}-${name}-${index}`} name={name} onOpen={onOpen}/>)}</div>:<p className="small muted villager-no-overrides">No personal overrides in this tier. Universal gift rules still apply.</p>}</section>;
}


function HeartEventGuide({events}:{events:VillagerHeartEvent[]}){
 if(!events.length)return null;
 return <section className="villager-heart-guide"><div className="villager-heart-heading"><div><h3>Heart events</h3><p className="small muted">A compact local preview of friendship milestones. Exact trigger conditions can depend on place, time, weather, or progression.</p></div><strong>{events.length}</strong></div><div className="villager-heart-grid">{events.map((event,index)=><div className="villager-heart-card" key={`${event.heart}-${index}`}><span>{event.heart===0?'Early':`${event.heart} ♥`}</span><p>{event.description}</p></div>)}</div></section>;
}

function VillagerProfileSection({entry,profile,onOpen}:{entry:EncyclopediaEntry;profile:VillagerProfile;onOpen:(entry:EncyclopediaEntry)=>void}){
 const relationship=profile.roommate?'Can become your roommate':profile.marriageable?'Marriage candidate':'Friendship character';
 const heartEvents=villagerHeartEvents[entry.title]??[];
 return <section className="villager-profile" aria-label={`${entry.title} friendship guide`}>
  <div className="villager-profile-heading"><div><p className="eyebrow">Local friendship guide</p><h2>Gifts & key details</h2></div><span className="encyclopedia-local-badge"><WifiOff size={14}/>Works offline</span></div>
  <div className="villager-quick-grid">
   <div className="villager-quick-card"><span>Birthday</span><strong>{profile.birthday.season} {profile.birthday.day}</strong><small>Birthday gifts are ×8 friendship, and you can still give one after the normal two gifts that week.</small></div>
   <div className="villager-quick-card"><span>Home</span><strong>{profile.address}</strong><small>{profile.occupation}</small></div>
   <div className="villager-quick-card"><span>Relationship</span><strong>{relationship}</strong><small>{profile.availability??'Available through normal Valley progression.'}</small></div>
  </div>
  <div className="villager-friendship-tip"><strong>Gift timing:</strong> Loved +80 · Liked +45 · Neutral +20 · Disliked −20 · Hated −40. Birthday gifts are ×8; a Feast of the Winter Star secret-friend gift is ×5. Normally you can give two gifts per villager each week, with a birthday gift allowed on top of that. Character-specific tastes below take priority over universal rules.</div>
  <div className="villager-gift-guide"><h3>{entry.title}’s personal tastes</h3><p className="small muted">Every personal exception stored in Pelican Planner is shown here. Item art is bundled locally, and gift cards with a matching Encyclopedia entry are clickable. Rules that cover an entire item family use a representative category sprite.</p>{giftTastes.map(taste=><GiftTasteBlock key={taste} taste={taste} items={profile[taste]} onOpen={onOpen}/>)}</div>
  <details className="villager-universal-rules"><summary>Show universal gift defaults</summary><p className="small muted">These apply to villagers unless a personal preference above overrides them. Group entries such as “All Fish” are kept grouped so the guide stays readable.</p>{giftTastes.map(taste=><GiftTasteBlock key={`universal-${taste}`} taste={taste} items={universalGiftTastes[taste]} onOpen={onOpen} universal/>)}</details>
  <HeartEventGuide events={heartEvents}/>
 </section>;
}

function EntryArticle({entry,onOpen,onBack}:{entry:EncyclopediaEntry;onOpen:(entry:EncyclopediaEntry)=>void;onBack:()=>void}){
 const related=relatedEncyclopediaEntries(entry).slice(0,12);
 return <article className="encyclopedia-article">
  <div className="encyclopedia-article-top"><button className="btn quiet compact" onClick={onBack}><ArrowLeft size={17}/>Results</button><span className="encyclopedia-local-badge"><WifiOff size={15}/>Built in</span></div>
  <div className="encyclopedia-title-row">{entry.sprite&&<button className="encyclopedia-hero-sprite" aria-label={`${entry.title} sprite`} title={entry.title}><Sprite name={entry.sprite} size={64}/></button>}<div><p className="eyebrow">{entry.category}</p><h1>{entry.title}</h1></div></div>
  <p className="encyclopedia-summary"><EntityText text={entry.summary} current={entry.id} onOpen={onOpen}/></p>
  {entry.facts.length>0&&<section className="encyclopedia-facts"><h2>Good to know</h2><ul>{entry.facts.map((fact,index)=><li key={index}><EntityText text={fact} current={entry.id} onOpen={onOpen}/></li>)}</ul></section>}
  {entry.category==='Villagers'&&villagerProfiles[entry.title]&&<VillagerProfileSection entry={entry} profile={villagerProfiles[entry.title]} onOpen={onOpen}/>}
  {related.length>0&&<section className="encyclopedia-related"><h2>Related</h2><div className="encyclopedia-related-grid">{related.map(item=><button key={item.id} className="encyclopedia-result-card compact" onClick={()=>onOpen(item)}>{item.sprite&&<Sprite name={item.sprite} size={34}/>}<span><strong>{item.title}</strong><small>{item.category}</small></span></button>)}</div></section>}
  <section className="encyclopedia-sources"><h2>Sources</h2><p className="small muted">The summary above is stored locally. These links are there for the full source page when you’re online.</p><div className="encyclopedia-source-links">{entry.sources.map((item,index)=><a className="btn compact" key={index} href={item.url} target="_blank" rel="noreferrer">{item.label}<ExternalLink size={15}/></a>)}</div></section>
 </article>;
}

const ResultCard=memo(function ResultCard({entry,onOpen}:{entry:EncyclopediaEntry;onOpen:(entry:EncyclopediaEntry)=>void}){return <button className="encyclopedia-result-card" onClick={()=>onOpen(entry)}>{entry.sprite&&<Sprite name={entry.sprite} size={42}/>}<span><strong>{entry.title}</strong><small>{entry.category}</small><em>{entry.summary}</em></span></button>});

const BrowseCard=memo(function BrowseCard({entry,onOpen}:{entry:EncyclopediaEntry;onOpen:(entry:EncyclopediaEntry)=>void}){const path=spritePath(entry.sprite);return <button type="button" className="encyclopedia-browse-card" onClick={()=>onOpen(entry)} title={`Open ${entry.title}`} aria-label={`Open ${entry.title} encyclopedia page`}><span className="encyclopedia-browse-sprite" aria-hidden="true">{path?<img className="sprite" src={path} alt="" width={48} height={48} loading="lazy" decoding="async"/>:<span className="encyclopedia-browse-placeholder">?</span>}</span><strong>{entry.title}</strong></button>});

function OfflineButton(){
 const[busy,setBusy]=useState(false);const[done,setDone]=useState(false);
 const download=useCallback(async()=>{if(busy)return;setBusy(true);setDone(false);try{
  const spritePaths=distinct(Object.values(assets as Record<string,{local_path:string}>).map(record=>record.local_path));
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
 const searchTerm=submitted||query;
 const deferredSearchTerm=useDeferredValue(searchTerm);
 const results=useMemo(()=>searchEncyclopedia(deferredSearchTerm,category),[deferredSearchTerm,category]);
 const exact=useMemo(()=>{const candidate=exactEncyclopediaMatch(deferredSearchTerm);return candidate&&results.some(item=>item.id===candidate.id)?candidate:undefined},[deferredSearchTerm,results]);
 const hasSearch=normalizeEncyclopediaQuery(searchTerm).length>0;
 const browseEntries=category==='All'?browseAll:browseByCategory.get(category)??[];
 const open=useCallback((entry:EncyclopediaEntry)=>{setActive(entry);setSubmitted(entry.title);setQuery(entry.title);window.requestAnimationFrame(()=>document.getElementById('encyclopedia-top')?.scrollIntoView({behavior:'smooth',block:'start'}))},[]);
 const runSearch=useCallback(()=>{setSubmitted(query.trim());setActive(null)},[query]);
 const chooseCategory=useCallback((next:'All'|EncyclopediaCategory)=>{setCategory(next);setActive(null);setQuery('');setSubmitted('');window.requestAnimationFrame(()=>document.getElementById('encyclopedia-browser')?.scrollIntoView({behavior:'smooth',block:'nearest'}))},[]);
 const back=useCallback(()=>setActive(null),[]);
 const broadMatches=useMemo(()=>results.filter(item=>item.id!==exact?.id),[results,exact]);
 return render(<div className="encyclopedia-shell" id="encyclopedia-top"><section className="paper encyclopedia-search-panel"><div className="encyclopedia-search-heading"><div><p className="eyebrow">Pelican Planner reference</p><h1>Encyclopedia</h1><p>Look up crops, fish, villagers, events, bundles, items, places, and game systems. The useful part is stored here, so you’re not stuck if the Wiki is down.</p></div><OfflineButton/></div><form className="encyclopedia-search-form" onSubmit={e=>{e.preventDefault();runSearch()}}><label className="encyclopedia-search-box"><Search size={21}/><input value={query} onChange={e=>{setQuery(e.target.value);setSubmitted('');setActive(null)}} placeholder="Try Cabbage, sword, Wood, Abigail…" aria-label="Search the Stardew Encyclopedia"/><button className="btn primary" type="submit">Search</button></label><div className="encyclopedia-category-row" role="group" aria-label="Filter encyclopedia category"><button type="button" className={'btn compact '+(category==='All'?'selected':'')} onClick={()=>chooseCategory('All')}>All</button>{browseCategories.map(item=><button type="button" key={item} className={'btn compact '+(category===item?'selected':'')} onClick={()=>chooseCategory(item)}>{item}</button>)}</div></form></section>
 {active?<EntryArticle entry={active} onOpen={open} onBack={back}/>:<section className="paper encyclopedia-results-panel">
  {!hasSearch?<><div className="section-heading ruled" id="encyclopedia-browser"><div><h2>{category==='All'?'Browse the Valley':category}</h2><p className="small muted">{browseEntries.length} {category==='All'?'entries across the local encyclopedia':`${category.toLowerCase()} entries`} · click any sprite card to open its page</p></div></div><div className="encyclopedia-browse-grid encyclopedia-category-expand" key={category}>{browseEntries.map(entry=><BrowseCard key={entry.id} entry={entry} onOpen={open}/>)}</div></>:
  results.length===0?<div className="encyclopedia-empty"><Sprite name="Krobus Icon" size={56}/><h2>No built-in match yet</h2><p>Try a shorter or more specific Stardew term. You can still search the Wiki directly when you’re online.</p><a className="btn" href={`https://stardewvalleywiki.com/Special:Search?search=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer">Search Stardew Valley Wiki<ExternalLink size={15}/></a></div>:
  <><div className="section-heading ruled"><div><h2>{results.length===1?'Found it':`${results.length} matches`}</h2><p className="small muted">{results.length>1?'Pick the one you meant. Broad searches refine automatically.':'Open the entry for the local summary and source links.'}</p></div></div>{exact&&results.length>1&&<div className="encyclopedia-overview-hit"><p className="eyebrow">General article</p><ResultCard entry={exact} onOpen={open}/></div>}{results.length>1&&<h3 className="encyclopedia-refine-title">{exact?'Or choose something more specific':'Refine your search'}</h3>}<div className="encyclopedia-results-grid">{(exact&&results.length>1?broadMatches:results).slice(0,60).map(entry=><ResultCard key={entry.id} entry={entry} onOpen={open}/>)}</div>{results.length>60&&<p className="small muted gap-top">Showing the first 60 matches. Add another word to narrow it down.</p>}</>}
 </section>}</div>);
}
