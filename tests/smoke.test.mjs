import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const origin='http://localhost:3901';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','localhost','--port','3901'],{stdio:['ignore','pipe','pipe'],env:{...process.env,NEXT_TELEMETRY_DISABLED:'1',BLOB_READ_WRITE_TOKEN:'',BLOB_STORE_ID:'',VERCEL_OIDC_TOKEN:''}});
let output='';server.stdout.on('data',chunk=>output+=chunk);server.stderr.on('data',chunk=>output+=chunk);
try{
 let ready=false;for(let i=0;i<40;i++){try{const res=await fetch(origin);if(res.ok){ready=true;break}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
 assert(ready,'Production server did not start: '+output);
 const page=await fetch(origin);const html=await page.text();assert(html.includes('Pelican Planner'));assert(html.includes('简体中文'));assert(page.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));assert.equal(page.headers.get('x-content-type-options'),'nosniff');
 for(const path of ['/fonts/patrick-hand.ttf','/sprites/parsnip.png']){const response=await fetch(origin+path);assert.equal(response.status,200);assert((await response.arrayBuffer()).byteLength>100)}
 const response=await fetch(origin+'/api/run');assert.equal(response.status,200);const data=await response.json();assert.equal(data.revision,0);assert(data.notice.includes('private Vercel Blob'));assert.equal(response.headers.get('cache-control'),'private, no-store');
 const cookie=response.headers.get('set-cookie');assert(cookie.includes('HttpOnly'));assert(cookie.includes('SameSite=strict'));assert(cookie.includes('Secure'));
 const missing=await fetch(origin+'/api/run',{method:'PUT',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(missing.status,401);
 const csrf=await fetch(origin+'/api/run',{method:'PUT',headers:{Origin:'https://unrelated.example','Content-Type':'application/json',Cookie:cookie.split(';')[0]},body:'{}'});assert.equal(csrf.status,403);
 const badType=await fetch(origin+'/api/run',{method:'PUT',headers:{Origin:origin,'Content-Type':'text/plain',Cookie:cookie.split(';')[0]},body:'{}'});assert.equal(badType.status,415);
 const invalid=await fetch(origin+'/api/run',{method:'PUT',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie.split(';')[0]},body:'{}'});assert.equal(invalid.status,400);
 const unavailable=await fetch(origin+'/api/run',{method:'POST',headers:{Origin:origin,Cookie:cookie.split(';')[0]}});assert.equal(unavailable.status,503);
 console.log('PASS production page, security headers, local fonts/sprite, draft mode, private cookie, origin/content-type protection and explicit storage setup errors.');
}finally{server.kill('SIGTERM');}
