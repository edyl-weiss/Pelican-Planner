'use client';

import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import type {RunState} from '@/lib/game/state';
import {Sprite} from './farm-ui';

type PlannerMode=RunState['plannerMode'];
type Props={open:boolean;onChoose:(mode:PlannerMode)=>void};

const modes:[PlannerMode,string,string,string,string][]=[
 ['simple','Parsnip','Simple Mode','A short daily list with planting tips, fishing reminders, and seasonal things worth catching.','No weather or luck check-ins.'],
 ['full','Quality Sprinkler','Full Mode','Factor in weather, luck, mine progress, unlocks, crop timing, and more.','Best if you like planning a few steps ahead.'],
];

export default function ModeChoiceDialog({open,onChoose}:Props){
 return <Dialog open={open}>
  <DialogContent className="farm-dialog setup-dialog mode-choice-dialog" showCloseButton={false} onEscapeKeyDown={event=>event.preventDefault()} onPointerDownOutside={event=>event.preventDefault()}>
   <div className="setup-hero">
    <Sprite name="Calendar" size={58}/>
    <div><p className="eyebrow">Welcome to Pelican Planner!</p><DialogTitle>How do you want to use the planner?</DialogTitle></div>
   </div>
   <DialogDescription>Keep things light, or give the planner more of your farm details. You can switch anytime.</DialogDescription>
   <div className="mode-choice-grid">
    {modes.map(([mode,sprite,title,description,note])=><button key={mode} className={`mode-choice-card ${mode}`} onClick={()=>onChoose(mode)}>
     <Sprite name={sprite} size={56}/>
     <span><strong>{title}</strong><small>{description}</small><em>{note}</em></span>
    </button>)}
   </div>
   <p className="label-note">Nothing is locked in. You can change modes from the top bar whenever you want.</p>
  </DialogContent>
 </Dialog>;
}
