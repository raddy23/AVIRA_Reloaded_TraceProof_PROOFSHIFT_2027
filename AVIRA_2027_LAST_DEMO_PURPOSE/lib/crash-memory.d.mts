/** Type declarations for the cross-runtime Linux crash investigation engine. */
export interface LinuxCrash {
  executable: string;
  signal: string;
  architecture: string;
  buildId?: string;
  frames: string[];
}
export interface CrashDecision {
  preferred: string | null;
  preferenceReason: string;
  paths: Array<Record<string, unknown>>;
  measuredTimeMs: null;
  measuredLatencyDeltaMs: null;
  disclaimer: string;
}
export interface CrashInvestigation {
  mode: 'SYNTHETIC_DEMO';
  crash: LinuxCrash;
  fingerprint: string;
  occurrences: number;
  matches: Array<Record<string, unknown>>;
  previousFixes: Array<Record<string, unknown>>;
  decision: CrashDecision;
  note: string;
}
export declare function investigateLinuxCrash(args?: {
  hasCore?: boolean;
  canRebuild?: boolean;
  reproducible?: boolean;
}): CrashInvestigation;
