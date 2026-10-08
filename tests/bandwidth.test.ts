import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {assetSlots} from '../lib/game/assets.ts';
import {characterProfiles} from '../lib/game/characters.ts';
import {evidence} from '../lib/game/evidence.ts';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('reports/bandwidth-optimization/images.json',root),'utf8'));
test('all presentation derivatives exist and every preserved original retains its recorded hash',async()=>{
 for(const r of manifest){assert.equal(createHash('sha256').update(await readFile(new URL(r.original,root))).digest('hex'),r.original_sha256);assert.ok((await stat(new URL(r.output,root))).size>0);}
 for(const p of characterProfiles){assert.match(p.image,/\/assets\/display\/character_.*_display\.webp$/);await stat(new URL('public'+p.image,root));}
});
test('every archive evidence has a thumbnail while comparison and zoom retain original source',async()=>{
 for(const e of evidence){if(!e.image)continue;const a=assetSlots[e.image];assert.ok(a);assert.match(a.src,/\/assets\/generated\/.*\.png$/);await stat(new URL('public'+a.src.replace('/assets/generated/','/assets/display/').replace(/\.png$/,'_thumb.webp'),root));}
 const s=await readFile(new URL('app/page.tsx',root),'utf8');assert.match(s,/panel === "archive"[\s\S]*?onZoom=\{setZoomSlot\} thumbnail/);assert.match(s,/compare\.map[\s\S]*?onZoom=\{setZoomSlot\} \/>/);assert.match(s,/zoomSlot && <SceneImage slot=\{zoomSlot\} \/>/);assert.match(s,/loading="lazy"/);
});
test('initial seven portraits and archive thumbnails satisfy the bandwidth budgets',()=>{
 const first=manifest.filter((r:any)=>r.kind==='character'&&!r.original.includes('aizawa'));assert.equal(first.length,7);assert.ok(first.reduce((n:number,r:any)=>n+r.after,0)<1_050_000);assert.ok(manifest.filter((r:any)=>r.kind==='archive').reduce((n:number,r:any)=>n+r.after,0)<1_500_000);
 assert.equal(assetSlots.lodge_blackout_2310.src,assetSlots.lodge_return_night_2310.src);
});
