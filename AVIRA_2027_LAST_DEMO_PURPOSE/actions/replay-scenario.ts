import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { replayScenario } from '../lib/traceproof.mjs';
export default defineAction({
  readOnly:true,
  description:'Run a deterministic, synthetic timing scenario only; never executes real software or commands.',
  schema:z.object({responseDelayMs:z.number().int().min(0).max(3600000).default(18),thresholdMs:z.number().positive().max(3600000).default(10)}),
  run:async ({responseDelayMs,thresholdMs})=>replayScenario({responseDelayMs,thresholdMs})
});
