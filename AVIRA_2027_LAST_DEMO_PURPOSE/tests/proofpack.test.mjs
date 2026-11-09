import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProofPack } from '../lib/proofpack.mjs';

test('proof pack cannot be created without explicit approval',()=>{
 assert.equal(buildProofPack({scenario:'checkout',approved:false}).status,'AWAITING_HUMAN_APPROVAL');
});
test('approved checkout yields a portable regression recipe with source IDs',()=>{
 const pack=buildProofPack({scenario:'checkout',approved:true,proposalId:'reduce-delay',proposedDelayMs:80});
 assert.equal(pack.status,'PACK_READY');assert.equal(pack.experimentStatus,'PASS');
 assert.deepEqual(pack.evidenceIds,['payment-req','payment-resp']);
 assert.match(pack.testSource,/node:test/);
});
test('changing only acceptance policy does not imply physical improvement',()=>{
 const pack=buildProofPack({scenario:'automotive',approved:true,proposalId:'relax-deadline',proposedThresholdMs:20});
 assert.equal(pack.status,'PACK_READY');assert.equal(pack.experimentStatus,'PASS');
 assert.match(pack.interpretation,/observed response is unchanged/);
});
test('incomplete evidence never exports a proved violation regression test',()=>{
 const pack=buildProofPack({scenario:'incomplete',approved:true,proposalId:'reduce-delay'});
 assert.equal(pack.status,'INSUFFICIENT_EVIDENCE');
});
test('unsupported scenarios and proposal IDs are rejected',()=>{
 assert.throws(()=>buildProofPack({scenario:'bogus',approved:true}),/Unsupported incident/);
 assert.throws(()=>buildProofPack({scenario:'checkout',proposalId:'bad',approved:true}),/Unsupported proposal/);
});
