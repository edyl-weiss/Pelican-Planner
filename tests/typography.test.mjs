import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {extname,join} from 'node:path';

async function runtimeFiles(dir){
  const out=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(entry.name==='node_modules'||entry.name==='.next') continue;
    const path=join(dir,entry.name);
    if(entry.isDirectory()) out.push(...await runtimeFiles(path));
    else if(['.css','.ts','.tsx','.js','.mjs','.html','.svg'].includes(extname(entry.name))) out.push(path);
  }
  return out;
}

const [globals,theme,offline,readme,zhDeployment]=await Promise.all([
  readFile(new URL('../app/globals.css',import.meta.url),'utf8'),
  readFile(new URL('../app/valley-theme.css',import.meta.url),'utf8'),
  readFile(new URL('../lib/game/encyclopedia-offline.ts',import.meta.url),'utf8'),
  readFile(new URL('../README.md',import.meta.url),'utf8'),
  readFile(new URL('../DEPLOYMENT-ZH.md',import.meta.url),'utf8'),
]);
const combined=globals+'\n'+theme+'\n'+offline+'\n'+readme+'\n'+zhDeployment;
for(const legacy of ['FarmHand','FarmPixel','Patrick'+' Hand','VT'+'323','Long'+' Cang','patrick-hand.ttf']) assert(!combined.includes(legacy),`Legacy font reference remains: ${legacy}`);
assert(!/Comic\s+Sans/i.test(combined),'Unwanted comic-style system font reference remains');
for(const variable of ['--font-display:','--font-ui:','--font-reference:','--font-zh:']) assert(globals.includes(variable),`Missing typography variable ${variable}`);
assert(globals.includes('--font-display:"Alegreya Sans"'),'Display font should be Alegreya Sans');
assert(globals.includes('--font-ui:"Alegreya Sans"'),'English UI font should be Alegreya Sans');
assert(globals.includes('--font-reference:"Alegreya"'),'Reference font should be Alegreya');
assert(globals.includes('--font-zh:"LXGW WenKai"'),'Chinese font should be LXGW WenKai');
assert(globals.includes('body{margin:0;font-family:var(--font-ui);'),'Main UI body should use the UI stack');
assert(globals.includes('h1,h2,h3,.pixel{font-family:var(--font-display);'),'Headings should use the display stack');
assert(globals.includes('html[lang="zh-CN"]{--font-display:var(--font-zh);--font-ui:var(--font-zh);--font-reference:var(--font-zh);}'),'Chinese locale should replace all three typography roles');
assert(theme.includes('font-family:var(--font-reference);'),'Encyclopedia prose should use the reference stack');
assert(offline.includes('--display:"Alegreya Sans"'),'Offline Encyclopedia should use Alegreya Sans for UI/display');
assert(offline.includes('--reference:"Alegreya"'),'Offline Encyclopedia should use Alegreya for article prose');
assert(readme.includes('Alegreya Sans')&&readme.includes('Alegreya')&&readme.includes('LXGW WenKai'),'README should describe the selected typography system');

const root=new URL('..',import.meta.url);
const sourceFiles=(await Promise.all(['app','components','lib'].map(async dir=>runtimeFiles(new URL(`../${dir}`,import.meta.url).pathname)))).flat();
const runtime=(await Promise.all(sourceFiles.map(async path=>`${path}\n${await readFile(path,'utf8')}`))).join('\n');
for(const legacy of ['FarmHand','FarmPixel','Patrick'+' Hand','VT'+'323','Long'+' Cang','patrick-hand.ttf']) assert(!runtime.includes(legacy),`Legacy runtime font reference remains: ${legacy}`);
assert(!/Comic\s+Sans/i.test(runtime),'Comic Sans remains in runtime source');
assert(!/font-family\s*:\s*Arial\b/i.test(runtime),'Arial font override remains in runtime source');
assert(!/\bfont-(?:sans|serif)\b/.test(runtime),'Tailwind font utility bypasses the Pelican Planner typography variables');

console.log('PASS typography audit: Alegreya Sans UI/display, Alegreya Encyclopedia prose, LXGW WenKai Chinese, with no retired or stray Arial overrides.');
