import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { proposeExperiment } from '../lib/traceproof.mjs';
const event=z.object({id:z.string().min(1).max(128),requestId:z.string().min(1).max(128),timestampMs:z.number().int().nonnegative().safe(),type:z.enum(['REQUEST','RESPONSE'])});
export default defineAction({readOnly:true,description:'Propose evidence-linked diagnostic experiments for human review; do not execute a change or claim causality.',schema:z.object({events:z.array(event).max(100000),thresholdMs:z.number().positive().max(3600000).default(10)}),run:async(args)=>proposeExperiment(args)});
