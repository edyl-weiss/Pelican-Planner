'use client';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Sprite} from './farm-ui';
import type {RunState} from '@/lib/game/state';

export default function ModeChoiceDialog({open,onChoose}:{open:boolean;onChoose:(mode:RunState['plannerMode'])=>void}){
 return <Dialog open={open}><DialogContent className="farm-dialog setup-dialog mode-choice-dialog" showCloseButton={false} onEscapeKeyDown={e=>e.preventDefault()} onPointerDownOutside={e=>e.preventDefault()}>
  <div className="setup-hero"><Sprite name="Calendar" size={58}/><div><p className="eyebrow">Welcome to Pelican Planner!</p><DialogTitle>Before we get growing, how nitpicky should we be?</DialogTitle></div></div>
  <DialogDescription>No pressure. Pick what feels right!</DialogDescription>
  <div className="mode-choice-grid">
   <button className="mode-choice-card simple" onClick={()=>onChoose('simple')}>
    <Sprite name="Parsnip" size={56}/><span><strong>Simple Mode</strong><small>Easygoing tips for planting, fishing, and seasonal goals.</small><em>Best for: a laid-back farm.</em></span>
   </button>
   <button className="mode-choice-card full" onClick={()=>onChoose('full')}>
    <Sprite name="Quality Sprinkler" size={56}/><span><strong>Full Mode</strong><small>Track weather, luck, progress, and crop math.</small><em>Best for: detail-minded farmers.</em></span>
   </button>
  </div>
  <p className="label-note">Switch modes anytime from the top bar.</p>
 </DialogContent></Dialog>;
}
