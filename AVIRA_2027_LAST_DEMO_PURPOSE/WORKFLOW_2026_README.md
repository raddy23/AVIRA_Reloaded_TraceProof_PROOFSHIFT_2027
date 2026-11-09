# AVIRA TraceProof — 2026 Workflow Edition

The focus of this release is **a complete, explainable user journey** rather than more unsupported domains.

## Run in the existing Agent-Native starter (Windows)

1. Extract this ZIP.
2. Open PowerShell in this extracted folder and run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\INSTALL_AND_VERIFY.ps1`.
3. The installer copies the `actions/`, `lib/` and React dashboard and registers `/traceproof`. It checks TypeScript against your **actual** installed Agent-Native starter.
4. Run `cd "$HOME\AVIRA-Hackathon\avira-traceproof-agent"` and `pnpm.cmd dev`.
5. In the browser, type **exactly** `http://localhost:8080/traceproof` (use the server's reported port).

## 30-second demonstration

1. Click **Run 30-second demo**. The e-commerce events (request at 1000 ms, response at 1180 ms) load and the dashboard calls the shared `analyze-trace` action with a 100 ms limit.
2. Expected: **VIOLATION**, 180 ms observed, 80 ms over limit, evidence IDs `payment-req`, `payment-resp`.
3. Under **Two choices**, select **A: Reduce response delay**, input **80**, tick human approval, and click **Run my approved experiment**. Expected modeled classification **PASS**.
4. Choose **B: Change deadline** to show why relaxing a threshold is **not** repairing performance.
5. Download the investigation report JSON. Use **Clear / Start over** to try automotive, missing response, healthy reference, contradictory evidence (ProofGuard), or upload a structured `.json`, `.csv`, `.txt`.

## Files accepted

JSON: array of `{id, requestId, timestampMs, type}` records, or `{ "events": [...] }`.
CSV: header `id,requestId,timestampMs,type` with simple comma-delimited values (embedded quoted commas not supported).
TXT: JSON text in the above format; **not arbitrary unstructured logs**.

## Human + AI

The React UI invokes the `analyze-trace` and `evaluate-approved-experiment` Agent-Native actions. In connected Agent-Native chat, ask: `Call analyze-trace with events [{"id":"payment-req","requestId":"checkout-42","timestampMs":1000,"type":"REQUEST"},{"id":"payment-resp","requestId":"checkout-42","timestampMs":1180,"type":"RESPONSE"}] and thresholdMs 100; explain the evidence and possible next test.`
The chat must show an **actual tool invocation** to count as live agent verification.

## Claims and limitations

- Deterministic event correlation is a working analysis capability. Synthetic model comparisons do not reproduce a real crash or repair production code.
- No raw PCAP, CAN, DLT, GDB core, or unstructured application log parser is included.
- This source overlay does not contain the whole generated Agent-Native starter; publish the **integrated** starter after checking secrets.
- Browser testing and live AI invocation on your Windows machine remain required before claiming full compliance.

## Test

`node --test tests/*.test.mjs`

## Competition

Mandatory public Clips recording and entry form: https://www.builder.io/hackathon/submit . GitHub and slides URLs are optional.
