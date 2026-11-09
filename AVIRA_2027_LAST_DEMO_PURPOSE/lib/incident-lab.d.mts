import type {EventRecord} from './traceproof.mjs';
export type Scenario='checkout'|'automotive'|'incomplete';
export declare const INCIDENTS:Record<Scenario,any>;
export declare function getIncident(id?:string):{events:EventRecord[];[key:string]:any};
export declare function investigateIncident(args?:{scenario?:Scenario}):any;
export declare function runIncidentExperiment(args?:{scenario?:Scenario;proposalId?:'reduce-delay'|'relax-deadline';approved?:boolean;proposedDelayMs?:number | undefined;proposedThresholdMs?:number | undefined}):any;
