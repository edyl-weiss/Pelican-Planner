import { z } from 'zod';
import { SEASONS, FARM_TYPES, GOALS } from './data';
export const WEATHER=['Unknown','Sunny','Windy','Rain','Storm','Snow','Green Rain'] as const;
export const DAILY_LUCK=['Unknown','Very bad','Bad','Neutral','Good','Very good'] as const;
export const PLANNER_MODES=['simple','full'] as const;
export const SIMPLE_FARM_SIZES=['Small','Medium','Large'] as const;
const count=z.number().int().min(0).max(999999999);
const unsafeMarkupOrControl=/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const text=(max:number,min=0)=>z.string().trim().min(min).max(max).refine(value=>!unsafeMarkupOrControl.test(value),'HTML-like markup and control characters are not allowed in planner text.');
export const dateSchema=z.object({season:z.enum(SEASONS),day:z.number().int().min(1).max(28),year:z.number().int().min(1).max(999)});
export const customCropSchema=z.object({seasons:z.array(z.enum(SEASONS)).min(1).max(4),regrow:z.number().int().min(0).max(365),sell:count,yield:z.number().int().min(1).max(999)});
const plotSchema=z.object({customCrop:customCropSchema.optional(),location:z.enum(['Farm','Greenhouse','IslandWest']).optional(),id:z.string().max(80),crop:text(80,1),quantity:z.number().int().min(1).max(9999),planted:dateSchema,nextHarvest:z.number().int().min(0).max(120000),harvests:count,missedDays:count});
const machineBatchSchema=z.object({id:z.string().max(80),machine:text(60,1),product:text(100,1),quantity:z.number().int().min(1).max(9999),started:dateSchema,startedTime:z.string().regex(/^\d{2}:\d{2}$/),processingMinutes:z.number().int().min(1).max(200000),collected:z.boolean().default(false)});
const islandProgressSchema=z.object({walnuts:z.record(z.string().max(80),z.number().int().min(0).max(99)).refine(value=>Object.keys(value).length<=200,'Too many Ginger Island progress entries.').default({}),hideCompleted:z.boolean().default(false),revealPuzzles:z.boolean().default(false)}).default({walnuts:{},hideCompleted:false,revealPuzzles:false});
export const saleSchema=z.object({item:text(80,1),gold:count});
export const activityDaySchema=z.object({
 date:dateSchema,closed:z.boolean(),financialsRecorded:z.boolean(),sales:z.array(saleSchema).max(40),otherIncome:count,otherCosts:count,seedCosts:count,
 harvests:z.array(z.object({item:text(80,1),quantity:count})).max(200),fish:count.nullable(),friendship:count.nullable(),buildings:z.array(text(80,1)).max(20),
 startMine:z.number().int().min(0).max(120),endMine:z.number().int().min(0).max(120),startBundles:z.array(z.string().max(80)).max(30),endBundles:z.array(z.string().max(80)).max(30),
 startUnlocks:z.array(z.string().max(60)).max(30),endUnlocks:z.array(z.string().max(60)).max(30),tasks:count,bundleFinds:z.array(text(80,1)).max(200),note:text(160),
});
export const activitySchema=z.object({days:z.array(activityDaySchema).max(1120).refine(days=>new Set(days.map(d=>`${d.date.year}:${d.date.season}:${d.date.day}`)).size===days.length,'Duplicate journal dates'),showDaily:z.boolean()}).default({days:[],showDaily:true});
export type ActivityDay=z.infer<typeof activityDaySchema>;
export const runSchema=z.object({
 activity:activitySchema,version:z.literal(1),plannerMode:z.enum(PLANNER_MODES).default('full'),simpleFarmSize:z.enum(SIMPLE_FARM_SIZES).default('Medium'),name:text(60,1),farm:z.enum(FARM_TYPES),date:dateSchema,gold:count,reserve:count,mineFloor:z.number().int().min(0).max(120),farming:z.number().int().min(0).max(10),goal:z.enum(GOALS),level:z.number().int().min(1).max(5),experience:z.enum(['First playthrough','Familiar','Experienced']),luck:z.enum(DAILY_LUCK).default('Unknown'),weather:z.enum(WEATHER),tomorrow:z.enum(WEATHER),noFishing:z.boolean(),festivals:z.boolean(),spoilers:z.enum(['Minimal','Normal','Full']),unlocks:z.array(z.string().max(60)).max(30),done:z.array(z.string().max(200)).max(10000),donated:z.array(z.string().max(120)).max(500),mutedSuggestions:z.array(z.string().max(180)).max(100).default([]),inventory:z.array(z.object({name:text(80,1),quantity:count,quality:z.union([z.literal(0),z.literal(1),z.literal(2),z.literal(4)])})).max(1000),chestContents:z.array(z.object({name:text(80,1),quantity:count,quality:z.union([z.literal(0),z.literal(1),z.literal(2),z.literal(4)])})).max(2000).default([]),plots:z.array(plotSchema).max(200),reservations:z.array(z.object({id:z.string().max(80),name:text(80,1),resource:text(80,1),quantity:count})).max(200),notes:z.array(z.object({id:z.string().max(80),label:text(160,1),date:dateSchema,done:z.boolean()})).max(500),history:z.array(text(250)).max(20),machineBatches:z.array(machineBatchSchema).max(500).default([]),islandProgress:islandProgressSchema,tiller:z.boolean(),artisan:z.boolean(),
});
export type RunState=z.infer<typeof runSchema>;
export type GameDate=RunState['date'];
export type Plot=RunState['plots'][number];
export const newRun=():RunState=>({activity:{days:[],showDaily:true},version:1,plannerMode:'full',simpleFarmSize:'Medium',name:'My Farm',farm:'Standard',date:{season:'Spring',day:1,year:1},gold:500,reserve:0,mineFloor:0,farming:0,goal:'Balanced',level:2,experience:'Familiar',luck:'Unknown',weather:'Sunny',tomorrow:'Unknown',noFishing:false,festivals:true,spoilers:'Normal',unlocks:[],done:[],donated:[],mutedSuggestions:[],inventory:[],chestContents:[],plots:[],reservations:[],notes:[],history:[],machineBatches:[],islandProgress:{walnuts:{},hideCompleted:false,revealPuzzles:false},tiller:false,artisan:false});
