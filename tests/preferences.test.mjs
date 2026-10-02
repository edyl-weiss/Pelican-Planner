import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import ts from 'typescript';

const out=new URL('../.sites-runtime/preferences-test/',import.meta.url);
await mkdir(out,{recursive:true});
const input=await readFile(new URL('../lib/ui/local-preferences.ts',import.meta.url),'utf8');
const code=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
await writeFile(new URL('local-preferences.js',out),code);
const {SIMPLE_NEXT_DAY_INTRO_KEY,hasSeenSimpleNextDayIntro,localPreferenceStorage,markSimpleNextDayIntroSeen,shouldShowSimpleNextDayIntro}=await import(new URL('local-preferences.js',out));

const values=new Map();
const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
assert.equal(hasSeenSimpleNextDayIntro(storage),false);
assert.equal(shouldShowSimpleNextDayIntro(false,storage),true);
assert.equal(shouldShowSimpleNextDayIntro(true,storage),false);
markSimpleNextDayIntroSeen(storage);
assert.equal(values.get(SIMPLE_NEXT_DAY_INTRO_KEY),'yes');
assert.equal(hasSeenSimpleNextDayIntro(storage),true);
assert.equal(shouldShowSimpleNextDayIntro(false,storage),false);
assert.equal(hasSeenSimpleNextDayIntro(null),false);
assert.equal(hasSeenSimpleNextDayIntro({getItem(){throw new Error('blocked')}}),false);
assert.doesNotThrow(()=>markSimpleNextDayIntroSeen(null));
assert.doesNotThrow(()=>markSimpleNextDayIntroSeen({setItem(){throw new Error('blocked')}}));
assert.equal(localPreferenceStorage(),null);
console.log('PASS Simple Mode next-day intro preference is one-time and storage-safe');
