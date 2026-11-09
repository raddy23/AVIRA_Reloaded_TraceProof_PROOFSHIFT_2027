# AVIRA_Reloaded_TraceProof_PROOFSHIFT_2027

## Failure Memory + ProofChoice + ProofShift — runnable local prototype

**Tagline:** Remember the failure. Compare the options. Preserve the proof.

### What is actually working

This package contains an **independently runnable, zero-dependency Node.js web prototype** for Linux crash recurrence. It also retains the existing Agent-Native `defineAction()` source and React route overlay, but the standalone browser server is **not itself the official Agent-Native framework**. Do not submit the standalone app as evidence of live Agent-Native integration without verifying the separate framework starter.

- Editable structured Linux crash JSON (executable, architecture, signal, optional build ID and stack frames).
- Deterministic crash fingerprint and recurrence history matching. Different known build IDs cannot be treated as exact matches; similar signatures are never root-cause proof.
- Local persistent crash history in `data/crash-history.json` (automatically seeded with clearly synthetic data on first run).
- Two diagnostic paths: **GDB + core** vs **reproduce with AddressSanitizer**, compared by prerequisites, benefits, drawbacks, qualitative investigation time and runtime overhead.
- Human-authored proposed actions/fixes and separately recorded test verification. `TESTED_PASSED` is a *human-attested* status requiring evidence text, **not** automated repair verification.
- 3D-style animated bars driven by counts of recurrence matches and ready diagnostic paths, with pause control and reduced-motion preference.
- Downloadable JSON ProofPack with evidence, choices, history and caveats.
- Existing timing investigation source, fixtures and React/Agent-Native action definitions are included for later integration.

### Start on Windows PowerShell

1. Extract the ZIP to any folder. Open PowerShell **inside the extracted project folder**.
2. Run:

```powershell
node --version
node .\server.mjs
```

3. In the browser, open **http://localhost:4173/**.
4. To run all automated tests, open a second PowerShell window in that folder and run:

```powershell
node --test tests/*.test.mjs
```

Alternative launch:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\RUN_WINDOWS.ps1
```

No `npm install`, backend API keys or paid cloud account is required **for the standalone prototype**. The demo listens on localhost only. Set a different port if needed: `$env:PORT=4174; node .\server.mjs`.

### Five-minute manual test

1. Select **Linux Crash Lab**. A synthetic `vehicle-service` SIGSEGV is loaded.
2. Click **Investigate & match**: see 2 matching historical crash records; one with a different known build ID is excluded.
3. With **Core dump exists** checked, GDB is the preferred *diagnostic path*.
4. Uncheck core, check **Can rebuild** and **Crash reproducible**; AddressSanitizer becomes preferred.
5. Click **Save occurrence**; the history count increases and persists after refreshing/restarting the server.
6. Select your new occurrence. Save a proposed action such as “Audit pointer lifetime in SensorManager::read()”.
7. Set verification to `REPRODUCED_NOT_FIXED`; enter a real evidence reference **only if you performed that test**. Otherwise keep `UNVERIFIED`.
8. Click **Export ProofPack JSON**. Inspect the downloaded evidence, options, history and disclaimers.
9. Click **Timing Evidence Lab** for the independent timing explorer.

### Data model and API

`GET /api/health`: health status. `GET /api/history`: persistent history and synthetic sample. `POST /api/investigate`: crash with flags `hasCore`, `canRebuild`, `reproducible`. `POST /api/incidents`: persist an occurrence. `POST /api/incidents/:id/fix`: save proposed action. `POST /api/incidents/:id/verify`: human-attested outcome with required test evidence for non-`UNVERIFIED` statuses. `POST /api/scenario`: investigate a sample timing scenario. All endpoints accept/return JSON. Storage is a local JSON file, **not concurrent-production-grade** persistence. Do not expose this unauthenticated demo on a public network.

### Safety and limitations

No actual Linux core is decoded; no GDB, AddressSanitizer, hardware fault injector, kernel instrumentation or real patch is executed. The application does not automatically solve arbitrary crashes, establish root cause, quantify intervention latency or demonstrate a production fix. Do not upload confidential logs. History data remains on the local computer; remove `data/crash-history.json` to reset to synthetic samples on next launch. This is not for medical, banking, automotive safety, production repair or critical infrastructure decisions.

### Agent-Native integration (separate validation)

To overlay the action source and React dashboard on the official starter, follow `INSTALL_WINDOWS.ps1` and the primary `README.md`. Run the starter with `pnpm.cmd dev` in your existing folder, verify actual agent-to-action calls and dashboard calls, then record a real Clips demonstration. The standalone browser test is not a substitute for this.

### Publishing to GitHub

Once tested locally, exclude API keys, personal customer logs, cores and `data/`. Use `git init`, `git add .`, `git commit -m "Working ProofShift Failure Memory prototype"`, and publish to a repository of the same project name. There is no open-source license implied by this source package.
