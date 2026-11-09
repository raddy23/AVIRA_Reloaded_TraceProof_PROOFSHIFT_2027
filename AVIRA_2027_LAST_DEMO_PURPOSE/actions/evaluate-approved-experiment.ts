import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { evaluateApprovedExperiment } from '../lib/traceproof.mjs';

const record = z.object({
  id: z.string().min(1).max(128),
  requestId: z.string().min(1).max(128),
  timestampMs: z.number().int().nonnegative(),
  type: z.enum(['REQUEST', 'RESPONSE'])
});
const transportedRecord = z.union([record, z.string().max(2048)]);
export default defineAction({
  readOnly: true,
  http: { method: 'GET' },
  description: 'Evaluate a human-approved synthetic timing experiment without changing live systems.',
  schema: z.object({
    events: z.array(transportedRecord).max(2000),
    thresholdMs: z.number().positive().max(3600000).default(100),
    proposalId: z.enum(['reduce-delay', 'relax-deadline']),
    approved: z.union([z.boolean(), z.enum(['true', 'false'])]).default(false),
    proposedDelayMs: z.number().int().nonnegative().max(3600000).optional(),
    proposedThresholdMs: z.number().positive().max(3600000).optional()
  }),
  run: async (args) => {
    const events = args.events.map((event, i) => {
      if (typeof event !== 'string') return event;
      try { return record.parse(JSON.parse(event)); }
      catch { throw new Error(`Invalid structured event at index ${i}`); }
    });
    return evaluateApprovedExperiment({
      events, thresholdMs: args.thresholdMs, proposalId: args.proposalId,
      approved: args.approved === true || args.approved === 'true',
      ...(args.proposedDelayMs !== undefined ? { proposedDelayMs: args.proposedDelayMs } : {}),
      ...(args.proposedThresholdMs !== undefined ? { proposedThresholdMs: args.proposedThresholdMs } : {})
    });
  }
});
