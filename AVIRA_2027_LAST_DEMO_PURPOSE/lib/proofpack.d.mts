export function buildProofPack(input?:{
 scenario?:'checkout'|'automotive'|'incomplete';
 proposalId?:'reduce-delay'|'relax-deadline';
 approved?:boolean;
 proposedDelayMs?:number | undefined;
 proposedThresholdMs?:number | undefined;
}):any;
