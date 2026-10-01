import {newRun,runSchema,type RunState} from './state';
import {FARM_TYPES,SEASONS} from './data';
export function importSave(text:string,current:RunState):{run:RunState;summary:string}{
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
 const items=Array.from(player.children).find(c=>c.tagName==='items');
 if(items)for(const element of Array.from(items.children)){const name=read(element,'name');const quantity=Number(read(element,'stack')||1);const quality=runSchema.shape.inventory.element.shape.quality.parse(Number(read(element,'quality')||0));if(name&&quantity>0)run.inventory.push({name,quantity,quality});}
 const mail=Array.from(player.children).find(c=>c.tagName==='mailReceived');const flags=new Set(Array.from(mail?.children??[]).map(e=>e.textContent));
 if(flags.has('ccVault'))run.unlocks.push('Bus');if(flags.has('ccPantry'))run.unlocks.push('Greenhouse');if(flags.has('ccBoilerRoom'))run.unlocks.push('Minecarts');if(flags.has('ccIsComplete'))run.unlocks.push('Community Center');
 run.history=['Imported game save. Confirm bundle donations, planted crops, weather and reserves manually.'];
 return {run:runSchema.parse(run),summary:'Imported date, farm, gold, farming level, mine depth, backpack items and recognized unlocks. Bundle donations, fields, chests, animals and modded content need manual entry. Your game file was not modified.'};
}
