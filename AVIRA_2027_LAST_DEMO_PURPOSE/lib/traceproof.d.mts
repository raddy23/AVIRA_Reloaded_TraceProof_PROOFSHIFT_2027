export interface EventRecord {id:string;requestId:string;timestampMs:number;type:'REQUEST'|'RESPONSE'}
export declare const MAX_EVENTS:number;
export declare const SAMPLE_TRACES:Record<string,EventRecord[]>;
export declare function analyzeTrace(input:EventRecord[],opts?:{thresholdMs?:number}):any;
export declare function replayScenario(args?:{responseDelayMs?:number;thresholdMs?:number;requestId?:string}):any;
export declare function investigateWhatIf(args:{events:EventRecord[];thresholdMs?:number;proposedThresholdMs?:number | undefined;simulatedResponseDelayMs?:number}):any;
export declare function exportEvidenceReport(args:{events:EventRecord[];thresholdMs?:number;proposedThresholdMs?:number | undefined;simulatedResponseDelayMs?:number}):any;
export declare function proposeExperiment(args:{events:EventRecord[];thresholdMs?:number}):any;
export declare function evaluateApprovedExperiment(args:{events:EventRecord[];thresholdMs?:number;proposalId:string;approved?:boolean;proposedDelayMs?:number | undefined;proposedThresholdMs?:number | undefined}):any;
