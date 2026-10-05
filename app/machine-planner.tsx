'use client';
import {useMemo,useState} from 'react';
import type {RunState} from '@/lib/game/state';
import type {UpdateRun} from './farm-journal';
import {MACHINE_RECIPES,machineProductSpriteName,machineReadyAt,machineReadyLabel,timeToStartOffset} from '@/lib/game/machines';
import {absoluteDay,dateLabel} from '@/lib/game/planner';
import {Choice,NumberField,Sprite} from './farm-ui';

const recipeLabel=(machine:string,product:string)=>`${machine} · ${product}`;

export default function MachinePlanner({run,update}:{run:RunState;update:UpdateRun}){
 const recipes=MACHINE_RECIPES;
 const[recipeName,setRecipeName]=useState(recipeLabel(recipes[7].machine,recipes[7].product));
 const[quantity,setQuantity]=useState(1);const[startedTime,setStartedTime]=useState('06:00');const[feedback,setFeedback]=useState('');
 const selected=recipes.find(r=>recipeLabel(r.machine,r.product)===recipeName)??recipes[0];
 const recipeSprite=(label:string)=>machineProductSpriteName((recipes.find(r=>recipeLabel(r.machine,r.product)===label)??selected).product);
 const preview=useMemo(()=>{try{return machineReadyAt(run.date,startedTime,selected.minutes)}catch{return null}},[run.date,startedTime,selected.minutes]);
 const active=run.machineBatches.filter(b=>!b.collected).sort((a,b)=>absoluteDay(machineReadyAt(a.started,a.startedTime,a.processingMinutes).date)-absoluteDay(machineReadyAt(b.started,b.startedTime,b.processingMinutes).date));
 const add=()=>{if(timeToStartOffset(startedTime)===null){setFeedback('Choose a load time from 6:00 AM through 1:50 AM, in 10-minute steps.');return}const batch:RunState['machineBatches'][number]={id:crypto.randomUUID(),machine:selected.machine,product:selected.product,quantity,started:run.date,startedTime,processingMinutes:selected.minutes,collected:false};update({...run,machineBatches:[...run.machineBatches,batch]},`Started ${quantity} ${selected.machine}${quantity===1?'':'s'} making ${selected.product}.`);setFeedback(`Added. Expected collection: ${machineReadyLabel(batch)}.`)};
 return <div className="machine-planner" translate="no">
  <div className="machine-intro"><div><p className="eyebrow">Keep track of the timers</p><h2>Machine planner</h2><p className="muted">Got something brewing? Add a batch when you load your machines! It’ll show up on your daily list when it should be ready, and stay there until you mark it collected.</p></div><div className="machine-count-badge"><strong>{active.length}</strong><span>active batches</span></div></div>
  <div className="machine-layout">
   <section className="paper machine-entry"><h3>Start a batch</h3><div className="machine-form"><Choice label="Recipe" value={recipeName} options={recipes.map(r=>recipeLabel(r.machine,r.product))} onChange={setRecipeName} spriteForOption={recipeSprite}/><NumberField label="How many machines?" value={quantity} min={1} max={9999} onChange={setQuantity}/><label className="field">Loaded at<input type="time" step={600} value={startedTime} onChange={e=>setStartedTime(e.target.value)}/></label></div>
   <div className="machine-ready-preview"><div className="machine-preview-sprites" aria-hidden="true"><Sprite name={selected.machine} size={38}/><span>→</span><Sprite name={machineProductSpriteName(selected.product)} size={38}/></div><div><span className="small muted">Expected collection</span><strong>{preview?`${dateLabel(preview.date)} · ${preview.time}`:'Choose a valid in-game time'}</strong><small>{preview?.overnight?'Finishes while you sleep; ready to collect at 6:00 AM.':'Uses Stardew’s in-game processing clock.'}</small></div></div>
   <button className="btn primary" onClick={add}>Add {quantity} {selected.machine}{quantity===1?'':'s'}</button>{feedback&&<p className="tool-note">{feedback}</p>}
   </section>
   <section className="paper machine-queue"><div className="section-heading"><div><p className="eyebrow">Queue</p><h3>What finishes next</h3></div>{run.machineBatches.some(b=>b.collected)&&<button className="btn quiet compact" onClick={()=>update({...run,machineBatches:run.machineBatches.filter(b=>!b.collected)})}>Clear collected</button>}</div>
   {active.length?active.map(batch=>{const ready=machineReadyAt(batch.started,batch.startedTime,batch.processingMinutes);const readyDay=absoluteDay(ready.date),today=absoluteDay(run.date),due=readyDay<=today;return <article className={`machine-batch ${due?'is-ready':''}`} key={batch.id}><Sprite name={machineProductSpriteName(batch.product)} size={38}/><div><strong className="machine-product-name"><Sprite name={machineProductSpriteName(batch.product)} size={22}/><span>{batch.quantity}× {batch.product}</span></strong><p className="small muted machine-source"><Sprite name={batch.machine} size={18}/><span>{batch.machine} · loaded {dateLabel(batch.started)} at {batch.startedTime}</span></p><p className="machine-due">{readyDay<today?`Overdue · was due ${dateLabel(ready.date)} · ${ready.time}`:readyDay===today?`Due today · ${ready.time}`:`Ready ${dateLabel(ready.date)} · ${ready.time}`}</p></div><div className="machine-actions">{due&&<button className="btn primary compact" onClick={()=>update({...run,machineBatches:run.machineBatches.map(x=>x.id===batch.id?{...x,collected:true}:x)},`Collected ${batch.quantity} ${batch.product}.`)}>Collected</button>}<button className="btn quiet compact" aria-label={`Remove ${batch.product} batch`} onClick={()=>update({...run,machineBatches:run.machineBatches.filter(x=>x.id!==batch.id)})}>Remove</button></div></article>}):<p className="empty-note">Nothing brewing yet! Add your first batch when you load a machine.</p>}
   </section>
  </div>
  <p className="label-note">Machines process differently overnight from 2:00–6:00 AM, so the ready date can change depending on when you load them.</p>
 </div>
}
