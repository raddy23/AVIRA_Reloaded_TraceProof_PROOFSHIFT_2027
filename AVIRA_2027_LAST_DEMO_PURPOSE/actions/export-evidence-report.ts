import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { exportEvidenceReport } from '../lib/traceproof.mjs';
const event=z.object({id:z.string().min(1).max(128),requestId:z.string().min(1).max(128),timestampMs:z.number().int().nonnegative().safe(),type:z.enum(['REQUEST','RESPONSE'])});
export default defineAction({
 description:'Generate a structured evidence-only report from user-provided traces, no claims of causal proof.',readOnly:true,
 schema:z.object({events:z.array(event).max(100000),thresholdMs:z.number().positive().max(3600000).default(10),proposedThresholdMs:z.number().positive().max(3600000).default(10),simulatedResponseDelayMs:z.number().int().min(0).max(3600000).default(8)}),
 run:async(args)=>exportEvidenceReport(args)
});
