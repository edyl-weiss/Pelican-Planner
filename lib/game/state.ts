import { z } from 'zod';
import { SEASONS, FARM_TYPES, GOALS } from './data';
const count=z.number().int().min(0).max(999999999);
export const dateSchema=z.object({season:z.enum(SEASONS),day:z.number().int().min(1).max(28),year:z.number().int().min(1).max(999)});
export const customCropSchema=z.object({seasons:z.array(z.enum(SEASONS)).min(1).max(4),regrow:z.number().int().min(0).max(365),sell:count,yield:z.number().int().min(1).max(999)});
const plotSchema=z.object({customCrop:customCropSchema.optional(),location:z.enum(['Farm','Greenhouse','IslandWest']).optional(),id:z.string().max(80),crop:z.string().max(80),quantity:z.number().int().min(1).max(9999),planted:dateSchema,nextHarvest:z.number().int().min(0).max(120000),harvests:count,missedDays:count});
export const runSchema=z.object({
 version:z.literal(1),name:z.string().trim().min(1).max(60),farm:z.enum(FARM_TYPES),date:dateSchema,gold:count,reserve:count,mineFloor:z.number().int().min(0).max(120),farming:z.number().int().min(0).max(10),goal:z.enum(GOALS),level:z.number().int().min(1).max(5),experience:z.enum(['First playthrough','Familiar','Experienced']),weather:z.enum(['Unknown','Sunny','Rain','Storm','Snow']),tomorrow:z.enum(['Unknown','Sunny','Rain','Storm','Snow']),noFishing:z.boolean(),festivals:z.boolean(),spoilers:z.enum(['Minimal','Normal','Full']),unlocks:z.array(z.string().max(60)).max(30),done:z.array(z.string().max(200)).max(10000),donated:z.array(z.string().max(120)).max(500),inventory:z.array(z.object({name:z.string().min(1).max(80),quantity:count,quality:z.union([z.literal(0),z.literal(1),z.literal(2),z.literal(4)])})).max(1000),plots:z.array(plotSchema).max(200),reservations:z.array(z.object({id:z.string().max(80),name:z.string().max(80),resource:z.string().max(80),quantity:count})).max(200),notes:z.array(z.object({id:z.string().max(80),label:z.string().min(1).max(160),date:dateSchema,done:z.boolean()})).max(500),history:z.array(z.string().max(250)).max(20),tiller:z.boolean(),artisan:z.boolean(),
});
export type RunState=z.infer<typeof runSchema>;
export type GameDate=RunState['date'];
export type Plot=RunState['plots'][number];
export const newRun=():RunState=>({version:1,name:'My Farm',farm:'Standard',date:{season:'Spring',day:1,year:1},gold:500,reserve:0,mineFloor:0,farming:0,goal:'Balanced',level:2,experience:'Familiar',weather:'Sunny',tomorrow:'Unknown',noFishing:false,festivals:true,spoilers:'Normal',unlocks:[],done:[],donated:[],inventory:[],plots:[],reservations:[],notes:[],history:[],tiller:false,artisan:false});
export function validateRun(value:unknown):RunState{return runSchema.parse(value)}
