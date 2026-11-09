import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { buildProofPack } from '../lib/proofpack.mjs';

export default defineAction({
  description: 'Generate a portable, reproducible regression-test package ONLY for an explicitly human-approved synthetic AVIRA incident experiment. If approval is missing, return awaiting approval. Report limitations clearly.',
  schema:z.object({
    scenario:z.enum(['checkout','automotive','incomplete']).default('checkout'),
    proposalId:z.enum(['reduce-delay','relax-deadline']).default('reduce-delay'),
    approved:z.boolean().default(false).describe('Must be confirmed by the human user; do not invent consent'),
    proposedDelayMs:z.number().int().min(1).max(3600000).optional(),
    proposedThresholdMs:z.number().positive().max(3600000).optional()
  }),
  http:{method:'GET'},
  run:async (input)=>buildProofPack(input)
});
