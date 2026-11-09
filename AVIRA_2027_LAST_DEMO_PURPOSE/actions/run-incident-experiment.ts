import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { runIncidentExperiment } from '../lib/incident-lab.mjs';

export default defineAction({
  description:'Evaluate a human-approved synthetic what-if experiment for an AVIRA demo incident. NEVER modify the actual application. If approved=false, only report awaiting approval. Agent must not falsely assert human approval.',
  schema:z.object({
    scenario:z.enum(['checkout','automotive','incomplete']).default('checkout'),
    proposalId:z.enum(['reduce-delay','relax-deadline']),
    approved:z.boolean().default(false).describe('True only after actual user confirmation; the agent must not invent approval'),
    proposedDelayMs:z.number().int().min(1).max(3600000).optional(),
    proposedThresholdMs:z.number().positive().max(3600000).optional()
  }),
  // GET only for read-only simulated calculations. For real mutation, use access checks and non-GET methods.
  http:{method:'GET'},
  run:async(args)=>runIncidentExperiment(args)
});
