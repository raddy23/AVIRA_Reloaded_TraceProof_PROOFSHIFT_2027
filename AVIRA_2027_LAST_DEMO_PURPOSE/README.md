# AVIRA_Reloaded_TraceProof_PROOFSHIFT_2027

**AI Failure-to-Test Lab** · Builder.io Agent-Native Hackathon 2026

> Find the failure. Challenge the hypothesis. Export the evidence.

## Problem and value

Monitoring and debugging tools can reveal timing anomalies, but preparing a repeatable, evidence-linked experiment and a reviewable handoff often requires manual steps. **AVIRA TraceProof** gives engineers one limited but complete workflow for structured request-response traces: load evidence, inspect a deterministic timing result, choose a what-if assumption, explicitly approve an isolated synthetic calculation, visualize the reported result and export the record. A connected Agent-Native chat assistant can invoke the *same* `analyze-trace` action used by the UI.

**Important:** This prototype is not a universal debugger. It does not prove a production root cause, execute a real fix, or reproduce hardware failures. The dataset and outcomes shown in the demo are synthetic.

## 2026 interactive workflow edition

**Run 30-second demo** loads the e-commerce case, invokes the shared `analyze-trace` action and displays the measured 180 ms vs 100 ms outcome. **Step 1** accepts JSON, CSV and JSON-in-TXT; **Step 2** shows plain-language findings, graph and correlated evidence IDs; **Step 3** compares two options, requires explicit human approval and uses `evaluate-approved-experiment`. You can export a combined JSON report and reset the workspace. Contradictory evidence is reported INCONCLUSIVE, not forced into a false diagnosis.

For a short setup and demonstration script, read `WORKFLOW_2026_README.md`.

## What the user sees

1. **Purpose & how it works**: an animated five-step explanation of the problem and human–agent roles.
2. **Choose evidence**: e-commerce, automotive or missing-response sample; optionally upload/paste structured JSON, CSV or JSON-formatted TXT. **Clear / Start over** resets the page.
3. **Analyze evidence**: explicit button requests the shared Agent-Native `analyze-trace` action, then displays evidence IDs, observed duration, chosen limit and PASS/VIOLATION/INCONCLUSIVE status. Feedback and errors are visible on screen.
4. **Human-approved experiment**: choose simulated faster response or revised deadline, review the difference, approve and run `evaluate-approved-experiment`. The 3D-style chart uses the **returned action result**, not merely the typed what-if value.
5. **Export**: download analysis and experiment JSON reports. These are investigation artifacts, not proof of deployed fixes.

## Sample input files

| Sample | Type | Suggested limit | Expected synthetic result |
|---|---|---:|---|
| `samples/sample-checkout.json` | JSON | 100 ms | 180 ms: VIOLATION |
| `samples/sample-checkout.csv` | CSV | 100 ms | 180 ms: VIOLATION |
| `samples/sample-automotive.txt` | JSON-formatted text | 10 ms | 18 ms: VIOLATION |

Supported schema: `id,requestId,timestampMs,type`, with `REQUEST` or `RESPONSE`; timestamps are nonnegative integer milliseconds on the same clock. JSON accepts an array or `{ "events": [...] }`. CSV accepts simple unquoted records (no embedded commas). Input max 600 KB and 2,000 records. Raw `.pcap`, `.blf`, `.dlt`, Linux core dumps, arbitrary text logs and CAD data are **not** supported.

The limit is *editable*; the samples populate it automatically. An arbitrary custom trace cannot be declared a deadline violation without a user-supplied or trusted configured limit.

## Start from scratch — Windows (first-time users)

The ZIP is a **source overlay**, not the full Agent-Native starter. Install the official starter once, then add AVIRA. Do **not** put private API keys in a repository.

1. Install Node.js **22.22 or later** and Git. Open PowerShell. Use `.cmd` commands if PowerShell blocks npm or pnpm scripts.
2. Create the official Agent-Native Chat starter and install dependencies:

```powershell
New-Item -ItemType Directory -Force "$HOME\AVIRA-Hackathon" | Out-Null
cd "$HOME\AVIRA-Hackathon"
npx.cmd --yes @agent-native/core@latest create avira-traceproof-agent --standalone --template chat
cd "$HOME\AVIRA-Hackathon\avira-traceproof-agent"
corepack.cmd enable
pnpm.cmd install
```

3. Download this AVIRA ZIP and extract it. This example assumes the ZIP is named `AVIRA_2027_PURPOSE_GREEN_FINAL.zip` in `Downloads`:

```powershell
Expand-Archive -LiteralPath "$HOME\Downloads\AVIRA_2027_PURPOSE_GREEN_FINAL.zip" -DestinationPath "$HOME\AVIRA-Hackathon\AVIRA-Source" -Force
cd "$HOME\AVIRA-Hackathon\AVIRA-Source\AVIRA_TraceProof_2026_WORKFLOW_REDESIGN"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\INSTALL_AND_VERIFY.ps1"
```

4. The installer copies the AVIRA route, shared actions, library, examples and documentation into `avira-traceproof-agent`. It updates `app/routes.ts` and runs the TypeScript check. **Do not continue if it prints FAIL.**
5. Start the app:

```powershell
cd "$HOME\AVIRA-Hackathon\avira-traceproof-agent"
pnpm.cmd dev
```

6. Open the printed address plus `/traceproof`, normally `http://localhost:8080/traceproof`. Click **Purpose & how it works** to view the animated workflow.
7. For an immediate test, click **Run 30-second demo**. To use your own logs, find the **green “Upload your logs here”** section under **Step 1 — Input**, choose `.json`, `.csv` or structured `.txt`, review the deadline field, and click **Analyze evidence**. Your file is not analyzed until you click that button.
8. Choose an experiment, approve and run it; inspect the evidence and export the JSON report. For Agent-Native AI verification, connect a provider in `/home` and visibly invoke the `analyze-trace` tool.
9. To run the packaged deterministic tests, open the **extracted AVIRA source** folder and run:

```powershell
node --test tests/*.test.mjs
```

**How to interpret output:** PASS/VIOLATION/INCONCLUSIVE refers to the configured request-response limit and evidence sufficiency; the two what-if paths are *synthetic*, not actual production fixes. For custom files, the limit is an editable assumption and must be based on your system's requirement for a meaningful deadline verdict.

### Troubleshooting

- **404 on `/traceproof`:** Confirm the installer completed and `app/routes.ts` includes a `traceproof` route; stop and restart `pnpm.cmd dev`. Type the exact URL without a period or tracking suffix.
- **TypeScript errors:** Read `INTEGRATION_LOCAL_RESULTS.txt` in the extracted folder. Fix errors before recording.
- **No AI tool calls:** Configure a supported LLM provider in the starter. A dashboard simulation alone does not prove a live AI invocation.
- **Windows Command Prompt pop-ups:** Close the page, stop the server with Ctrl+C, and check the action execution; do not assume a command window constitutes a successful tool result.

## Run in the official Agent-Native application (Windows)

**This repository package is an integration overlay, not a stand-alone Agent-Native starter.** Use the official Chat starter, Node.js 22.22+, and pnpm. The known existing starter path is `$HOME\AVIRA-Hackathon\avira-traceproof-agent`.

Extract this ZIP, open PowerShell inside the extracted `AVIRA_TraceProof_2026_WORKFLOW_REDESIGN` directory, and run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\INSTALL_AND_VERIFY.ps1"
```

The script copies the actions, `lib/` code and React dashboard into the existing starter; backs up the previous page outside `app/routes`; registers `/traceproof` in `app/routes.ts`; and executes `pnpm.cmd exec tsc --noEmit`. Review the script before running. If it says `FAIL`, inspect `INTEGRATION_LOCAL_RESULTS.txt`; do not treat the build as passing.

After a successful check:

```powershell
cd "$HOME\AVIRA-Hackathon\avira-traceproof-agent"
pnpm.cmd dev
```

Open the exact local address printed by the server, with `/traceproof` appended (usually `http://localhost:8080/traceproof`). **Do not add a final period or URL tracking parameters.**

### Human–AI shared action verification

Use the dashboard to analyze the e-commerce sample, then open `/home` and ask the connected agent:

> Call `analyze-trace` with events `[{"id":"payment-req","requestId":"checkout-42","timestampMs":1000,"type":"REQUEST"},{"id":"payment-resp","requestId":"checkout-42","timestampMs":1180,"type":"RESPONSE"}]` and `thresholdMs:100`. Cite the evidence IDs and explain uncertainty.

**Pass condition:** actual agent *tool invocation* is visible and agrees with the dashboard. The model producing matching prose alone is not a pass. AI provider setup is separate from the source installer.

## Tests (deterministic engine)

```powershell
node --test tests/*.test.mjs
```

Latest container run: **88 passed, 0 failed**. The execution environment did **not** include your Windows Agent-Native starter or authenticated AI provider, so end-to-end browser/agent validation is pending on your machine. Do not advertise total app benchmark performance from the deterministic engine's numbers.

## Repository and documentation

- `actions/`: `defineAction()` tool definitions used by the UI and available to an AI agent
- `app/routes/traceproof.tsx`: React human-in-control dashboard
- `app/components/ProofShift3D.tsx`: accessible pauseable 3D-style timing visualization
- `lib/`: deterministic matching and bounded experiment logic
- `samples/`: three sample upload formats
- `tests/`: deterministic engine, report and route tests
- `docs/AVIRA_TraceProof_Project_Presentation.pptx`: optional slides
- `docs/SUBMISSION_FIELDS.md`: field-by-field form and Clips instructions
- `INSTALL_AND_VERIFY.ps1`: local overlay installer, backed-up route registration and TS check

## Intellectual property, attribution and constraints

This project builds on the official open-source Agent-Native Chat starter and its respective third-party dependencies. The original AVIRA investigation code, sample incidents, UI integration and experiments were developed during the 2026 hackathon project. Do not include confidential employer traces, production secrets, tokens or proprietary patent materials. Inspect git staged files before uploading. This submission does not claim patent novelty, autonomous repairs, ISO 26262 validation or measured customer time savings.

## 3D results visualization (restored)

After clicking **Run 30-second demo**, scroll to **See what happened — in 3D** in the investigation results. The animated 3D bars compare recorded duration with the selected limit. Choose an experiment, check approval and click **Run my approved experiment** to see a second 3D comparison including the *calculated* simulated result. **Pause 3D motion** stops the animation. No simulated result is represented as a production fix.

## Animated purpose workflow

In **Purpose & how it works**, the five stage cards (Load, Investigate, Decide, Test, Report) are shown as an animated 3D-style process with sequential raised-card highlighting. A Pause/Resume control stops or restarts the animation, and reduced-motion preferences are respected. This is a UI explanation, distinct from the 3D timing results.


## Purpose and guided demonstration

The **Purpose & how it works** button opens the problem, solution, human/AI collaboration, limitations and animated five-stage workflow. **Run 30-second demo** loads checkout events, triggers the `analyze-trace` shared action, and displays an animated 30-second educational progress guide. The engineer must still review results, approve experiments and download a report. It does not automatically fix software.

**Supported input:** event arrays in JSON, structured TXT (JSON array) or CSV with `id,requestId,timestampMs,type`. The bold green **Upload your logs here** picker is in Step 1. Choose a file, set a response deadline, click **Analyze evidence**. Read the result in Step 2.

**Windows quick start from scratch:** install Node 22.22+ and pnpm, then create the official starter via `npx.cmd --yes @agent-native/core@latest create avira-traceproof-agent --standalone --template chat`, `cd avira-traceproof-agent`, `corepack enable`, `pnpm.cmd install`. Run this package's `INSTALL_AND_VERIFY.ps1` with `-Destination` set to that starter. Start with `pnpm.cmd dev`, then open `/traceproof` at the displayed local server URL. Existing starter: `$HOME\AVIRA-Hackathon\avira-traceproof-agent`. The connected AI tool call must be verified separately from the deterministic test suite.
