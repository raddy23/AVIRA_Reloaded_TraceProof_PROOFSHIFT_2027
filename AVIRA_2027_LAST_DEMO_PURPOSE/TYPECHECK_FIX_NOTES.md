# TypeScript exactOptionalPropertyTypes fix — November 8, 2026

Your Windows TypeScript errors (TS2379) were caused by two `.d.mts` declarations accepting `number` but not explicitly accepting `undefined` for optional arguments. Both `proposedThresholdMs` declarations now accept `number | undefined`:

- `lib/incident-lab.d.mts` — `runIncidentExperiment`
- `lib/traceproof.d.mts` — `evaluateApprovedExperiment`

The earlier declaration for `proposedDelayMs` and `lib/crash-memory.d.mts` are preserved. Run `INSTALL_AND_VERIFY.ps1` again to copy the new declarations into your already-installed Agent-Native starter and run its TypeScript checker.

The local Node.js tests are not proof of success in the Windows Agent-Native TypeScript environment; only your rerun can confirm that.
