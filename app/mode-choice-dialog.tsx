'use client';

import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {useLocale} from './locale-provider';
import type {RunState} from '@/lib/game/state';
import {Sprite} from './farm-ui';

type PlannerMode=RunState['plannerMode'];
type Props={open:boolean;onChoose:(mode:PlannerMode)=>void};

const modes:[PlannerMode,string,string,string,string][]=[
 ['simple','Parsnip','Simple Mode','Want to jump straight into your day? Get a short list of planting tips, fishing reminders, and seasonal finds!','No need to check in with the weather or Fortune Teller!'],
 ['full','Quality Sprinkler','Full Mode','Love planning ahead? Add your weather, luck, and farm progress for suggestions that fit your day!','A little more detail to help you decide what to do next.'],
];

export default function ModeChoiceDialog({open,onChoose}:Props){
 const {render}=useLocale();
 return render(<Dialog open={open}>
  <DialogContent className="farm-dialog setup-dialog mode-choice-dialog" showCloseButton={false} onEscapeKeyDown={event=>event.preventDefault()} onPointerDownOutside={event=>event.preventDefault()}>
   <div className="setup-hero">
    <Sprite name="Calendar" size={58}/>
    <div><p className="eyebrow">Welcome to Pelican Planner!</p><DialogTitle>How do you want to use the planner?</DialogTitle></div>
   </div>
   <DialogDescription>How much planning sounds fun? Pick the option that suits you today. You can always switch later!</DialogDescription>
   <div className="mode-choice-grid">
    {modes.map(([mode,sprite,title,description,note])=><button key={mode} className={`mode-choice-card ${mode}`} onClick={()=>onChoose(mode)}>
     <Sprite name={sprite} size={56}/>
     <span><strong>{title}</strong><small>{description}</small><em>{note}</em></span>
    </button>)}
   </div>
   <p className="label-note">Want to try the other mode? Just switch from the top bar whenever you like!</p>
  </DialogContent>
 </Dialog>);
}
