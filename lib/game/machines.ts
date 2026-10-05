import type {GameDate,RunState} from './state';
import {absoluteDay,fromDay,dateLabel} from './planner';

export type MachineRecipe={machine:string;product:string;minutes:number;note?:string};

export const MACHINE_RECIPES:MachineRecipe[]=[
 {machine:'Keg',product:'Coffee',minutes:120},
 {machine:'Keg',product:'Green Tea',minutes:180},
 {machine:'Keg',product:'Mead',minutes:600},
 {machine:'Keg',product:'Vinegar',minutes:600},
 {machine:'Keg',product:'Beer',minutes:1750},
 {machine:'Keg',product:'Pale Ale',minutes:2250},
 {machine:'Keg',product:'Juice',minutes:6000},
 {machine:'Keg',product:'Wine',minutes:10000},
 {machine:'Preserves Jar',product:'Jelly / Pickles / Aged Roe',minutes:4000},
 {machine:'Preserves Jar',product:'Caviar',minutes:6000},
 {machine:'Cheese Press',product:'Cheese / Goat Cheese',minutes:200},
 {machine:'Mayonnaise Machine',product:'Mayonnaise',minutes:180},
 {machine:'Loom',product:'Cloth',minutes:240},
 {machine:'Seed Maker',product:'Seeds',minutes:20},
 {machine:'Fish Smoker',product:'Smoked Fish',minutes:50},
 {machine:'Dehydrator',product:'Dried Fruit / Mushrooms / Raisins',minutes:1750},
 {machine:'Oil Maker',product:'Truffle Oil',minutes:360},
 {machine:'Oil Maker',product:'Oil from Corn',minutes:1000},
 {machine:'Oil Maker',product:'Oil from Sunflower',minutes:60},
 {machine:'Oil Maker',product:'Oil from Sunflower Seeds',minutes:3200},
];

export const timeToStartOffset=(time:string)=>{
 const match=/^(\d{2}):(\d{2})$/.exec(time);
 if(!match)return null;
 let hour=Number(match[1]);const minute=Number(match[2]);
 if(hour<0||hour>23||minute<0||minute>59||minute%10!==0)return null;
 if(hour<6)hour+=24;
 const offset=(hour-6)*60+minute;
 return offset>=0&&offset<1200?offset:null;
};

const clockLabel=(minutesAfterSix:number)=>{
 const total=6*60+minutesAfterSix;
 const hour24=Math.floor(total/60)%24;const minute=total%60;
 const suffix=hour24>=12?'PM':'AM';const hour=hour24%12||12;
 return `${hour}:${String(minute).padStart(2,'0')} ${suffix}`;
};

/**
 * Stardew machines process one minute per in-game minute while the farmer is awake,
 * then 100 processing minutes per real hour from 2:00 AM to 6:00 AM. That makes a
 * full 6AM-to-6AM cycle worth 1,600 processing minutes.
 */
export const machineReadyAt=(started:GameDate,startedTime:string,processingMinutes:number)=>{
 const offset=timeToStartOffset(startedTime);
 if(offset===null)throw new Error('Load time must be between 6:00 AM and 1:50 AM in 10-minute steps.');
 const total=offset+Math.max(1,Math.round(processingMinutes));
 const dayDelta=Math.floor(total/1600);const remainder=total%1600;
 // The farmer cannot collect between 2 AM and 6 AM, so overnight finishes surface at 6 AM.
 if(remainder>=1200)return {date:fromDay(absoluteDay(started)+dayDelta+1),time:'6:00 AM',overnight:true};
 return {date:fromDay(absoluteDay(started)+dayDelta),time:clockLabel(remainder),overnight:false};
};

export const machineReadyLabel=(batch:RunState['machineBatches'][number])=>{
 const ready=machineReadyAt(batch.started,batch.startedTime,batch.processingMinutes);
 return `${dateLabel(ready.date)} · ${ready.time}`;
};

export const machineBatchesForDate=(run:RunState,date:GameDate)=>run.machineBatches.filter(batch=>!batch.collected&&absoluteDay(machineReadyAt(batch.started,batch.startedTime,batch.processingMinutes).date)===absoluteDay(date));
export const readyMachineBatches=(run:RunState)=>run.machineBatches.filter(batch=>!batch.collected&&absoluteDay(machineReadyAt(batch.started,batch.startedTime,batch.processingMinutes).date)<=absoluteDay(run.date)).sort((a,b)=>absoluteDay(machineReadyAt(a.started,a.startedTime,a.processingMinutes).date)-absoluteDay(machineReadyAt(b.started,b.startedTime,b.processingMinutes).date));
