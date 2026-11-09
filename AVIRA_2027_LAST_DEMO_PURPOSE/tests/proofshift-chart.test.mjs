import test from 'node:test';
import assert from 'node:assert/strict';
import { chartValues } from '../lib/proofshift-chart.mjs';
test('checkout baseline violation and approved faster PASS',()=>{const x=chartValues({originalMs:180,deadlineMs:100,proposedMs:80,experimentComplete:true});assert.equal(x.originalViolation,true);assert.equal(x.simulatedViolation,false);assert.equal(x.simulated,80)});
test('changing only deadline does not modify duration',()=>{const x=chartValues({originalMs:180,deadlineMs:100,proposedMs:180,proposedDeadlineMs:200,experimentComplete:true});assert.equal(x.original,180);assert.equal(x.simulated,180);assert.equal(x.simulatedViolation,false)});
test('unapproved run does not display synthetic result',()=>{const x=chartValues({originalMs:180,deadlineMs:100,proposedMs:80,experimentComplete:false});assert.equal(x.simulated,null);assert.equal(x.simulatedViolation,null)});
test('incomplete evidence remains inconclusive',()=>{const x=chartValues({originalMs:null,deadlineMs:50,experimentComplete:false});assert.equal(x.originalViolation,null);assert.equal(x.original,null)});
test('malformed and unsafe numbers become unknown',()=>{const x=chartValues({originalMs:Infinity,deadlineMs:-1,proposedMs:NaN,experimentComplete:true});assert.equal(x.original,null);assert.equal(x.limit,null);assert.equal(x.simulated,null)});
