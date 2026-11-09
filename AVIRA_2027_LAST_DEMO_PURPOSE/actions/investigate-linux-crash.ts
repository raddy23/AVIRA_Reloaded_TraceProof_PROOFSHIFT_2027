import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { investigateLinuxCrash } from '../lib/crash-memory.mjs';
export default defineAction({
 description:'Investigate a synthetic Linux SIGSEGV, detect recurring crash signatures from example history, and compare two diagnostic choices (GDB core triage vs AddressSanitizer reproduction) with pros, cons, effort, expected overhead, usefulness and verification status. Never claim a fix was executed.',
 schema:z.object({hasCore:z.boolean().default(true),canRebuild:z.boolean().default(true),reproducible:z.boolean().default(false)}),
 http:{method:'GET'},
 run:async args=>investigateLinuxCrash(args)
});
