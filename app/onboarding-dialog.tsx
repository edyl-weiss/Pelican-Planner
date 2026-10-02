'use client';
import {useState} from 'react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Slider} from '@/components/ui/slider';
import {Check,Choice,NumberField,Sprite} from './farm-ui';
import {useLocale} from './locale-provider';
import {SIMPLE_FARM_SIZES,WEATHER,newRun,type RunState} from '@/lib/game/state';
import {FARM_TYPES,GOALS,LEVELS,SEASONS} from '@/lib/game/data';

type SaveMode='new'|'existing';
type Props={open:boolean;firstRun:boolean;base:RunState;onComplete:(run:RunState)=>void;onSkip:()=>void;onImport:()=>void;};
const UNLOCKS=['Bus','Greenhouse','Minecarts','Community Center','Island'] as const;
const SIMPLE_GOALS=[
 {value:'Balanced',title:'A bit of everything',copy:'Keep the farm moving without turning the day into a checklist.',sprite:'Parsnip'},
 {value:'Community Center',title:'Community Center',copy:'Prioritize seasonal crops, fish and items that can be missed.',sprite:'Bundle Green'},
 {value:'Maximum Profit',title:'Make money',copy:'Favor strong crop choices while still surfacing important seasonal moments.',sprite:'Gold'},
] as const;
const SIMPLE_PACES=[
 {level:1,title:'Relaxed',copy:'Only the most important nudges.'},
 {level:2,title:'Balanced',copy:'A few priorities plus one optional idea.'},
 {level:3,title:'Optimize',copy:'Still simple, but a little more proactive.'},
] as const;

export default function OnboardingDialog(props:Props){return props.base.plannerMode==='simple'?<SimpleSetup {...props}/>:<FullSetup {...props}/>}

function SimpleSetup({open,firstRun,base,onComplete,onSkip,onImport}:Props){
 const {render}=useLocale();
 const[step,setStep]=useState(0);const[saveMode,setSaveMode]=useState<SaveMode>(firstRun?'new':'existing');
 const[draft,setDraft]=useState<RunState>(()=>({...base,plannerMode:'simple',weather:'Unknown',tomorrow:'Unknown',luck:'Unknown',level:Math.min(base.level,3)}));
 const choose=(mode:SaveMode)=>{setSaveMode(mode);const seed=mode==='new'?newRun():base;setDraft({...seed,plannerMode:'simple',simpleFarmSize:base.simpleFarmSize??'Medium',weather:'Unknown',tomorrow:'Unknown',luck:'Unknown',level:Math.min(seed.level,3)});setStep(1)};
 const finish=()=>onComplete({...draft,name:draft.name.trim()||'My Farm',plannerMode:'simple',weather:'Unknown',tomorrow:'Unknown',luck:'Unknown'});
 return render(<Dialog open={open}><DialogContent className="farm-dialog setup-dialog simple-setup-dialog" showCloseButton={false} onEscapeKeyDown={e=>e.preventDefault()} onPointerDownOutside={e=>e.preventDefault()}>
  {step===0?<>
   <div className="setup-hero"><Sprite name="Parsnip" size={58}/><div><p className="eyebrow">Simple Mode</p><DialogTitle>Just enough to get started</DialogTitle></div></div>
   <DialogDescription>You only need to tell Pelican Planner where you are and what kind of help you want. The rest can wait until it matters.</DialogDescription>
   <div className="setup-choice-grid"><button className="setup-choice" onClick={()=>choose('new')}><Sprite name="Parsnip" size={48}/><span><strong>New save</strong><small>Start on Spring 1, Year 1</small></span></button><button className="setup-choice" onClick={()=>choose('existing')}><Sprite name="Calendar" size={48}/><span><strong>I’m already playing</strong><small>Set your current season and day</small></span></button></div>
   <div className="setup-import"><span className="small muted">Want the planner to read your progress automatically?</span><button className="btn" onClick={onImport}>Import Stardew save</button></div>
   {!firstRun&&<button className="btn quiet compact setup-later" onClick={onSkip}>Close setup</button>}
  </>:<>
   <div className="setup-topline"><div><p className="eyebrow">Simple setup · Step {step} of 2</p><DialogTitle>{step===1?'Where are you in the game?':'What kind of help sounds good?'}</DialogTitle></div><Sprite name={step===1?'Calendar':'Parsnip'} size={52}/></div>
   <div className="setup-steps simple-steps" aria-label={`Step ${step} of 2`}><span className="active"/><span className={step>=2?'active':''}/></div>
   {step===1&&<>
    <DialogDescription>{saveMode==='new'?'Your calendar starts at Spring 1. Give the farm a name and you’re nearly done.':'Match the planner to your current day. That is enough for seasonal recommendations.'}</DialogDescription>
    <div className="form-grid setup-fields"><label className="field">Farm name<input value={draft.name} maxLength={60} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>{saveMode==='existing'&&<><Choice label="Season" value={draft.date.season} options={SEASONS} onChange={season=>setDraft({...draft,date:{...draft.date,season:season as RunState['date']['season']}})}/><NumberField label="Day" value={draft.date.day} min={1} max={28} onChange={day=>setDraft({...draft,date:{...draft.date,day}})}/><NumberField label="Year" value={draft.date.year} min={1} max={999} onChange={year=>setDraft({...draft,date:{...draft.date,year}})}/></>}</div>
    {saveMode==='new'&&<div className="setup-date-card"><Sprite name="Calendar" size={34}/><div><strong>Spring 1 · Year 1</strong><span className="small muted">Pelican Planner will move forward with you one day at a time.</span></div></div>}
   </>}
   {step===2&&<>
    <DialogDescription>These 3 choices shape the recommendations. You can change them whenever you like.</DialogDescription>
    <div className="simple-choice-section"><h3>What matters most?</h3><div className="simple-option-grid">{SIMPLE_GOALS.map(option=><button key={option.value} className={'simple-option '+(draft.goal===option.value?'chosen':'')} onClick={()=>setDraft({...draft,goal:option.value})}><Sprite name={option.sprite} size={38}/><span><strong>{option.title}</strong><small>{option.copy}</small></span></button>)}</div></div>
    <div className="simple-choice-section"><h3>How much guidance?</h3><div className="simple-option-grid three">{SIMPLE_PACES.map(option=><button key={option.level} className={'simple-option '+(draft.level===option.level?'chosen':'')} onClick={()=>setDraft({...draft,level:option.level})}><span><strong>{option.title}</strong><small>{option.copy}</small></span></button>)}</div></div>
    <div className="simple-choice-section"><h3>How much do you usually plant?</h3><div className="simple-option-grid three">{SIMPLE_FARM_SIZES.map(size=><button key={size} className={'simple-option centered '+(draft.simpleFarmSize===size?'chosen':'')} onClick={()=>setDraft({...draft,simpleFarmSize:size})}><strong>{size}</strong><small>{size==='Small'?'About 12 crop tiles':size==='Medium'?'About 24 crop tiles':'About 48+ crop tiles'}</small></button>)}</div><p className="label-note">This is only a recommendation scale, not a hard field limit.</p></div>
   </>}
   <div className="setup-actions"><button className="btn" onClick={()=>step===1?setStep(0):setStep(1)}>{step===1?'Back':'Back'}</button><span className="small muted">Simple Mode never requires daily luck or weather.</span>{step===1?<button className="btn primary" disabled={!draft.name.trim()} onClick={()=>setStep(2)}>Continue</button>:<button className="btn primary" disabled={!draft.name.trim()} onClick={finish}>Start planning</button>}</div>
  </>}
 </DialogContent></Dialog>);
}

function FullSetup({open,firstRun,base,onComplete,onSkip,onImport}:Props){
 const {render,locale}=useLocale();
 const[step,setStep]=useState(0);const[mode,setMode]=useState<SaveMode>(firstRun?'new':'existing');const[draft,setDraft]=useState<RunState>(()=>({...base,plannerMode:'full'}));
 const choose=(next:SaveMode)=>{if(next==='existing'){onImport();return;}setMode(next);setDraft({...newRun(),plannerMode:'full'});setStep(1)};
 const setUnlock=(name:string,checked:boolean)=>setDraft(current=>({...current,unlocks:checked?[...new Set([...current.unlocks,name])]:current.unlocks.filter(item=>item!==name)}));
 const finish=()=>onComplete({...draft,name:draft.name.trim()||'My Farm',plannerMode:'full'});const progressStep=Math.max(1,step);
 return render(<Dialog open={open}><DialogContent className="farm-dialog setup-dialog" showCloseButton={false} onEscapeKeyDown={e=>e.preventDefault()} onPointerDownOutside={e=>e.preventDefault()}>
  {step===0?<><div className="setup-hero"><Sprite name="Quality Sprinkler" size={58}/><div><p className="eyebrow">Full Mode</p><DialogTitle>Let’s set up your calendar</DialogTitle></div></div><DialogDescription>Full Mode uses more of your save state for detailed recommendations. You can switch to Simple Mode anytime.</DialogDescription><div className="setup-choice-grid"><button className="setup-choice" onClick={()=>choose('new')}><Sprite name="Parsnip" size={48}/><span><strong>Start from a new save</strong><small>Spring 1, Year 1 · 500g · fresh progress</small></span></button><button className="setup-choice" onClick={()=>choose('existing')}><Sprite name="Calendar" size={48}/><span><strong>Continue an existing save</strong><small>Import your game save and growing crops</small></span></button></div><div className="setup-import"><span className="small muted">Already have your Stardew save file?</span><button className="btn" onClick={onImport}>Import save instead</button></div><button className="btn quiet compact setup-later" onClick={onSkip}>Use the current farm for now</button></>:<>
   <div className="setup-topline"><div><p className="eyebrow" translate="no">{locale==='zh-CN'?`设置 · 第 ${progressStep} 步，共 3 步`:`Full setup · Step ${progressStep} of 3`}</p><DialogTitle>{step===1?'Your farm & calendar':step===2?'How do you like to play?':'Add your current progress'}</DialogTitle></div><Sprite name={step===1?'Calendar':step===2?'Parsnip':'Pickaxe'} size={52}/></div>
   <div className="setup-steps" aria-label={`Step ${progressStep} of 3`}><span className={step>=1?'active':''}/><span className={step>=2?'active':''}/><span className={step>=3?'active':''}/></div>
   {step===1&&<><DialogDescription>{mode==='new'?'We’ll start on Spring 1, Year 1. Add a name and farm type so the journal feels like yours.':'Match the journal to the date your current save is on.'}</DialogDescription><div className="form-grid setup-fields"><label className="field">Farm name<input value={draft.name} maxLength={60} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><Choice label="Farm type" value={draft.farm} options={FARM_TYPES} onChange={farm=>setDraft({...draft,farm:farm as RunState['farm']})}/>{mode==='existing'&&<><Choice label="Season" value={draft.date.season} options={SEASONS} onChange={season=>setDraft({...draft,date:{...draft.date,season:season as RunState['date']['season']}})}/><NumberField label="Day" value={draft.date.day} min={1} max={28} onChange={day=>setDraft({...draft,date:{...draft.date,day}})}/><NumberField label="Year" value={draft.date.year} min={1} max={999} onChange={year=>setDraft({...draft,date:{...draft.date,year}})}/></>}<NumberField label={mode==='new'?'Starting gold':'Current gold'} value={draft.gold} onChange={gold=>setDraft({...draft,gold})}/></div>{mode==='new'&&<div className="setup-date-card"><Sprite name="Calendar" size={34}/><div><strong>Spring 1 · Year 1</strong><span className="small muted">You can advance the journal one day at a time from here.</span></div></div>}</>}
   {step===2&&<><DialogDescription>These choices shape how busy the daily plan feels and which kinds of goals it prioritizes.</DialogDescription><div className="form-grid setup-fields"><Choice label="Experience" value={draft.experience} options={['First playthrough','Familiar','Experienced']} onChange={experience=>setDraft({...draft,experience:experience as RunState['experience']})}/><Choice label="Primary goal" value={draft.goal} options={GOALS} onChange={goal=>setDraft({...draft,goal:goal as RunState['goal']})}/><Choice label="Spoiler detail" value={draft.spoilers} options={['Minimal','Normal','Full']} onChange={spoilers=>setDraft({...draft,spoilers:spoilers as RunState['spoilers']})}/></div><div className="setup-slider"><label id="setup-pace-label" className="field">Planning intensity: {LEVELS[draft.level-1]}</label><Slider className="slider" aria-labelledby="setup-pace-label" min={1} max={5} step={1} value={[draft.level]} onValueChange={([level])=>setDraft({...draft,level})}/><p className="small muted">Lower settings keep the day loose. Higher settings surface more eligible tasks and opportunities.</p></div><div className="setup-checks"><Check label="Don’t recommend fishing" checked={draft.noFishing} onChange={noFishing=>setDraft({...draft,noFishing})}/><Check label="Include festivals in my daily plan" checked={draft.festivals} onChange={festivals=>setDraft({...draft,festivals})}/></div></>}
   {step===3&&<><DialogDescription>{mode==='new'?'These can stay at their defaults for a fresh save. Fill them in only if your run starts with custom progress.':'Optional, but adding these now makes recommendations more accurate immediately.'}</DialogDescription><div className="form-grid setup-fields"><NumberField label="Farming level" value={draft.farming} max={10} onChange={farming=>setDraft({...draft,farming})}/><NumberField label="Mine floor" value={draft.mineFloor} max={120} onChange={mineFloor=>setDraft({...draft,mineFloor})}/><NumberField label="Always keep this much gold unspent" value={draft.reserve} onChange={reserve=>setDraft({...draft,reserve})}/><Choice label="Weather today" value={draft.weather} options={WEATHER} onChange={weather=>setDraft({...draft,weather:weather as RunState['weather']})}/><Choice label="TV forecast: tomorrow" value={draft.tomorrow} options={WEATHER} onChange={tomorrow=>setDraft({...draft,tomorrow:tomorrow as RunState['tomorrow']})}/></div><div className="setup-progress-block"><h3>Unlocked in my game</h3><div className="setup-unlocks">{UNLOCKS.map(name=><Check key={name} label={name} checked={draft.unlocks.includes(name)} onChange={checked=>setUnlock(name,checked)}/>)}</div></div><div className="setup-progress-block"><h3>Professions</h3><div className="setup-unlocks"><Check label="Tiller: +10% crop sale prices" checked={draft.tiller} onChange={tiller=>setDraft({...draft,tiller})}/><Check label="Artisan: +40% artisan sale prices" checked={draft.artisan} onChange={artisan=>setDraft({...draft,artisan})}/></div></div></>}
   <div className="setup-actions"><button className="btn" onClick={()=>{if(step===1&&!firstRun)onSkip();else setStep(step-1)}}>{step===1?(firstRun?'Change save type':'Close guide'):'Back'}</button><span className="small muted">You can edit all of this later in More.</span>{step<3?<button className="btn primary" disabled={!draft.name.trim()} onClick={()=>setStep(step+1)}>Continue</button>:<button className="btn primary" disabled={!draft.name.trim()} onClick={finish}>Start planning</button>}</div>
  </>}
 </DialogContent></Dialog>);
}
