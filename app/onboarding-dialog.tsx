'use client';
import {useState} from 'react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Slider} from '@/components/ui/slider';
import {Check,Choice,NumberField,Sprite} from './farm-ui';
import {useLocale} from './locale-provider';
import {newRun,type RunState} from '@/lib/game/state';
import {FARM_TYPES,GOALS,LEVELS,SEASONS} from '@/lib/game/data';

type SaveMode='new'|'existing';

type Props={
 open:boolean;
 firstRun:boolean;
 base:RunState;
 onComplete:(run:RunState)=>void;
 onSkip:()=>void;
 onImport:()=>void;
};

const UNLOCKS=['Bus','Greenhouse','Minecarts','Community Center','Island'] as const;

export default function OnboardingDialog({open,firstRun,base,onComplete,onSkip,onImport}:Props){
 const {render,locale}=useLocale();
 const[step,setStep]=useState(0);
 const[mode,setMode]=useState<SaveMode>(firstRun?'new':'existing');
 const[draft,setDraft]=useState<RunState>(firstRun?newRun():base);

 const choose=(next:SaveMode)=>{
  if(next==='existing'){onImport();return;}
  setMode(next);
  setDraft(next==='new'?newRun():base);
  setStep(1);
 };
 const setUnlock=(name:string,checked:boolean)=>setDraft(current=>({...current,unlocks:checked?[...new Set([...current.unlocks,name])]:current.unlocks.filter(item=>item!==name)}));
 const finish=()=>onComplete({...draft,name:draft.name.trim()||'My Farm'});
 const progressStep=Math.max(1,step);

 return render(<Dialog open={open}><DialogContent className="farm-dialog setup-dialog" showCloseButton={false} onEscapeKeyDown={e=>e.preventDefault()} onPointerDownOutside={e=>e.preventDefault()}>
  {step===0?<>
   <div className="setup-hero"><Sprite name="Parsnip" size={58}/><div><p className="eyebrow">Welcome to your farm journal</p><DialogTitle>Let’s set up your calendar</DialogTitle></div></div>
   <DialogDescription>Tell the journal where you are in your save. It only takes a moment, and you can change everything later in More.</DialogDescription>
   <div className="setup-choice-grid">
    <button className="setup-choice" onClick={()=>choose('new')}><Sprite name="Parsnip" size={48}/><span><strong>Start from a new save</strong><small>Spring 1, Year 1 · 500g · fresh progress</small></span></button>
    <button className="setup-choice" onClick={()=>choose('existing')}><Sprite name="Calendar" size={48}/><span><strong>Continue an existing save</strong><small>Import your game save and growing crops</small></span></button>
   </div>
   <div className="setup-import"><span className="small muted">Already have your Stardew save file?</span><button className="btn" onClick={onImport}>Import save instead</button></div>
   <button className="btn quiet compact setup-later" onClick={onSkip}>Use the default farm for now</button>
  </>:<>
   <div className="setup-topline"><div><p className="eyebrow" translate="no">{locale==='zh-CN'?`设置 · 第 ${progressStep} 步，共 3 步`:`Setup · Step ${progressStep} of 3`}</p><DialogTitle>{step===1?'Your farm & calendar':step===2?'How do you like to play?':'Add your current progress'}</DialogTitle></div><Sprite name={step===1?'Calendar':step===2?'Parsnip':'Pickaxe'} size={52}/></div>
   <div className="setup-steps" aria-label={`Step ${progressStep} of 3`}><span className={step>=1?'active':''}/><span className={step>=2?'active':''}/><span className={step>=3?'active':''}/></div>
   {step===1&&<>
    <DialogDescription>{mode==='new'?'We’ll start on Spring 1, Year 1. Add a name and farm type so the journal feels like yours.':'Match the journal to the date your current save is on.'}</DialogDescription>
    <div className="form-grid setup-fields"><label className="field">Farm name<input value={draft.name} maxLength={60} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><Choice label="Farm type" value={draft.farm} options={FARM_TYPES} onChange={farm=>setDraft({...draft,farm:farm as RunState['farm']})}/>{mode==='existing'&&<><Choice label="Season" value={draft.date.season} options={SEASONS} onChange={season=>setDraft({...draft,date:{...draft.date,season:season as RunState['date']['season']}})}/><NumberField label="Day" value={draft.date.day} min={1} max={28} onChange={day=>setDraft({...draft,date:{...draft.date,day}})}/><NumberField label="Year" value={draft.date.year} min={1} max={999} onChange={year=>setDraft({...draft,date:{...draft.date,year}})}/></>}<NumberField label={mode==='new'?'Starting gold':'Current gold'} value={draft.gold} onChange={gold=>setDraft({...draft,gold})}/></div>
    {mode==='new'&&<div className="setup-date-card"><Sprite name="Calendar" size={34}/><div><strong>Spring 1 · Year 1</strong><span className="small muted">You can advance the journal one day at a time from here.</span></div></div>}
   </>}
   {step===2&&<>
    <DialogDescription>These choices shape how busy the daily plan feels and which kinds of goals it prioritizes.</DialogDescription>
    <div className="form-grid setup-fields"><Choice label="Experience" value={draft.experience} options={['First playthrough','Familiar','Experienced']} onChange={experience=>setDraft({...draft,experience:experience as RunState['experience']})}/><Choice label="Primary goal" value={draft.goal} options={GOALS} onChange={goal=>setDraft({...draft,goal:goal as RunState['goal']})}/><Choice label="Spoiler detail" value={draft.spoilers} options={['Minimal','Normal','Full']} onChange={spoilers=>setDraft({...draft,spoilers:spoilers as RunState['spoilers']})}/></div>
    <div className="setup-slider"><label id="setup-pace-label" className="field">Planning intensity: {LEVELS[draft.level-1]}</label><Slider className="slider" aria-labelledby="setup-pace-label" min={1} max={5} step={1} value={[draft.level]} onValueChange={([level])=>setDraft({...draft,level})}/><p className="small muted">Lower settings keep the day loose. Higher settings surface more eligible tasks and opportunities.</p></div>
    <div className="setup-checks"><Check label="Don’t recommend fishing" checked={draft.noFishing} onChange={noFishing=>setDraft({...draft,noFishing})}/><Check label="Include festivals in my daily plan" checked={draft.festivals} onChange={festivals=>setDraft({...draft,festivals})}/></div>
   </>}
   {step===3&&<>
    <DialogDescription>{mode==='new'?'These can stay at their defaults for a fresh save. Fill them in only if your run starts with custom progress.':'Optional, but adding these now makes recommendations more accurate immediately.'}</DialogDescription>
    <div className="form-grid setup-fields"><NumberField label="Farming level" value={draft.farming} max={10} onChange={farming=>setDraft({...draft,farming})}/><NumberField label="Mine floor" value={draft.mineFloor} max={120} onChange={mineFloor=>setDraft({...draft,mineFloor})}/><NumberField label="Always keep this much gold unspent" value={draft.reserve} onChange={reserve=>setDraft({...draft,reserve})}/><Choice label="Weather today" value={draft.weather} options={['Unknown','Sunny','Rain','Storm','Snow']} onChange={weather=>setDraft({...draft,weather:weather as RunState['weather']})}/><Choice label="TV forecast: tomorrow" value={draft.tomorrow} options={['Unknown','Sunny','Rain','Storm','Snow']} onChange={tomorrow=>setDraft({...draft,tomorrow:tomorrow as RunState['tomorrow']})}/></div>
    <div className="setup-progress-block"><h3>Unlocked in my game</h3><div className="setup-unlocks">{UNLOCKS.map(name=><Check key={name} label={name} checked={draft.unlocks.includes(name)} onChange={checked=>setUnlock(name,checked)}/>)}</div></div>
    <div className="setup-progress-block"><h3>Professions</h3><div className="setup-unlocks"><Check label="Tiller: +10% crop sale prices" checked={draft.tiller} onChange={tiller=>setDraft({...draft,tiller})}/><Check label="Artisan: +40% artisan sale prices" checked={draft.artisan} onChange={artisan=>setDraft({...draft,artisan})}/></div></div>
   </>}
   <div className="setup-actions"><button className="btn" onClick={()=>{if(step===1&&!firstRun)onSkip();else setStep(step-1)}}>{step===1?(firstRun?'Change save type':'Close guide'):'Back'}</button><span className="small muted">You can edit all of this later in More.</span>{step<3?<button className="btn primary" disabled={!draft.name.trim()} onClick={()=>setStep(step+1)}>Continue</button>:<button className="btn primary" disabled={!draft.name.trim()} onClick={finish}>Start planning</button>}</div>
  </>}
 </DialogContent></Dialog>);
}
