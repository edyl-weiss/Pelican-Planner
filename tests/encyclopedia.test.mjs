import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const out=new URL('../.sites-runtime/encyclopedia-test/',import.meta.url);
await mkdir(out,{recursive:true});
for(const name of ['data','obtain','encyclopedia','encyclopedia-offline']){
  const input=await readFile(new URL(`../lib/game/${name}.ts`,import.meta.url),'utf8');
  const code=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
    .replace(/from '(\.\/[^']+)'/g,(full,spec)=>`from '${spec.endsWith('.json')?spec:spec+'.js'}'${spec.endsWith('.json')?" with {type:'json'}":''}`);
  await writeFile(new URL(name+'.js',out),code);
}
await copyFile(new URL('../lib/game/assets-source.json',import.meta.url),new URL('assets-source.json',out));
await writeFile(new URL('package.json',out),'{"type":"module"}\n');

const enc=await import(new URL('encyclopedia.js',out));
const offline=await import(new URL('encyclopedia-offline.js',out));
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS',name)};

test('Encyclopedia has a substantial local index',()=>assert(enc.encyclopediaEntries.length>=245));
test('Broad sword search keeps the generic article and named choices',()=>{const r=enc.searchEncyclopedia('sword');assert.equal(enc.exactEncyclopediaMatch('sword')?.title,'Sword');assert(r.some(e=>e.title==='Galaxy Sword'));assert(r.some(e=>e.title==='Bone Sword'))});
test('Cabbage resolves to Red Cabbage without requiring an exact title',()=>assert.equal(enc.searchEncyclopedia('cabbage')[0]?.title,'Red Cabbage'));
test('Bundle search stays focused enough to be a chooser',()=>{const r=enc.searchEncyclopedia('bundle');assert.equal(r[0]?.title,'Bundles');assert(r.length<=45);assert(r.some(e=>e.title==='Spring Foraging'))});
test('Every referenced Encyclopedia sprite exists locally',()=>{for(const entry of enc.encyclopediaEntries){const sprite=enc.encyclopediaSpritePath(entry);if(sprite)assert(existsSync(new URL('../public'+sprite,import.meta.url)),`${entry.title}: ${sprite}`)}});

const spriteData={};for(const entry of enc.encyclopediaEntries){const sprite=enc.encyclopediaSpritePath(entry);if(sprite)spriteData[sprite]='data:image/png;base64,AA=='}
const html=offline.buildOfflineEncyclopediaHtml(spriteData);
test('Offline reader has no runtime network dependency',()=>{assert(!/\bfetch\s*\(/.test(html));assert(!/<script[^>]+src=/i.test(html));assert(!/<link[^>]+stylesheet/i.test(html));assert(html.includes('data:image/png;base64'))});
test('Offline reader refines broad search and links inline sprites to entries',()=>{
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(script);
 const app={innerHTML:''},q={value:'',oninput:null},form={onsubmit:null},back={onclick:null};
 const document={getElementById(id){return id==='app'?app:id==='q'?q:id==='searchForm'?form:id==='back'?back:{onclick:null}},querySelectorAll(){return []}};
 const context=vm.createContext({document,window:{scrollTo(){}},console});vm.runInContext(script,context,{timeout:3000});
 vm.runInContext("q.value='sword';list('sword')",context,{timeout:3000});assert(app.innerHTML.includes('General article'));assert(app.innerHTML.includes('Galaxy Sword'));
 vm.runInContext("openEntry('bundle-construction')",context,{timeout:3000});assert(app.innerHTML.includes('data-open="item-wood"'));assert(app.innerHTML.includes('data:image/png;base64'));
});
console.log(`${passed} Encyclopedia checks passed.`);
