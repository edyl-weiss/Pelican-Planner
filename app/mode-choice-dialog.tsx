'use client';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Sprite} from './farm-ui';
import type {RunState} from '@/lib/game/state';

export default function ModeChoiceDialog({open,onChoose}:{open:boolean;onChoose:(mode:RunState['plannerMode'])=>void}){
 return <Dialog open={open}><DialogContent className="farm-dialog setup-dialog mode-choice-dialog" showCloseButton={false} onEscapeKeyDown={e=>e.preventDefault()} onPointerDownOutside={e=>e.preventDefault()}>
  <div className="setup-hero"><Sprite name="Calendar" size={58}/><div><p className="eyebrow">Welcome to Pelican Planner!</p><DialogTitle>Before we start, how nitpicky do you want to be?</DialogTitle></div></div>
  <DialogDescription>No pressure. Pick the vibe that sounds fun, and you can switch anytime without losing a thing.</DialogDescription>
  <div className="mode-choice-grid">
   <button className="mode-choice-card simple" onClick={()=>onChoose('simple')}>
    <Sprite name="Parsnip" size={56}/><span><strong>Simple Mode</strong><small>Keep it cozy. Tell me where you are in the season and what matters to you, and I’ll handle the rest. No luck or weather homework.</small><em>Best for: “Just tell me what’s worth doing today.”</em></span>
   </button>
   <button className="mode-choice-card full" onClick={()=>onChoose('full')}>
    <Sprite name="Quality Sprinkler" size={56}/><span><strong>Full Mode</strong><small>Give me the details. Track weather, luck, progress, unlocks, crop math, and more for tighter recommendations.</small><em>Best for: “Yes, I absolutely want all the details.”</em></span>
   </button>
  </div>
  <p className="label-note">Change your mind later? Totally fine. Use the Simple / Full switch at the top whenever you want.</p>
 </DialogContent></Dialog>;
}
