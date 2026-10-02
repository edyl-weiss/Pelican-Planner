'use client';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Sprite} from './farm-ui';
import type {RunState} from '@/lib/game/state';

export default function ModeChoiceDialog({open,onChoose}:{open:boolean;onChoose:(mode:RunState['plannerMode'])=>void}){
 return <Dialog open={open}><DialogContent className="farm-dialog setup-dialog mode-choice-dialog" showCloseButton={false} onEscapeKeyDown={e=>e.preventDefault()} onPointerDownOutside={e=>e.preventDefault()}>
  <div className="setup-hero"><Sprite name="Calendar" size={58}/><div><p className="eyebrow">Welcome to Pelican Planner!</p><DialogTitle>Before we get growing, how nitpicky do you want to be?</DialogTitle></div></div>
  <DialogDescription>No pressure. Pick what feels right for your farm. You can always switch later.</DialogDescription>
  <div className="mode-choice-grid">
   <button className="mode-choice-card simple" onClick={()=>onChoose('simple')}>
    <Sprite name="Parsnip" size={56}/><span><strong>Simple Mode</strong><small>Take it easy. I’ll point out what’s worth planting, catching, and doing as the season rolls along.</small><em>Best for: a laid-back farm.</em></span>
   </button>
   <button className="mode-choice-card full" onClick={()=>onChoose('full')}>
    <Sprite name="Quality Sprinkler" size={56}/><span><strong>Full Mode</strong><small>Plan every last parsnip! Track weather, luck, progress, and crop math.</small><em>Best for: farmers who like the details.</em></span>
   </button>
  </div>
  <p className="label-note">Change your mind? No worries. Just use the Simple / Full switch up top.</p>
 </DialogContent></Dialog>;
}
