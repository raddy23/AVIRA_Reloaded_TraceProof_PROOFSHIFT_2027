# AVIRA TraceProof — user-facing evidence importer fix

## What changed
- Clear on-page description of the actual purpose, supported data and how to use the tool.
- Built-in e-commerce, automotive and missing-response examples, each ready to analyze.
- Upload `.json`, `.csv`, or `.txt` files containing supported **structured** event records. These are not general-purpose plaintext logs.
- Paste/edit JSON or simple CSV, download both sample formats.
- Input validation with readable error messages; 600 KB / 2,000 event interactive limit.
- A distinct **Analyze evidence** button. The `analyze-trace` shared Agent-Native action is **not called on initial page load**.
- Findings, evidence IDs, classification, animated timing comparison, explicit what-if approvals and report downloads.
- The `evaluate-approved-experiment` shared action runs only after approval and pressing the experiment button.

## Required input schema
A JSON array (or `{ "events": [...] }`) of objects:

```json
[
  {"id":"payment-req","requestId":"checkout-42","timestampMs":1000,"type":"REQUEST"},
  {"id":"payment-resp","requestId":"checkout-42","timestampMs":1180,"type":"RESPONSE"}
]
```

Or CSV with header `id,requestId,timestampMs,type`.

Timestamps must be on the same clock, in integer milliseconds. The app does not currently parse arbitrary Linux logs, packet capture binaries, DLT, CAN logs, core dumps, CAD files, or medical/industrial sensor formats.

## Installation

In PowerShell after extracting this ZIP:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\INSTALL_AND_VERIFY.ps1"
```

The default destination is `$HOME\AVIRA-Hackathon\avira-traceproof-agent`.

Start the official starter with `pnpm.cmd dev` and browse to `http://localhost:8080/traceproof` (use actual printed port). Click **Try e-commerce**, then **Analyze evidence**. The result should be `VIOLATION`, with 180 ms versus 100 ms, and evidence IDs `payment-req`, `payment-resp`.

## Caveats

- Node 80/80 deterministic engine tests passed in this container. The new React page passed a TypeScript **syntax transpilation** check, not a full build in the user's Windows Agent-Native project.
- The AI provider was not connected or exercised in this environment. Real live agent tool invocation remains unverified.
- If the action does not return a result and command windows appear, review the official framework's Windows action-runner behavior. This page no longer auto-launches the four actions on initial load.
- Synthetic passing what-if tests cannot prove a production repair.
