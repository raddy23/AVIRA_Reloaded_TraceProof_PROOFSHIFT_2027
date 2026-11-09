// AVIRA TraceProof: evidence-bounded timing investigation, not causal diagnosis.
export const MAX_EVENTS = 100000;
const MAX_DURATION = 3600000;
export const SAMPLE_TRACES = Object.freeze({
  delayed:[{id:'request-A',requestId:'A',timestampMs:100,type:'REQUEST'},{id:'response-A',requestId:'A',timestampMs:118,type:'RESPONSE'}],
  healthy:[{id:'request-A',requestId:'A',timestampMs:100,type:'REQUEST'},{id:'response-A',requestId:'A',timestampMs:106,type:'RESPONSE'}],
  missing:[{id:'request-A',requestId:'A',timestampMs:100,type:'REQUEST'}],
  ambiguous:[{id:'request-A',requestId:'A',timestampMs:100,type:'REQUEST'},{id:'request-B',requestId:'A',timestampMs:103,type:'REQUEST'},{id:'response-A',requestId:'A',timestampMs:108,type:'RESPONSE'}],
  simultaneous:[{id:'response-A',requestId:'A',timestampMs:100,type:'RESPONSE'},{id:'request-A',requestId:'A',timestampMs:100,type:'REQUEST'}]
});
function threshold(value){if(typeof value!=='number'||!Number.isFinite(value)||value<=0||value>MAX_DURATION)throw new Error('Threshold must be a finite number >0 and <=3600000 ms');return value;}
function checkString(x){return typeof x==='string'&&x.length>0&&x.length<=128&&!/[\x00-\x1f\x7f]/.test(x);}
export function analyzeTrace(input,opts={}){
 const thresholdMs=threshold(opts.thresholdMs??10);
 if(!Array.isArray(input)||input.length>MAX_EVENTS)throw new Error('Input must be an event array of at most 100000 events');
 const events=input.map((raw,index)=>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error(`Invalid event at ${index}`);
  const {id,requestId,timestampMs,type}=raw;
  if(!checkString(id)||!checkString(requestId)||!Number.isSafeInteger(timestampMs)||timestampMs<0||!['REQUEST','RESPONSE'].includes(type))throw new Error(`Invalid event fields at ${index}`);
  return {id,requestId,timestampMs,type,index};
 });
 const seen=new Map(),unique=[],warnings=[],corruptIds=new Set();
 for(const e of events){
  if(seen.has(e.id)){
   const p=seen.get(e.id);const conflicting=p.requestId!==e.requestId||p.timestampMs!==e.timestampMs||p.type!==e.type;
   warnings.push({code:conflicting?'CONFLICTING_DUPLICATE_EVENT':'DUPLICATE_EVENT',eventId:e.id});
   if(conflicting){corruptIds.add(p.requestId);corruptIds.add(e.requestId);} continue;
  }
  seen.set(e.id,e);unique.push(e);
 }
 unique.sort((a,b)=>a.timestampMs-b.timestampMs||a.index-b.index);
 const byRequest=new Map();for(const e of unique){const a=byRequest.get(e.requestId)||[];a.push(e);byRequest.set(e.requestId,a);}
 const findings=[];
 // Determine a unique request-response pairing only when it can be proven from the timestamps.
 for(const requestId of corruptIds){if(!byRequest.has(requestId)) findings.push({status:'INCONCLUSIVE',code:'CONFLICTING_EVENT_IDS',requestId,evidence:[],reason:'An event ID has contradictory content across request groups.'});}
 for(const [requestId,group] of byRequest){
  const req=group.filter(e=>e.type==='REQUEST');const res=group.filter(e=>e.type==='RESPONSE');
  const evidence=group.map(e=>e.id);
  if(corruptIds.has(requestId)){findings.push({status:'INCONCLUSIVE',code:'CONFLICTING_EVENT_IDS',requestId,evidence,reason:'An event ID has contradictory content.'});continue;}
  if(req.length>1||res.length>1){findings.push({status:'INCONCLUSIVE',code:'AMBIGUOUS_PAIRING',requestId,evidence,reason:'Repeated request/response IDs cannot establish a unique pairing.'});continue;}
  if(!req.length){findings.push({status:'INCONCLUSIVE',code:'UNMATCHED_RESPONSE',requestId,evidence});continue;}
  if(!res.length){findings.push({status:'INCONCLUSIVE',code:'MISSING_RESPONSE',requestId,evidence});continue;}
  if(res[0].timestampMs<req[0].timestampMs){findings.push({status:'INCONCLUSIVE',code:'CLOCK_OR_ORDER_CONFLICT',requestId,evidence,reason:'Response predates request.'});continue;}
  if(res[0].timestampMs===req[0].timestampMs){findings.push({status:'INCONCLUSIVE',code:'TIMESTAMP_RESOLUTION_AMBIGUITY',requestId,evidence,reason:'Equal timestamps cannot prove causal ordering.'});continue;}
  const elapsedMs=res[0].timestampMs-req[0].timestampMs;
  // Avoid unsafe precision loss at the numeric boundary.
  if(!Number.isSafeInteger(elapsedMs)){findings.push({status:'INCONCLUSIVE',code:'TIMESTAMP_PRECISION_LOSS',requestId,evidence});continue;}
  const isLate=elapsedMs>thresholdMs;
  findings.push({status:isLate?'VIOLATION':'PASS',code:isLate?'DEADLINE_EXCEEDED':'WITHIN_DEADLINE',requestId,evidence,elapsedMs,thresholdMs,confidence:'DETERMINISTIC_TIMING_CHECK'});
 }
 const counts={pass:findings.filter(f=>f.status==='PASS').length,violation:findings.filter(f=>f.status==='VIOLATION').length,inconclusive:findings.filter(f=>f.status==='INCONCLUSIVE').length};
 // An ambiguous finding must never be buried by passing samples.
 const status=counts.violation?'VIOLATION':counts.inconclusive||!findings.length?'INCONCLUSIVE':'PASS';
 return {status,totalEvents:events.length,processedEvents:unique.length,thresholdMs,counts,findings,warnings,disclaimer:'Evidence supports timing findings only; synthetic replay cannot prove a real-world root cause or functional-safety compliance.'};
}
export function replayScenario({responseDelayMs=18,thresholdMs=10,requestId='demo-1'}={}){
 threshold(thresholdMs);
 if(!Number.isSafeInteger(responseDelayMs)||responseDelayMs<0||responseDelayMs>MAX_DURATION)throw new Error('Invalid delay');
 if(!checkString(requestId))throw new Error('Invalid request ID');
 const events=[{id:'req-1',requestId,timestampMs:0,type:'REQUEST'},{id:'resp-1',requestId,timestampMs:responseDelayMs,type:'RESPONSE'}];
 return {events,result:analyzeTrace(events,{thresholdMs}),simulation:true,limitation:'Controlled event-pair simulation only; not reproduction of actual program execution.'};
}
export function investigateWhatIf({events,thresholdMs=10,proposedThresholdMs=10,simulatedResponseDelayMs=8}={}){
 const baseline=analyzeTrace(events,{thresholdMs});const changedThreshold=analyzeTrace(events,{thresholdMs:proposedThresholdMs});
 const simulated=replayScenario({responseDelayMs:simulatedResponseDelayMs,thresholdMs});
 return {baseline,changedThreshold,simulated,interpretation:baseline.status==='INCONCLUSIVE'?'Source trace is ambiguous; no confirmed diagnosis.':baseline.status==='VIOLATION'&&changedThreshold.status==='PASS'?'Raising the threshold changes classification, but does NOT repair the observed delay.':'Compare the evidence and simulated case; results alone do not identify a root cause.',proofLevel:'TIMING_EXPERIMENT_ONLY'};
}
export function exportEvidenceReport(args){
 const result=investigateWhatIf(args);
 return {project:'AVIRA_Reloaded_Builder_TraceProof',reportVersion:2,source:'User-supplied structured events / synthetic demonstrations',parameters:{thresholdMs:args.thresholdMs??10,proposedThresholdMs:args.proposedThresholdMs??10,simulatedResponseDelayMs:args.simulatedResponseDelayMs??8},...result,limitations:['No physical root cause proven','No ISO 26262 certification','No external system modified','No AI diagnosis accuracy established']};
}

/** Evidence-grounded hypothesis proposal. Suggestions are deterministic, not AI-generated or causal proof. */
export function proposeExperiment({events,thresholdMs=10}={}) {
 const baseline=analyzeTrace(events,{thresholdMs});
 const late=baseline.findings.filter(f=>f.code==='DEADLINE_EXCEEDED');
 if(!late.length) return {baseline,proposals:[],message:baseline.status==='PASS'?'No timing violation in this trace.':'Insufficient unambiguous evidence to propose a timing-fix experiment.'};
 const worst=late.reduce((a,b)=>b.elapsedMs>a.elapsedMs?b:a);
 return {baseline,proposals:[
  {id:'reduce-delay',title:'What if the response were faster?',kind:'BEHAVIOR_CHANGE_SIMULATION',requestId:worst.requestId,evidence:worst.evidence,observedMs:worst.elapsedMs,proposedDelayMs:Math.max(1,Math.floor(thresholdMs*0.8)),thresholdMs,explainer:'Simulate a faster response without changing the required deadline. This is not evidence a production optimization is achievable.'},
  {id:'relax-deadline',title:'What if the deadline were relaxed?',kind:'POLICY_CHANGE',requestId:worst.requestId,evidence:worst.evidence,observedMs:worst.elapsedMs,proposedThresholdMs:Math.ceil(worst.elapsedMs),thresholdMs,explainer:'Changing the threshold can change classification without improving actual timing. Requires engineering and safety review.'}
 ],message:'Two bounded counterfactual experiments are available for explicit human review.'};
}
/** A bounded, reversible diagnostic experiment; never mutates actual software. */
export function evaluateApprovedExperiment({events,thresholdMs=10,proposalId,approved=false,proposedDelayMs,proposedThresholdMs}={}){
 const plan=proposeExperiment({events,thresholdMs});
 if(!approved)return {status:'AWAITING_HUMAN_APPROVAL',baseline:plan.baseline,proposalId,simulation:false};
 const proposal=plan.proposals.find(x=>x.id===proposalId);
 if(!proposal)throw new Error('Unknown or unsupported proposal');
 if(proposalId==='reduce-delay'){
  const delay=proposedDelayMs??proposal.proposedDelayMs;
  const experiment=replayScenario({responseDelayMs:delay,thresholdMs});
  return {status:'EXPERIMENT_COMPLETED',experimentType:'BEHAVIOR_CHANGE_SIMULATION',baseline:plan.baseline,proposal,experiment,observation:experiment.result.status==='PASS'?'Selected synthetic response satisfies the original deadline.':'Selected synthetic response does not satisfy the original deadline.',claim:'Synthetic timing behavior only; real system repair not established.'};
 }
 const next=proposedThresholdMs??proposal.proposedThresholdMs;
 const comparison=analyzeTrace(events,{thresholdMs:next});
 return {status:'EXPERIMENT_COMPLETED',experimentType:'POLICY_CHANGE',baseline:plan.baseline,proposal,comparison,observation:comparison.status==='PASS'?'Classification changes under revised deadline.':'At least one issue or ambiguity remains under revised deadline.',claim:'Changing a deadline does not improve actual response time or establish functional safety.'};
}
