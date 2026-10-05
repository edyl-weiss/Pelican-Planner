import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import ts from 'typescript';

const out=new URL('../.sites-runtime/security-test/',import.meta.url);
await mkdir(out,{recursive:true});
const input=await readFile(new URL('../lib/server/request-security.ts',import.meta.url),'utf8');
const code=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
await writeFile(new URL('request-security.js',out),code);
const {checkRunApiRateLimit,isJsonRequest,resetRunApiRateLimitForTests}=await import(new URL('request-security.js',out));

const request=(ip,contentType)=>new Request('https://pelican-planner.example/api/run',{headers:{'x-vercel-forwarded-for':ip,...(contentType?{'content-type':contentType}:{})}});
resetRunApiRateLimitForTests();
for(let i=0;i<90;i++)assert.equal(checkRunApiRateLimit(request('203.0.113.10'),'GET',1000).allowed,true);
const blocked=checkRunApiRateLimit(request('203.0.113.10'),'GET',1000);
assert.equal(blocked.allowed,false);
assert.equal(blocked.retryAfter,60);
assert.equal(checkRunApiRateLimit(request('203.0.113.11'),'GET',1000).allowed,true);
assert.equal(checkRunApiRateLimit(request('203.0.113.10'),'PUT',1000).allowed,true);
assert.equal(checkRunApiRateLimit(request('203.0.113.10'),'GET',61_001).allowed,true);
assert.equal(isJsonRequest(request('203.0.113.12','application/json')),true);
assert.equal(isJsonRequest(request('203.0.113.12','application/json; charset=utf-8')),true);
assert.equal(isJsonRequest(request('203.0.113.12','text/plain')),false);
console.log('PASS /api/run best-effort rate limiting and JSON request validation');
