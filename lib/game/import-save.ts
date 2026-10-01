import {newRun,runSchema,type RunState} from './state';
import {FARM_TYPES,SEASONS,crops} from './data';
import {absoluteDay} from './planner';
const harvestNames:Record<string,string>={'24':'Parsnip','188':'Green Bean','190':'Cauliflower','192':'Potato','400':'Strawberry','258':'Blueberry','254':'Melon','256':'Tomato','260':'Hot Pepper','270':'Corn','282':'Cranberries','276':'Pumpkin','272':'Eggplant','280':'Yam','278':'Bok Choy','262':'Wheat'};
export function importSave(text:string,current:RunState):{run:RunState;summary:string;warnings?:string[]}{
 if(text.length>20000000)throw new Error('Choose a save smaller than 20 MB.');
 if(text.trim().startsWith('{'))return {run:runSchema.parse(JSON.parse(text)),summary:'Journal backup loaded. Review it, then save.'};
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw new Error('This XML format is not supported.');
 const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror')||doc.documentElement.tagName!=='SaveGame')throw new Error('Choose the full Stardew Valley save file, not SaveGameInfo or a screenshot.');
 const root=doc.documentElement;const read=(parent:Element,tag:string)=>Array.from(parent.children).find(c=>c.tagName===tag)?.textContent??'';
 const player=Array.from(root.children).find(c=>c.tagName==='player');if(!player)throw new Error('The save does not contain a main player.');
 const seasonRaw=read(root,'currentSeason');const season=SEASONS.find(s=>s.toLowerCase()===seasonRaw.toLowerCase());const day=Number(read(root,'dayOfMonth'));const year=Number(read(root,'year'));
 if(!season||!day||!year)throw new Error('Could not read the save date. Your current run was not changed.');
 const farmId=Number(read(root,'whichFarm'));const base=newRun();
 const run:RunState={...base,goal:current.goal,level:current.level,experience:current.experience,noFishing:current.noFishing,festivals:current.festivals,spoilers:current.spoilers,name:read(player,'farmName')||'Imported Farm',farm:FARM_TYPES[farmId]??'Standard',date:{season,day,year},gold:Number(read(player,'money')),mineFloor:Math.min(120,Number(read(player,'deepestMineLevel')||read(root,'mine_lowestLevelReached')||0)),farming:Number(read(player,'farmingLevel')||0),weather:'Unknown',tomorrow:'Unknown'};
 const warnings:string[]=[];
 const professions=player.querySelector('professions');
 const professionIds=Array.from(professions?.children??[]).map(e=>Number(e.textContent));
 run.tiller=professionIds.includes(0);run.artisan=professionIds.includes(4);
 const items=Array.from(player.children).find(c=>c.tagName==='items');
 if(items)for(const element of Array.from(items.children)){const name=read(element,'name');const quantity=Number(read(element,'stack')||1);const quality=runSchema.shape.inventory.element.shape.quality.parse(Number(read(element,'quality')||0));if(name&&quantity>0)run.inventory.push({name,quantity,quality});}
 const mail=Array.from(player.children).find(c=>c.tagName==='mailReceived');const flags=new Set(Array.from(mail?.children??[]).map(e=>e.textContent));
 if(flags.has('ccVault'))run.unlocks.push('Bus');if(flags.has('ccPantry'))run.unlocks.push('Greenhouse');if(flags.has('ccBoilerRoom'))run.unlocks.push('Minecarts');if(flags.has('ccIsComplete'))run.unlocks.push('Community Center');
 // A crop's saved phase lengths already include growth-speed adjustments.
 // The final phase is a mature sentinel, not additional growth time.
 const groups=new Map<string,RunState['plots'][number]>();
 let skipped=0,dead=0;
 for(const crop of Array.from(root.querySelectorAll('locations crop'))){
  if(!crop.children.length)continue;
  if(read(crop,'dead')==='true'){dead++;continue;}
  const location=crop.closest('GameLocation');
  const locationName=location?read(location,'name'):'';
  const cropName=harvestNames[read(crop,'indexOfHarvest').replace(/^\(O\)/,'')];
  const known=crops.find(c=>c.name===cropName);
  if(!known||!['Farm','Greenhouse','IslandWest'].includes(locationName)||crop.parentElement?.tagName!=='TerrainFeature'){skipped++;continue;}
  const phases=Array.from(crop.querySelector('phaseDays')?.children??[]).map(e=>Number(e.textContent));
  const phase=Number(read(crop,'currentPhase')),elapsed=Number(read(crop,'dayOfCurrentPhase'));
  if(phases.length<2||phases.some(n=>!Number.isInteger(n)||n<0)||!Number.isInteger(phase)||phase<0||phase>=phases.length||!Number.isInteger(elapsed)||!read(crop,'currentPhase')||!read(crop,'dayOfCurrentPhase')){skipped++;continue;}
  const regrowing=read(crop,'fullyGrown')==='true';
  const remaining=regrowing?Math.max(0,elapsed):phase===phases.length-1?0:Math.max(0,phases.slice(phase,-1).reduce((a,b)=>a+b,0)-elapsed);
  if(remaining>365){skipped++;continue;}
  const protectedCrop=locationName!=='Farm';
  if(!protectedCrop&&!known.seasons.includes(season)){skipped++;continue;}
  const key=[cropName,remaining,locationName,regrowing].join(':');
  const existing=groups.get(key);
  if(existing&&existing.quantity<9999)existing.quantity++;
  else if(!existing)groups.set(key,{id:`import-${groups.size}`,crop:cropName,quantity:1,planted:run.date,nextHarvest:absoluteDay(run.date)+remaining,harvests:regrowing?1:0,missedDays:0,location:locationName as 'Farm'|'Greenhouse'|'IslandWest'});
  else skipped++;
 }
 if(groups.size>200)throw new Error('This save has more than 200 distinct crop groups. Your journal was not changed.');
 run.plots=Array.from(groups.values());
 if(skipped)warnings.push(`${skipped} crop tiles were not imported (unsupported crops, locations or growth data).`);
 if(dead)warnings.push(`${dead} dead crop tiles were excluded.`);
 warnings.push('Only the 16 crops in the journal catalog are supported. Chests, animals, bundle donations and modded content are not imported.');
 warnings.push('Growth assumes daily watering after import. Import again after playing to refresh the journal; this is not a live Steam connection.');
 run.history=['Imported game save and recognized growing crops. Review unsupported content before planning.'];
 return {run:runSchema.parse(run),warnings,summary:'Imported farm details, backpack items, professions, recognized unlocks and supported growing crops. Your game file was not modified.'};
}
