import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const transpile=async path=>ts.transpileModule(await readFile(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const loadDataModule=code=>import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));

let machines=await transpile('../lib/game/machines.ts');
const plannerStub=`const SEASONS=['Spring','Summer','Fall','Winter'];
const absoluteDay=d=>(d.year-1)*112+SEASONS.indexOf(d.season)*28+d.day;
const fromDay=n=>{const t=Math.max(1,n)-1;return {year:Math.floor(t/112)+1,season:SEASONS[Math.floor(t%112/28)],day:t%28+1}};
const dateLabel=d=>d.season+' '+d.day+', Y'+d.year;`;
machines=machines.replace(/import \{ absoluteDay, fromDay, dateLabel \} from ['"]\.\/planner['"];?/,plannerStub);
const machine=await loadDataModule(machines);
assert.deepEqual(machine.machineReadyAt({season:'Spring',day:1,year:1},'06:00',4000),{date:{season:'Spring',day:3,year:1},time:'7:20 PM',overnight:false});
assert.deepEqual(machine.machineReadyAt({season:'Spring',day:1,year:1},'12:40',4000),{date:{season:'Spring',day:4,year:1},time:'6:00 AM',overnight:true});
assert.deepEqual(machine.machineReadyAt({season:'Spring',day:1,year:1},'06:00',6000),{date:{season:'Spring',day:5,year:1},time:'6:00 AM',overnight:true});
assert.deepEqual(machine.machineReadyAt({season:'Spring',day:1,year:1},'01:50',6000),{date:{season:'Spring',day:5,year:1},time:'7:10 PM',overnight:false});
assert.equal(machine.MACHINE_RECIPES.find(x=>x.machine==='Fish Smoker')?.minutes,50);
assert.equal(machine.MACHINE_RECIPES.find(x=>x.machine==='Seed Maker')?.minutes,20);
assert.equal(machine.machineProductSpriteName('Wine'),'Wine');
assert.equal(machine.machineProductSpriteName('Juice'),'Juice');
assert.equal(machine.machineProductSpriteName('Oil from Sunflower'),'Oil');
assert.equal(machine.machineProductSpriteName('Dried Fruit / Mushrooms / Raisins'),'Dried Fruit');

const island=await loadDataModule(await transpile('../lib/game/ginger-island.ts'));
assert.equal(island.TOTAL_GOLDEN_WALNUTS,130);
const totals=Object.fromEntries(['General','East','West','North','South'].map(region=>[region,island.WALNUT_ACTIVITIES.filter(x=>x.region===region).reduce((sum,item)=>sum+item.max,0)]));
assert.deepEqual(totals,{General:6,East:11,West:52,North:49,South:12});
assert.equal(new Set(island.WALNUT_ACTIVITIES.map(x=>x.id)).size,island.WALNUT_ACTIVITIES.length);
console.log('PASS smart-planner machine timing and 130-walnut invariants');
