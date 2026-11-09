import test from 'node:test';
import assert from 'node:assert/strict';
import {fingerprintCrash,matchCrash,compareSolutionPaths,investigateLinuxCrash,DEMO_LINUX_CRASH,DEMO_CRASH_HISTORY} from '../lib/crash-memory.mjs';

test('stable fingerprint across address and line number noise',()=>{
 const a=fingerprintCrash(DEMO_LINUX_CRASH).fingerprint;
 const b=fingerprintCrash({...DEMO_LINUX_CRASH,frames:['#0  SensorManager::read() at sensor.cpp:999','#1  ServiceWorker::execute() at worker.cpp:87','#2  main() at main.cpp:31']}).fingerprint;
 assert.equal(a,b);
});
test('known different build ID cannot be an exact or similar signature match',()=>{
 const matches=matchCrash(DEMO_LINUX_CRASH,DEMO_CRASH_HISTORY);
 assert.equal(matches.length,2);
 assert(matches.every(m=>m.id!=='crash-003'));
});
test('recorded fix verification never defaults to verified',()=>{
 const report=investigateLinuxCrash();
 assert.equal(report.previousFixes[0].verification,'UNVERIFIED');
 assert.equal(report.occurrences,2);
 assert.equal(report.decision.measuredTimeMs,null);
});
test('GDB preferred if core exists and ASan reproduction unavailable',()=>{
 const r=compareSolutionPaths({crash:DEMO_LINUX_CRASH,hasCore:true,canRebuild:true,reproducible:false});
 assert.equal(r.preferred,'core-gdb');
 assert.equal(r.paths.length,2);
 assert.equal(r.paths[0].ready,true);
});
test('ASan preferred if core missing but rebuild and reproduction available',()=>{
 const r=compareSolutionPaths({crash:DEMO_LINUX_CRASH,hasCore:false,canRebuild:true,reproducible:true});
 assert.equal(r.preferred,'asan-reproduce');
});
test('no false recommendation when required data absent',()=>{
 const r=compareSolutionPaths({crash:DEMO_LINUX_CRASH});
 assert.equal(r.preferred,null);
 assert(r.paths.every(p=>!p.ready));
});
test('each option exposes reasons, advantages disadvantages effort overhead usefulness and verification',()=>{
 for(const p of compareSolutionPaths({crash:DEMO_LINUX_CRASH}).paths){
  for(const k of ['rationale','requirements','advantages','disadvantages','investigationTime','latencyImpact','usefulness','verification','ready']) assert(Object.hasOwn(p,k));
  assert.equal(p.verification,'NOT_RUN');
 }
});
test('malformed evidence rejected',()=>assert.throws(()=>fingerprintCrash({signal:'SIGSEGV',frames:[]})));
test('previous fixes keep separate verification evidence',()=>{
 const r=compareSolutionPaths({crash:DEMO_LINUX_CRASH,hasCore:true,previousFixes:[{id:'f1',pathId:'core-gdb',verification:'FAILED',observedResult:'No root cause found'}]});
 assert.equal(r.paths[0].previousResults[0].verification,'FAILED');
});
