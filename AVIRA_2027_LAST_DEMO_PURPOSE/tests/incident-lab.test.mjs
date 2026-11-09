import test from 'node:test';
import assert from 'node:assert/strict';
import { INCIDENTS, getIncident, investigateIncident, runIncidentExperiment } from '../lib/incident-lab.mjs';

test('three well-labeled cases are available',()=>assert.deepEqual(Object.keys(INCIDENTS),['checkout','automotive','incomplete']));
test('checkout identifies payment operation with source evidence',()=>{
 const x=investigateIncident({scenario:'checkout'});
 assert.equal(x.analysis.status,'VIOLATION');
 assert.equal(x.analysis.findings[0].elapsedMs,180);
 assert.equal(x.service,'PaymentService');assert.equal(x.operation,'POST /payments/authorize');
 assert.deepEqual(x.analysis.findings[0].evidence,['payment-req','payment-resp']);
});
test('automotive identifies slow service with evidence',()=>{
 const x=investigateIncident({scenario:'automotive'});
 assert.equal(x.analysis.status,'VIOLATION');assert.equal(x.analysis.findings[0].elapsedMs,18);
 assert.equal(x.thresholdMs,10);
});
test('incomplete event produces inconclusive and no fixes',()=>{
 const x=investigateIncident({scenario:'incomplete'});
 assert.equal(x.analysis.status,'INCONCLUSIVE');assert.deepEqual(x.proposals,[]);
});
test('unapproved proposal never executes',()=>{
 const x=runIncidentExperiment({scenario:'checkout',proposalId:'reduce-delay',approved:false});
 assert.equal(x.status,'AWAITING_HUMAN_APPROVAL');
});
test('simulated faster response meets original deadline',()=>{
 const x=runIncidentExperiment({scenario:'checkout',proposalId:'reduce-delay',approved:true,proposedDelayMs:80});
 assert.equal(x.experiment.result.status,'PASS');assert.equal(x.experimentType,'BEHAVIOR_CHANGE_SIMULATION');
});
test('relaxing deadline does not change actual duration',()=>{
 const x=runIncidentExperiment({scenario:'checkout',proposalId:'relax-deadline',approved:true,proposedThresholdMs:200});
 assert.equal(x.comparison.status,'PASS');assert.match(x.claim,/does not improve actual response time/);
});
test('unknown scenario rejected',()=>assert.throws(()=>getIncident('arbitrary'),/Unsupported incident/));
test('unsupported proposal rejected',()=>assert.throws(()=>runIncidentExperiment({scenario:'checkout',proposalId:'erase-data'}),/Unsupported proposal/));
test('incomplete case cannot complete proposed experiment',()=>assert.throws(()=>runIncidentExperiment({scenario:'incomplete',proposalId:'reduce-delay',approved:true}),/unsupported proposal/i));
test('sample data cannot be modified across investigations',()=>{
 const a=getIncident('checkout');a.events[0].timestampMs=999999;
 assert.equal(getIncident('checkout').events[0].timestampMs,1000);
});
