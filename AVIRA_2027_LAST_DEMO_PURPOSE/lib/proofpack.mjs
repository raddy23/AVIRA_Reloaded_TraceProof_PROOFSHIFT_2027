import { investigateIncident, runIncidentExperiment } from './incident-lab.mjs';

/** Portable, reproducible evidence bundle. Only supported synthetic incident fixtures. */
export function buildProofPack({scenario='checkout',proposalId='reduce-delay',approved=false,proposedDelayMs,proposedThresholdMs}={}) {
  const investigation=investigateIncident({scenario});
  if(!approved) return {status:'AWAITING_HUMAN_APPROVAL',scenario,generated:false};
  if(investigation.analysis.status!=='VIOLATION') return {status:'INSUFFICIENT_EVIDENCE',scenario,generated:false,reason:'There is no unambiguous timing violation to turn into a regression test.'};
  const run=runIncidentExperiment({scenario,proposalId,approved,proposedDelayMs,proposedThresholdMs});
  const experimentalStatus=proposalId==='reduce-delay' ? run.experiment.result.status : run.comparison.status;
  const parameters=proposalId==='reduce-delay'
    ? {proposedDelayMs:proposedDelayMs??run.proposal.proposedDelayMs}
    : {proposedThresholdMs:proposedThresholdMs??run.proposal.proposedThresholdMs};
  const recipe={schemaVersion:1,scenario,sourceType:'SYNTHETIC_DEMONSTRATION',baseline:{events:investigation.events,thresholdMs:investigation.thresholdMs,expectedStatus:'VIOLATION',observedMs:investigation.observedMs,sourceEventIds:investigation.analysis.findings.flatMap(f=>f.evidence||[])},intervention:{kind:proposalId,...parameters,expectedStatus:experimentalStatus},limitations:['Does not prove production root cause','Does not modify source code or a real system','Human-approved model intervention, not measured production improvement']};
  // Construct a test from known safe values, never interpolate uploaded executable content.
  const testSource=`import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { analyzeTrace, replayScenario } from '../lib/traceproof.mjs';\n\nconst fixture = ${JSON.stringify(recipe,null,2)};\n\ntest('baseline evidence reproduces the reported timing violation', () => {\n  const result=analyzeTrace(fixture.baseline.events,{thresholdMs:fixture.baseline.thresholdMs});\n  assert.equal(result.status, fixture.baseline.expectedStatus);\n});\n\ntest('approved synthetic intervention matches the recorded expectation', () => {\n  const result=fixture.intervention.kind==='reduce-delay'\n    ? replayScenario({responseDelayMs:fixture.intervention.proposedDelayMs,thresholdMs:fixture.baseline.thresholdMs}).result\n    : analyzeTrace(fixture.baseline.events,{thresholdMs:fixture.intervention.proposedThresholdMs});\n  assert.equal(result.status,fixture.intervention.expectedStatus);\n});\n`;
  return {status:'PACK_READY',generated:true,scenario,application:investigation.application,service:investigation.service,operation:investigation.operation,evidenceIds:recipe.baseline.sourceEventIds,baselineStatus:investigation.analysis.status,experimentStatus:experimentalStatus,recipe,testSource,interpretation:proposalId==='relax-deadline'?'Policy change only; observed response is unchanged.':'Synthetic response-time assumption only; no real fix demonstrated.'};
}
