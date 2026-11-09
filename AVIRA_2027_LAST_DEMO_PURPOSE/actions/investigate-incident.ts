import { defineAction } from '@agent-native/core/action';
import { z } from 'zod';
import { investigateIncident } from '../lib/incident-lab.mjs';

export default defineAction({
  description:'Investigate one of the three synthetic AVIRA incidents (checkout, automotive, incomplete). Returns exact application, service, operation, source event evidence, uncertainty, and human-review experiment proposals. Prefer this action when asked to investigate the demo incidents. Never invent a production root cause.',
  schema:z.object({scenario:z.enum(['checkout','automotive','incomplete']).default('checkout').describe('Choose an example incident')}),
  http:{method:'GET'},
  run:async ({scenario})=>investigateIncident({scenario})
});
