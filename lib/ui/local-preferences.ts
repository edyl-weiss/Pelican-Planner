type ReadStorage={getItem:(key:string)=>string|null};
type WriteStorage={setItem:(key:string,value:string)=>void};
export type PreferenceStorage=ReadStorage&WriteStorage;

export const SIMPLE_NEXT_DAY_INTRO_KEY='pelican-planner-simple-next-day-intro-seen';

export function localPreferenceStorage():PreferenceStorage|null{
 try{return globalThis.localStorage??null}catch{return null}
}

export function hasSeenSimpleNextDayIntro(storage:ReadStorage|null|undefined):boolean{
 if(!storage)return false;
 try{return storage.getItem(SIMPLE_NEXT_DAY_INTRO_KEY)==='yes'}catch{return false}
}

export function shouldShowSimpleNextDayIntro(sessionSeen:boolean,storage:ReadStorage|null|undefined):boolean{
 return !sessionSeen&&!hasSeenSimpleNextDayIntro(storage);
}

export function markSimpleNextDayIntroSeen(storage:WriteStorage|null|undefined):void{
 if(!storage)return;
 try{storage.setItem(SIMPLE_NEXT_DAY_INTRO_KEY,'yes')}catch{}
}
