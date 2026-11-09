import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { analyzeTrace } from '../lib/traceproof.mjs';

const record = z.object({
  id: z.string().min(1).max(128),
  requestId: z.string().min(1).max(128),
  timestampMs: z.number().int().nonnegative(),
  type: z.enum(['REQUEST', 'RESPONSE'])
});
// GET transport can serialize array items into JSON strings. Declare both forms
// so Agent-Native's outer action validation accepts them before run() executes.
const transportedRecord = z.union([record, z.string().max(2048)]);

export default defineAction({
  readOnly: true,
  http: { method: 'GET' },
  description: 'Analyze supported structured REQUEST and RESPONSE events and cite their evidence IDs.',
  schema: z.object({
    events: z.array(transportedRecord).max(2000),
    thresholdMs: z.number().positive().max(3600000).default(100)
  }),
  run: async ({ events, thresholdMs }) => {
    const parsed = events.map((event, i) => {
      if (typeof event !== 'string') return event;
      try { return record.parse(JSON.parse(event)); }
      catch { throw new Error(`Invalid structured event at index ${i}`); }
    });
    return analyzeTrace(parsed, { thresholdMs });
  }
});
