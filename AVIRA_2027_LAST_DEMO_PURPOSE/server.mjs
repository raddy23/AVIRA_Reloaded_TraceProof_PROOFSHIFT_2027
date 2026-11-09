import {createServer} from 'node:http';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {join, resolve, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {investigateLinuxCrash, matchCrash, fingerprintCrash, compareSolutionPaths, DEMO_LINUX_CRASH, DEMO_CRASH_HISTORY} from './lib/crash-memory.mjs';
import {investigateIncident, INCIDENTS} from './lib/incident-lab.mjs';
const root=resolve(fileURLToPath(new URL('.',import.meta.url)));
const dataFile=process.env.AVIRA_DATA_FILE ? resolve(process.env.AVIRA_DATA_FILE) : join(root,'data','crash-history.json');
const PORT=Number(process.env.PORT||4173);
let history=[];
const send=(res,status,data)=>{const body=JSON.stringify(data); res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Origin':'same-origin'});res.end(body)};
const err=(res,code,msg)=>send(res,code,{error:msg});
async function persist(){await mkdir(resolve(dataFile,'..'),{recursive:true});await writeFile(dataFile,JSON.stringify(history,null,2)+'\n')}
async function init(){try{const parsed=JSON.parse(await readFile(dataFile,'utf8'));if(!Array.isArray(parsed)||parsed.length>10000)throw Error('History file invalid');history=parsed}catch(e){if(e.code==='ENOENT'){history=structuredClone(DEMO_CRASH_HISTORY);await persist()}else throw e}}
async function bodyJSON(req){let raw='';for await(const part of req){raw+=part;if(raw.length>150000)throw new Error('Request too large')}let v;try{v=JSON.parse(raw)}catch{throw new Error('Invalid JSON')};if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('Expected JSON object');return v}
function safeText(x,max=300){return typeof x==='string'&&x.length>0&&x.length<=max}
const validVerification=new Set(['UNVERIFIED','REPRODUCED_NOT_FIXED','TESTED_PASSED','TESTED_FAILED']);
function normalizeEvidence(input){const c=input.crash;if(!c||typeof c!=='object')throw Error('Crash object required');fingerprintCrash(c);return c}
function overview(crash,flags){const matches=matchCrash(crash,history);const fixes=history.filter(x=>matches.some(m=>m.id===x.id)&&x.fixId).map(x=>({id:x.fixId,incidentId:x.id,description:x.fixDescription||'Prior investigation (details unavailable)',verification:x.verification||'UNVERIFIED',evidenceIds:x.evidenceIds||[]}));return {mode:'LOCAL_DEMO_OR_USER_SUPPLIED',crash,signature:fingerprintCrash(crash),occurrences:matches.length,matches,previousFixes:fixes,decision:compareSolutionPaths({crash,...flags,previousFixes:fixes}),notice:'Similarity is not proof of same root cause; candidate paths are diagnostics, not verified repairs.'}}
function readOnlyPaths(url){const known=new Map([['/','web/crash.html'],['/index.html','web/crash.html'],['/crash','web/crash.html'],['/trace','web/index.html'],['/favicon.ico','']]);const map=known.get(url.pathname);if(map!==undefined)return map; if(/^\/(?:lib|web)\/[a-zA-Z0-9_.\/-]+$/.test(url.pathname)&&!url.pathname.includes('..'))return url.pathname.slice(1);return null}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&u.pathname==='/api/health')return send(res,200,{status:'ok',name:'AVIRA_Reloaded_TraceProof_PROOFSHIFT_2027',storage:'local-file',agentNativeIntegration:'SEPARATE_OVERLAY_NOT_VERIFIED'});
 if(req.method==='GET'&&u.pathname==='/api/history')return send(res,200,{history,counts:{total:history.length},sample:DEMO_LINUX_CRASH});
 if(req.method==='POST'&&u.pathname==='/api/investigate'){const input=await bodyJSON(req);const crash=normalizeEvidence(input);return send(res,200,overview(crash,{hasCore:input.hasCore===true,canRebuild:input.canRebuild===true,reproducible:input.reproducible===true}))}
 if(req.method==='POST'&&u.pathname==='/api/incidents'){const input=await bodyJSON(req);const crash=normalizeEvidence(input);if(history.length>=10000)return err(res,409,'History capacity reached');if(input.note!==undefined&&!safeText(input.note,500))throw Error('Invalid note');const record={id:'crash-'+randomUUID(),occurredAt:new Date().toISOString(),crash,verification:'UNVERIFIED',evidenceIds:Array.isArray(input.evidenceIds)?input.evidenceIds.filter(s=>safeText(s,100)).slice(0,20):[],fixId:null,note:input.note||''};history.push(record);await persist();return send(res,201,{record,overview:overview(crash,{hasCore:false,canRebuild:false,reproducible:false})})}
 if(req.method==='POST'&&/^\/api\/incidents\/[^/]+\/fix$/.test(u.pathname)){const id=decodeURIComponent(u.pathname.split('/')[3]);const target=history.find(x=>x.id===id);if(!target)return err(res,404,'Unknown incident');const input=await bodyJSON(req);if(!safeText(input.description,1000))throw Error('Fix description is required (max 1000 chars)');if(!['asan-reproduce','core-gdb','other'].includes(input.pathId))throw Error('Unsupported diagnostic path');target.fixId='fix-'+randomUUID();target.fixDescription=input.description;target.pathId=input.pathId;target.verification='UNVERIFIED';target.testEvidence='';await persist();return send(res,200,{record:target})}
 if(req.method==='POST'&&/^\/api\/incidents\/[^/]+\/verify$/.test(u.pathname)){const id=decodeURIComponent(u.pathname.split('/')[3]);const target=history.find(x=>x.id===id);if(!target)return err(res,404,'Unknown incident');const input=await bodyJSON(req);if(!target.fixId)throw Error('Record a proposed fix first');if(!validVerification.has(input.status))throw Error('Invalid verification status');if(input.status!=='UNVERIFIED'&&!safeText(input.testEvidence,1000))throw Error('Verification requires test evidence / reference');target.verification=input.status;target.testEvidence=input.testEvidence||'';target.verifiedAt=new Date().toISOString();await persist();return send(res,200,{record:target,note:'Human-attested test status; this application has NOT run Linux tools or verified these claims.'})}
 if(req.method==='GET'&&u.pathname==='/api/scenarios')return send(res,200,{scenarios:Object.keys(INCIDENTS)});
 if(req.method==='POST'&&u.pathname==='/api/scenario'){const input=await bodyJSON(req);if(!Object.hasOwn(INCIDENTS,input.scenario))throw Error('Unknown scenario');return send(res,200,investigateIncident({scenario:input.scenario}))}
 if(req.method==='GET'&&u.pathname.startsWith('/api/'))return err(res,404,'Not found');
 if(req.method==='GET'){const relative=readOnlyPaths(u);if(relative===null)return err(res,404,'Not found');if(relative===''){res.writeHead(204);return res.end()}const path=resolve(root,relative);if(!path.startsWith(root+'/'))return err(res,403,'Forbidden');const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});return res.end(bytes)}
 return err(res,405,'Method not allowed');
}catch(e){return err(res,e.code==='ENOENT'?404:400,String(e.message||'Invalid request'))}});
await init();if(process.env.AVIRA_NO_LISTEN!=='1')server.listen(PORT,'127.0.0.1',()=>console.log(`AVIRA ProofShift local prototype: http://localhost:${PORT}`));
export {server,overview,root};
