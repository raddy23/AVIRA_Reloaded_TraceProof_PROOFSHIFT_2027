import { analyzeTrace, proposeExperiment, evaluateApprovedExperiment } from './traceproof.mjs';

// Synthetic and openly labeled training incidents; no production-system claims.
export const INCIDENTS = Object.freeze({
  checkout: {
    id:'checkout', title:'Checkout stalls at payment authorization',
    domain:'E-commerce', application:'SampleShop', service:'PaymentService',
    operation:'POST /payments/authorize', sender:'OrderService',receiver:'PaymentService',
    problem:'A customer reports a slow checkout. The only observed defect in the supplied trace is a late payment response.',
    thresholdMs:100, observedMs:180,
    events:[
      {id:'payment-req',requestId:'checkout-42',timestampMs:1000,type:'REQUEST'},
      {id:'payment-resp',requestId:'checkout-42',timestampMs:1180,type:'RESPONSE'}
    ]
  },
  automotive: {
    id:'automotive',title:'Infotainment SOME/IP service deadline violation',
    domain:'Automotive',application:'InfotainmentDemo',service:'VehicleDataService',
    operation:'GetVehicleSpeed (illustrative operation)',sender:'HMIClient',receiver:'VehicleDataService',
    problem:'The infotainment client receives a synthetic service response after its configured deadline; no real ECU trace or ISO 26262 validation is claimed.',
    thresholdMs:10,observedMs:18,
    events:[
      {id:'someip-req',requestId:'someip-demo-7',timestampMs:100,type:'REQUEST'},
      {id:'someip-resp',requestId:'someip-demo-7',timestampMs:118,type:'RESPONSE'}
    ]
  },
  incomplete: {
    id:'incomplete',title:'No response recorded — evidence incomplete',
    domain:'Cloud services',application:'SupportPortalDemo',service:'NotificationService',
    operation:'POST /notify',sender:'OrderService',receiver:'NotificationService',
    problem:'No matching response is present in this synthetic trace. This is not proof of packet loss or a crash.',
    thresholdMs:50,observedMs:null,
    events:[{id:'notify-req',requestId:'notify-12',timestampMs:100,type:'REQUEST'}]
  }
});
export function getIncident(id='checkout') {
  if(typeof id!=='string' || !Object.hasOwn(INCIDENTS,id)) throw new Error('Unsupported incident');
  const i=INCIDENTS[id];return {...i, events:i.events.map(e=>({...e}))};
}
export function investigateIncident({scenario='checkout'}={}) {
  const i=getIncident(scenario);
  const result=analyzeTrace(i.events,{thresholdMs:i.thresholdMs});
  const suggestions=proposeExperiment({events:i.events,thresholdMs:i.thresholdMs});
  return {
    scenario:i.id,title:i.title,domain:i.domain,application:i.application,service:i.service,
    operation:i.operation,sender:i.sender,receiver:i.receiver,problem:i.problem,
    thresholdMs:i.thresholdMs,observedMs:i.observedMs,events:i.events,
    analysis:result, proposals:suggestions.proposals,
    suggestedNextStep: result.status==='VIOLATION'
      ?'Review the matched evidence IDs. Choose whether to test a faster synthetic response or a relaxed acceptance deadline.'
      :'Gather a matching response and correlation data; a missing event does not establish a root cause.',
    evidenceScope:'Synthetic demonstration events. Timing classification is deterministic; causal diagnosis is not established.'
  };
}
export function runIncidentExperiment({scenario='checkout', proposalId='reduce-delay', approved=false, proposedDelayMs, proposedThresholdMs}={}) {
  const i=getIncident(scenario);
  const allowed=['reduce-delay','relax-deadline'];if(!allowed.includes(proposalId))throw new Error('Unsupported proposal');
  const result=evaluateApprovedExperiment({events:i.events,thresholdMs:i.thresholdMs,proposalId,approved,proposedDelayMs,proposedThresholdMs});
  return {scenario:i.id,application:i.application,service:i.service,operation:i.operation,...result};
}
