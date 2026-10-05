import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const out=new URL('../.sites-runtime/encyclopedia-test/',import.meta.url);
await mkdir(out,{recursive:true});
for(const name of ['data','obtain','villager-profiles','villager-heart-events','encyclopedia-crafting','encyclopedia-details','encyclopedia','encyclopedia-offline']){
  const input=await readFile(new URL(`../lib/game/${name}.ts`,import.meta.url),'utf8');
  const code=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
    .replace(/from '(\.\/[^']+)'/g,(full,spec)=>`from '${spec.endsWith('.json')?spec:spec+'.js'}'${spec.endsWith('.json')?" with {type:'json'}":''}`);
  await writeFile(new URL(name+'.js',out),code);
}
await copyFile(new URL('../lib/game/assets-source.json',import.meta.url),new URL('assets-source.json',out));
await writeFile(new URL('package.json',out),'{"type":"module"}\n');

const enc=await import(new URL('encyclopedia.js',out));
const offline=await import(new URL('encyclopedia-offline.js',out));
const villagers=await import(new URL('villager-profiles.js',out));
const heartEvents=await import(new URL('villager-heart-events.js',out));
const assetsRegistry=JSON.parse(await readFile(new URL('../lib/game/assets-source.json',import.meta.url),'utf8'));
const spriteProxyRoute=await readFile(new URL('../app/api/encyclopedia-sprite/[name]/route.ts',import.meta.url),'utf8');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS',name)};

test('Encyclopedia has a substantial local index',()=>assert(enc.encyclopediaEntries.length>=245));
test('Broad sword search keeps the generic article and named choices',()=>{const r=enc.searchEncyclopedia('sword');assert.equal(enc.exactEncyclopediaMatch('sword')?.title,'Sword');assert(r.some(e=>e.title==='Galaxy Sword'));assert(r.some(e=>e.title==='Bone Sword'))});
test('Cabbage resolves to Red Cabbage without requiring an exact title',()=>assert.equal(enc.searchEncyclopedia('cabbage')[0]?.title,'Red Cabbage'));
test('Inline entity linking never matches inside a larger word',()=>{
 const carp=enc.encyclopediaByTitle.get('carp');
 for(const phrase of ['Carpenter','Carpenter Shop','Cindersap Forest','Shadow merchant','Freelance programmer','Minecarts','Backwoods']){
  const matches=enc.findEncyclopediaInlineMatches(phrase);
  assert.equal(matches.length,0,`${phrase}: ${matches.map(m=>m.text+' -> '+m.entry.title).join(', ')}`);
 }
 const matches=enc.findEncyclopediaInlineMatches('Bring a Carp and some Sap to the Community Center.');
 assert(matches.some(m=>m.entry.id===carp.id));
 assert(matches.some(m=>m.entry.title==='Sap'));
 assert(matches.some(m=>m.entry.title==='Community Center'));
});
test('Context search does not treat embedded item names as relevant words',()=>{
 const carpResults=enc.searchEncyclopedia('carp').map(e=>e.title);
 assert(carpResults.includes('Carp'));
 assert(!carpResults.includes('Robin'),'Robin should not match carp via Carpenter');
 const shadResults=enc.searchEncyclopedia('shad').map(e=>e.title);
 assert(shadResults.includes('Shad'));
 assert(!shadResults.includes('Krobus'),'Krobus should not match shad via Shadow merchant');
});
test('Bundle search stays focused enough to be a chooser',()=>{const r=enc.searchEncyclopedia('bundle');assert.equal(r[0]?.title,'Bundles');assert(r.length<=45);assert(r.some(e=>e.title==='Spring Foraging'))});
test('Every Encyclopedia entry resolves a sprite',()=>{for(const entry of enc.encyclopediaEntries)assert(entry.sprite,`${entry.category}: ${entry.title}`)});
test('Trees and Crafting have useful first-class browse coverage',()=>{
 assert(enc.encyclopediaCategories.includes('Trees'));
 assert(enc.encyclopediaCategories.includes('Crafting'));
 const trees=enc.encyclopediaEntries.filter(e=>e.category==='Trees');
 const crafting=enc.encyclopediaEntries.filter(e=>e.category==='Crafting');
 assert(trees.length>=15,`trees: ${trees.length}`);
 assert(crafting.length>=45,`crafting: ${crafting.length}`);
 for(const title of ['Oak Tree','Maple Tree','Pine Tree','Mahogany Tree','Mystic Tree','Green Rain Trees'])assert(trees.some(e=>e.title===title),title);
 for(const title of ['Tapper','Mushroom Log','Keg','Furnace','Heavy Furnace','Tree Fertilizer','Crystalarium'])assert(crafting.some(e=>e.title===title),title);
});
test('Every referenced Encyclopedia sprite has a static file or cached proxy source',()=>{const proxyRoute=spriteProxyRoute;for(const entry of enc.encyclopediaEntries){const sprite=enc.encyclopediaSpritePath(entry);assert(sprite,`${entry.title}: missing path`);if(sprite.startsWith('/sprites/'))assert(existsSync(new URL('../public'+sprite,import.meta.url)),`${entry.title}: ${sprite}`);else{assert(sprite.startsWith('/api/encyclopedia-sprite/'),`${entry.title}: unexpected sprite path ${sprite}`);assert(proxyRoute.includes(JSON.stringify(sprite.split('/').pop())),`${entry.title}: proxy mapping missing for ${sprite}`)}}});
test('All giftable villagers have a complete local gift profile',()=>{assert.equal(Object.keys(villagers.villagerProfiles).length,34);for(const [name,profile] of Object.entries(villagers.villagerProfiles)){assert(profile.birthday?.season&&profile.birthday?.day,`${name}: birthday`);for(const tier of ['loves','likes','neutrals','dislikes','hates'])assert(Array.isArray(profile[tier]),`${name}: ${tier}`)}});
test('Villager encyclopedia facts list the complete personal hated-gift set',()=>{const abigail=enc.encyclopediaByTitle.get('abigail');assert(abigail);assert(abigail.facts.includes('Hated gifts: Clay, Holly.'));assert(!abigail.facts.some(f=>f.includes('these are hated gifts')));const sam=enc.encyclopediaByTitle.get('sam');assert(sam);const hated=sam.facts.find(f=>f.startsWith('Hated gifts:'));for(const gift of villagers.villagerProfiles.Sam.hates)assert(hated.includes(gift),`Sam missing ${gift}`)});
test('Every villager gift label resolves to a bundled local sprite',()=>{const assets=assetsRegistry;const available=new Set(Object.keys(assets));for(const [name,profile] of Object.entries(villagers.villagerProfiles)){for(const tier of ['loves','likes','neutrals','dislikes','hates'])for(const gift of profile[tier]){const sprite=villagers.giftSpriteName(gift,available);assert.notEqual(sprite,'Bundle Green',`${name}: ${gift}`);assert(assets[sprite]?.local_path,`${name}: ${gift} -> ${sprite}`)}}});
test('Local heart-event guide covers the supported friendship milestones',()=>{assert(Object.keys(heartEvents.villagerHeartEvents).length>=31);assert(Object.values(heartEvents.villagerHeartEvents).flat().length>=100);assert(heartEvents.villagerHeartEvents.Abigail.some(e=>e.heart===4));});


const spriteData={};for(const entry of enc.encyclopediaEntries){const sprite=enc.encyclopediaSpritePath(entry);if(sprite)spriteData[sprite]='data:image/png;base64,AA=='}
const html=offline.buildOfflineEncyclopediaHtml(spriteData);
test('Offline reader has no runtime network dependency',()=>{assert(!/\bfetch\s*\(/.test(html));assert(!/<script[^>]+src=/i.test(html));assert(!/<link[^>]+stylesheet/i.test(html));assert(html.includes('data:image/png;base64'));assert(html.includes('Birthday gifts are ×8'));assert(html.includes('function heartGuide'))});
test('Offline reader refines broad search and links inline sprites to entries',()=>{
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(script);
 const app={innerHTML:''},q={value:'',oninput:null},form={onsubmit:null},back={onclick:null};
 const document={getElementById(id){return id==='app'?app:id==='q'?q:id==='searchForm'?form:id==='back'?back:{onclick:null}},querySelectorAll(){return []}};
 const context=vm.createContext({document,window:{scrollTo(){}},console});vm.runInContext(script,context,{timeout:3000});
 vm.runInContext("q.value='sword';list('sword')",context,{timeout:3000});assert(app.innerHTML.includes('General article'));assert(app.innerHTML.includes('Galaxy Sword'));
 vm.runInContext("q.value='carp';list('carp')",context,{timeout:3000});assert(app.innerHTML.includes('>Carp<'));assert(!app.innerHTML.includes('>Robin<'));
 vm.runInContext("openEntry('bundle-construction')",context,{timeout:3000});assert(app.innerHTML.includes(`data-open="${enc.encyclopediaByTitle.get('wood').id}"`));assert(app.innerHTML.includes('data:image/png;base64'));
 const carp=enc.encyclopediaByTitle.get('carp');
 const carpenterHtml=vm.runInContext("rich('Carpenter Shop and a Shadow merchant in Cindersap Forest','')",context,{timeout:3000});
 assert(!carpenterHtml.includes(`data-open="${carp.id}"`),'Offline inline linker should not link Carp inside Carpenter');
 assert(!carpenterHtml.includes('data-open="item-sap"'),'Offline inline linker should not link Sap inside Cindersap');
});
console.log(`${passed} Encyclopedia checks passed.`);
