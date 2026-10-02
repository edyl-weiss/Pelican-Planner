'use client';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Sprite} from './farm-ui';
import type {RunState} from '@/lib/game/state';

export default function ModeChoiceDialog({open,onChoose}:{open:boolean;onChoose:(mode:RunState['plannerMode'])=>void}){
 return <Dialog open={open}><DialogContent className="farm-dialog setup-dialog mode-choice-dialog" showCloseButton={false} onEscapeKeyDown={e=>e.preventDefault()} onPointerDownOutside={e=>e.preventDefault()}>
  <div className="setup-hero"><Sprite name="Calendar" size={58}/><div><p className="eyebrow">Welcome to Pelican Planner</p><DialogTitle>How much planning do you want?</DialogTitle></div></div>
  <DialogDescription>Pick the version that feels comfortable. You can swap between them anytime without losing your farm.</DialogDescription>
  <div className="mode-choice-grid">
   <button className="mode-choice-card simple" onClick={()=>onChoose('simple')}>
    <Sprite name="Parsnip" size={56}/><span><strong>Simple Mode</strong><small>A few useful seasonal nudges. Tell us your date, goal and farm size. No daily luck or weather tracking required.</small><em>Best for a relaxed second-screen guide</em></span>
   </button>
   <button className="mode-choice-card full" onClick={()=>onChoose('full')}>
    <Sprite name="Quality Sprinkler" size={56}/><span><strong>Full Mode</strong><small>The complete planner with weather, luck, progression, unlocks, detailed crop comparisons and optimization controls.</small><em>Best for players who want fine control</em></span>
   </button>
  </div>
  <p className="label-note">Nothing is permanent. Use the Simple / Full switch above the planner whenever you want to change.</p>
 </DialogContent></Dialog>;
}
