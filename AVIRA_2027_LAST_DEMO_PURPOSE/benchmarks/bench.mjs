import {performance} from 'node:perf_hooks';
import {memoryUsage,cpuUsage} from 'node:process';
import {analyzeTrace} from '../lib/traceproof.mjs';
const N=Number(process.argv[2]||10000);const R=Number(process.argv[3]||50);
if(!Number.isSafeInteger(N)||N<1||N>50000||!Number.isSafeInteger(R)||R<5||R>500)throw Error('N must be 1..50000 pairs; runs 5..500');
const events=[];for(let i=0;i<N;i++){events.push({id:`req-${i}`,requestId:`r${i}`,timestampMs:i*30,type:'REQUEST'},{id:`resp-${i}`,requestId:`r${i}`,timestampMs:i*30+8,type:'RESPONSE'});}
for(let j=0;j<10;j++)analyzeTrace(events);
const samples=[],cpuBefore=cpuUsage(),rssBefore=memoryUsage().rss;
for(let j=0;j<R;j++){const t=performance.now();const res=analyzeTrace(events);if(res.status!=='PASS')throw Error('Unexpected output');samples.push(performance.now()-t)}
const cpu=cpuUsage(cpuBefore);samples.sort((a,b)=>a-b);const pct=p=>samples[Math.ceil(p*samples.length)-1];
console.log(JSON.stringify({node:process.version,pairs:N,events:2*N,runs:R,medianMs:pct(.5),p95Ms:pct(.95),p99Ms:pct(.99),throughputEventsPerSecond:(2*N)/(pct(.5)/1000),processCpuUserMs:cpu.user/1000,processCpuSystemMs:cpu.system/1000,processRssBeforeMB:rssBefore/1048576,processRssAfterMB:memoryUsage().rss/1048576,note:'Local synthetic benchmark. Includes Node runtime and input arrays; excludes UI and AI provider.'},null,2));
