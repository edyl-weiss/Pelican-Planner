'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {BookOpen,ChevronLeft,ChevronRight,FileText,Trash2,X} from 'lucide-react';

const LEGACY_NOTES_KEY='pelican-planner-notepad';
const CHUNKS_KEY='pelican-planner-notepad-chunks-v2';
const LEGACY_COLLAPSED_KEY='pelican-planner-notepad-collapsed';
const HIDDEN_KEY='pelican-planner-notepad-hidden';

type NoteSource='manual'|'selection';
type NoteChunk={id:string;text:string;source:NoteSource;createdAt:number};
type MenuState={x:number;y:number;text:string}|null;

const makeId=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

function isChunk(value:unknown):value is NoteChunk{
 if(!value||typeof value!=='object')return false;
 const chunk=value as Partial<NoteChunk>;
 return typeof chunk.id==='string'&&typeof chunk.text==='string'&&(chunk.source==='manual'||chunk.source==='selection')&&typeof chunk.createdAt==='number';
}

export default function PlannerNotepad(){
 const[chunks,setChunks]=useState<NoteChunk[]>([]);
 const[draft,setDraft]=useState('');
 const[hidden,setHidden]=useState(false);
 const[mobileOpen,setMobileOpen]=useState(false);
 const[menu,setMenu]=useState<MenuState>(null);
 const[savedPulse,setSavedPulse]=useState(false);
 const draftRef=useRef<HTMLTextAreaElement>(null);
 const pulseTimer=useRef<number|null>(null);

 useEffect(()=>{
  try{
   const stored=localStorage.getItem(CHUNKS_KEY);
   if(stored){
    const parsed=JSON.parse(stored) as unknown;
    if(Array.isArray(parsed)){
     // eslint-disable-next-line react-hooks/set-state-in-effect
     setChunks(parsed.filter(isChunk));
    }
   }else{
    const legacy=(localStorage.getItem(LEGACY_NOTES_KEY)??'').trim();
    if(legacy){
     const migrated:NoteChunk={id:makeId(),text:legacy,source:'manual',createdAt:Date.now()};
     // eslint-disable-next-line react-hooks/set-state-in-effect
     setChunks([migrated]);
     localStorage.setItem(CHUNKS_KEY,JSON.stringify([migrated]));
     localStorage.removeItem(LEGACY_NOTES_KEY);
    }
   }
   // eslint-disable-next-line react-hooks/set-state-in-effect
   const wasCollapsed=localStorage.getItem(LEGACY_COLLAPSED_KEY)==='yes';
   // Older builds used a collapsed rail. Treat that as hidden once so the preference survives.
   setHidden(localStorage.getItem(HIDDEN_KEY)==='yes'||wasCollapsed);
   if(wasCollapsed){localStorage.setItem(HIDDEN_KEY,'yes');localStorage.removeItem(LEGACY_COLLAPSED_KEY)}
  }catch{}
 },[]);

 const persist=useCallback((next:NoteChunk[])=>{
  setChunks(next);
  try{localStorage.setItem(CHUNKS_KEY,JSON.stringify(next))}catch{}
  setSavedPulse(true);
  if(pulseTimer.current)window.clearTimeout(pulseTimer.current);
  pulseTimer.current=window.setTimeout(()=>setSavedPulse(false),1000);
 },[]);

 useEffect(()=>()=>{if(pulseTimer.current)window.clearTimeout(pulseTimer.current)},[]);

 const addChunk=useCallback((text:string,source:NoteSource)=>{
  const clean=source==='selection'
   ?text.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()
   :text.trim();
  if(!clean)return false;
  const chunk:NoteChunk={id:makeId(),text:clean,source,createdAt:Date.now()};
  persist([...chunks,chunk]);
  return true;
 },[chunks,persist]);

 const setHiddenPreference=useCallback((next:boolean)=>{
  setHidden(next);
  try{localStorage.setItem(HIDDEN_KEY,next?'yes':'no')}catch{}
 },[]);

 const appendSelection=useCallback((text:string)=>{
  if(!addChunk(text,'selection'))return;
  setHiddenPreference(false);
  setMobileOpen(true);
  setMenu(null);
 },[addChunk,setHiddenPreference]);

 const saveDraft=()=>{
  if(!addChunk(draft,'manual'))return;
  setDraft('');
  window.setTimeout(()=>draftRef.current?.focus(),0);
 };

 const removeChunk=(id:string)=>persist(chunks.filter(chunk=>chunk.id!==id));

 useEffect(()=>{
  const onContextMenu=(event:MouseEvent)=>{
   const target=event.target as Node|null;
   const page=document.body;
   if(!target||!page.contains(target))return;
   if((event.target as HTMLElement)?.closest('textarea,input,[contenteditable="true"]'))return;
   const selection=window.getSelection();
   const text=selection?.toString().trim()??'';
   if(!text||!selection?.rangeCount)return;
   const range=selection.getRangeAt(0);
   if(!page.contains(range.commonAncestorContainer))return;
   event.preventDefault();
   const width=188,height=48,pad=10;
   setMenu({x:Math.min(event.clientX,window.innerWidth-width-pad),y:Math.min(event.clientY,window.innerHeight-height-pad),text});
  };
  const close=(event:MouseEvent)=>{
   const element=event.target as HTMLElement|null;
   if(!element?.closest('.notepad-selection-menu'))setMenu(null);
  };
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenu(null)};
  document.addEventListener('contextmenu',onContextMenu);
  document.addEventListener('mousedown',close);
  document.addEventListener('keydown',key);
  return()=>{document.removeEventListener('contextmenu',onContextMenu);document.removeEventListener('mousedown',close);document.removeEventListener('keydown',key)};
 },[]);

 const toggleHidden=()=>setHiddenPreference(!hidden);
 const openMobile=()=>{setHiddenPreference(false);setMobileOpen(true)};
 const clearNotes=()=>{if(chunks.length&&window.confirm('Delete every saved note?'))persist([])};

 return <>
  <button type="button" className="notepad-mobile-toggle" onClick={openMobile} aria-label="Open notepad"><FileText size={20}/><span>Notes</span></button>
  <aside className={`planner-notepad ${hidden?'is-hidden':''} ${mobileOpen?'is-mobile-open':''}`} aria-label="Pelican Planner notepad">
   <div className="notepad-titlebar">
    <div><FileText size={18}/><strong>Notepad</strong></div>
    <div className="notepad-window-actions">
     <button type="button" className="notepad-icon-btn desktop-notepad-hide" onClick={toggleHidden} aria-label={hidden?'Show notepad':'Hide notepad'} title={hidden?'Show notepad':'Hide notepad'}>{hidden?<ChevronRight size={17}/>:<ChevronLeft size={17}/>}</button>
     <button type="button" className="notepad-icon-btn notepad-mobile-close" onClick={()=>setMobileOpen(false)} aria-label="Close notepad"><X size={17}/></button>
    </div>
   </div>
   {!hidden&&<>
    <p className="notepad-instructions">Write a note and press Enter to save it. Use Shift+Enter for a new line. You can also highlight text in the Encyclopedia, right-click, and save it here.</p>
    <div className="notepad-composer">
     <textarea
      ref={draftRef}
      value={draft}
      onChange={event=>setDraft(event.target.value)}
      onKeyDown={event=>{
       if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();saveDraft()}
      }}
      className="planner-notepad-editor"
      aria-label="New note"
      spellCheck="true"
      rows={3}
      placeholder="Write a note…"
     />
     <span className="notepad-enter-hint" aria-hidden="true">Enter ↵</span>
    </div>
    <div className="notepad-chunks" aria-live="polite">
     {chunks.length===0?<p className="notepad-empty">Your saved notes will show up here.</p>:chunks.map(chunk=><article className={`notepad-chunk ${chunk.source==='selection'?'from-selection':''}`} key={chunk.id}>
      <div className="notepad-chunk-head">
       <span>{chunk.source==='selection'?<><BookOpen size={13}/>Encyclopedia</>:<><FileText size={13}/>Note</>}</span>
       <button type="button" className="notepad-chunk-delete" onClick={()=>removeChunk(chunk.id)} aria-label="Delete this note" title="Delete note"><X size={15}/></button>
      </div>
      <p>{chunk.text}</p>
     </article>)}
    </div>
    <div className="notepad-statusbar"><span>{savedPulse?'Saved locally':`${chunks.length} ${chunks.length===1?'note':'notes'} saved locally`}</span><button type="button" onClick={clearNotes} className="notepad-clear" disabled={!chunks.length} title="Clear all notes"><Trash2 size={14}/>Clear all</button></div>
   </>}
  </aside>
  {menu&&<div className="notepad-selection-menu" style={{left:menu.x,top:menu.y}} role="menu" aria-label="Selected text actions"><button type="button" role="menuitem" onClick={()=>appendSelection(menu.text)}><FileText size={17}/><span>Save to Notepad</span></button></div>}
 </>;
}
