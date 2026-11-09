import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTrace, replayScenario } from '../lib/traceproof.mjs';

const fixture = {
  "schemaVersion": 1,
  "scenario": "checkout",
  "sourceType": "SYNTHETIC_DEMONSTRATION",
  "baseline": {
    "events": [
      {
        "id": "payment-req",
        "requestId": "checkout-42",
        "timestampMs": 1000,
        "type": "REQUEST"
      },
      {
        "id": "payment-resp",
        "requestId": "checkout-42",
        "timestampMs": 1180,
        "type": "RESPONSE"
      }
    ],
    "thresholdMs": 100,
    "expectedStatus": "VIOLATION",
    "observedMs": 180,
    "sourceEventIds": [
      "payment-req",
      "payment-resp"
    ]
  },
  "intervention": {
    "kind": "reduce-delay",
    "proposedDelayMs": 80,
    "expectedStatus": "PASS"
  },
  "limitations": [
    "Does not prove production root cause",
    "Does not modify source code or a real system",
    "Human-approved model intervention, not measured production improvement"
  ]
};

test('baseline evidence reproduces the reported timing violation', () => {
  const result=analyzeTrace(fixture.baseline.events,{thresholdMs:fixture.baseline.thresholdMs});
  assert.equal(result.status, fixture.baseline.expectedStatus);
});

test('approved synthetic intervention matches the recorded expectation', () => {
  const result=fixture.intervention.kind==='reduce-delay'
    ? replayScenario({responseDelayMs:fixture.intervention.proposedDelayMs,thresholdMs:fixture.baseline.thresholdMs}).result
    : analyzeTrace(fixture.baseline.events,{thresholdMs:fixture.intervention.proposedThresholdMs});
  assert.equal(result.status,fixture.intervention.expectedStatus);
});
