import { createHash } from 'node:crypto';

/** Deterministic, read-only crash recurrence + decision support. No AI inference. */
const safe = (s, n=300) => typeof s === 'string' && s.trim().length > 0 && s.length <= n;
function assertCrash(c) {
  if (!c || !safe(c.executable) || !safe(c.signal,30) || !safe(c.architecture,50) || !Array.isArray(c.frames) || c.frames.length===0 || c.frames.length>128) throw new Error('Invalid crash evidence');
  if(c.buildId!=null && !safe(c.buildId,120)) throw new Error('Invalid build ID');
  for(const frame of c.frames) if(!safe(frame,500)) throw new Error('Invalid stack frame');
}
function normalizedFrame(frame) {
  return frame.replace(/^\s*#\d+\s*/,'').replace(/0x[0-9a-f]+/gi,'<address>').replace(/:\d+(?=\b)/g,':<line>').replace(/\+0x[0-9a-f]+/gi,'+<offset>').replace(/\s+/g,' ').trim().toLowerCase();
}
export function fingerprintCrash(crash) {
  assertCrash(crash);
  const top=crash.frames.slice(0,5).map(normalizedFrame);
  const signature=[crash.executable.trim().toLowerCase(),crash.signal.trim().toUpperCase(),crash.architecture.trim().toLowerCase(),...top].join('|');
  return {fingerprint:createHash('sha256').update(signature).digest('hex').slice(0,20), normalizedFrames:top};
}
export function matchCrash(current, history) {
  assertCrash(current);
  if(!Array.isArray(history) || history.length>10000)throw new Error('Invalid crash history');
  const currentSignature=fingerprintCrash(current);
  return history.flatMap(record=>{
    if(!record||!record.crash||!safe(record.id,100))return [];
    try {assertCrash(record.crash);}catch{return [];}
    if(record.crash.executable!==current.executable || record.crash.signal!==current.signal || record.crash.architecture!==current.architecture)return [];
    // Known different build IDs block an exact match, even if text happens to coincide.
    const buildConflict=!!(current.buildId&&record.crash.buildId&&current.buildId!==record.crash.buildId);
    const other=fingerprintCrash(record.crash);
    const exact=!buildConflict&&currentSignature.fingerprint===other.fingerprint;
    const common=currentSignature.normalizedFrames.filter((f,i)=>other.normalizedFrames[i]===f).length;
    const similarity=common/Math.max(currentSignature.normalizedFrames.length,other.normalizedFrames.length);
    if(!exact && (buildConflict||similarity<0.6))return [];
    return [{id:record.id,match:exact?'EXACT_SIGNATURE':'SIMILAR_SIGNATURE',similarity:Number(similarity.toFixed(2)),sameBuild:!!(current.buildId&&current.buildId===record.crash.buildId),buildIdStatus:!current.buildId||!record.crash.buildId?'UNKNOWN': 'MATCH',occurredAt:record.occurredAt??null,verification:record.verification??'UNVERIFIED',evidenceIds:record.evidenceIds??[],fixId:record.fixId??null}];
  }).sort((a,b)=> (b.match==='EXACT_SIGNATURE')-(a.match==='EXACT_SIGNATURE') || b.similarity-a.similarity || String(b.occurredAt).localeCompare(String(a.occurredAt)) || a.id.localeCompare(b.id));
}

const PATHS=Object.freeze([
  {
    id:'asan-reproduce',name:'Choice A — Reproduce using AddressSanitizer',
    rationale:'Best for a reproducible memory-error crash when a rebuild is possible; sanitizer diagnostics may expose the first invalid access.',
    requirements:['Source and debug build access','A controllable reproduction input','A supported AddressSanitizer toolchain'],
    advantages:['Detects many invalid memory accesses and use-after-free cases','Produces diagnostics with stack context','Can become an automated regression test'],
    disadvantages:['Requires rebuilding and reproducing','Instrumentation changes memory layout and timing','Does not detect every memory bug'],
    investigationTime:'Estimated setup: hours; actual time unknown',
    latencyImpact:'Instrumented build may run slower; not a production latency measurement',
    usefulness:'High for repeatable memory faults, lower for non-reproducible incidents',
    solutionType:'DIAGNOSTIC_PATH_NOT_CODE_FIX',
    verification:'NOT_RUN'
  },
  {
    id:'core-gdb',name:'Choice B — Inspect core dump with GDB',
    rationale:'Good first step when a Linux core dump and matching debug symbols exist, even if the crash cannot be reproduced.',
    requirements:['Core dump','Matching executable/build ID and debug symbols','GDB-compatible environment'],
    advantages:['No need to trigger the crash again','Can inspect thread stacks and crashed process state','Does not add runtime overhead to the already-recorded process'],
    disadvantages:['May show the symptom, not the origin of memory corruption','Optimizations or missing symbols reduce visibility','A core file cannot by itself replay the crash'],
    investigationTime:'Estimated initial triage: minutes to hours; actual time unknown',
    latencyImpact:'Offline debugging has no measured impact on the historical incident; core collection overhead depends on system configuration',
    usefulness:'High for triage when a usable core exists, not proof of a fix',
    solutionType:'DIAGNOSTIC_PATH_NOT_CODE_FIX',
    verification:'NOT_RUN'
  }
]);
export function compareSolutionPaths({crash, hasCore=false, canRebuild=false, reproducible=false, previousFixes=[]}={}) {
  assertCrash(crash);
  if(typeof hasCore!=='boolean'||typeof canRebuild!=='boolean'||typeof reproducible!=='boolean'||!Array.isArray(previousFixes))throw new Error('Invalid environment');
  const paths=PATHS.map(p=>{
    const ready=p.id==='asan-reproduce' ? canRebuild&&reproducible : hasCore;
    const reasons=p.id==='asan-reproduce'
      ? [canRebuild?'Rebuild available':'Rebuild unavailable',reproducible?'Reproduction available':'No known reproduction']
      : [hasCore?'Core available':'Core unavailable'];
    const related=previousFixes.filter(f=>f?.pathId===p.id).map(f=>({id:f.id??null,verification:f.verification??'UNVERIFIED',observedResult:f.observedResult??'Not provided'}));
    return {...p,ready,reasons,previousResults:related};
  }).sort((a,b)=>Number(b.ready)-Number(a.ready) || (a.id==='core-gdb'?-1:1));
  return {preferred:paths.find(p=>p.ready)?.id??null,preferenceReason:paths.some(p=>p.ready)?'Preferred path is ready with stated prerequisites; this is not evidence of a proven repair.':'Neither path has its prerequisites; collect evidence first.',paths,measuredTimeMs:null,measuredLatencyDeltaMs:null,disclaimer:'Estimates are qualitative, not benchmarks. No proposed repair is verified without a real before/after regression.'};
}
export const DEMO_LINUX_CRASH=Object.freeze({executable:'vehicle-service',signal:'SIGSEGV',architecture:'x86_64',buildId:'demo-build-17',frames:['#0  SensorManager::read() at sensor.cpp:142','#1  ServiceWorker::execute() at worker.cpp:87','#2  main() at main.cpp:31']});
export const DEMO_CRASH_HISTORY=Object.freeze([
 {id:'crash-001',occurredAt:'2026-11-06T09:00:00Z',crash:{...DEMO_LINUX_CRASH,frames:['#0  SensorManager::read() at sensor.cpp:144','#1  ServiceWorker::execute() at worker.cpp:87','#2  main() at main.cpp:31']},verification:'UNVERIFIED',evidenceIds:['bt-001','core-meta-001'],fixId:'fix-001'},
 {id:'crash-002',occurredAt:'2026-11-07T11:10:00Z',crash:{...DEMO_LINUX_CRASH},verification:'REPRODUCED_NOT_FIXED',evidenceIds:['bt-002'],fixId:null},
 {id:'crash-003',occurredAt:'2026-11-07T13:45:00Z',crash:{...DEMO_LINUX_CRASH,buildId:'demo-build-18'},verification:'UNVERIFIED',evidenceIds:['bt-003'],fixId:null}
]);
export function investigateLinuxCrash({hasCore=true,canRebuild=true,reproducible=false}={}) {
  const current=structuredClone(DEMO_LINUX_CRASH);
  const matches=matchCrash(current,DEMO_CRASH_HISTORY);
  return {mode:'SYNTHETIC_DEMO',crash:current,fingerprint:fingerprintCrash(current).fingerprint,occurrences:matches.length,matches,previousFixes:[{id:'fix-001',description:'Audit pointer lifetime in SensorManager::read()',verification:'UNVERIFIED',evidenceIds:['bt-001'],disclaimer:'Suggested investigation only; no patch has been verified.'}],decision:compareSolutionPaths({crash:current,hasCore,canRebuild,reproducible,previousFixes:[]}),note:'Crash signature matching is evidence similarity, not proof of identical root cause.'};
}
