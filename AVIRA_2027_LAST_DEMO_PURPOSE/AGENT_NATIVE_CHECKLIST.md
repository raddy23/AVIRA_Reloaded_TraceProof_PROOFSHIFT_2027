# AVIRA Agent-Native live verification

This kit **does not** contain the official Agent-Native starter or your AI credentials. It is a source overlay, test assets and Windows integration checker. Its JavaScript unit tests are real but do **not** prove that the installed Agent-Native app builds or the agent has called a tool.

## Install and verify on your existing computer

1. Extract the entire ZIP. Open PowerShell in the extracted folder.
2. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\INSTALL_AND_VERIFY.ps1`
3. Inspect `INTEGRATION_LOCAL_RESULTS.txt`. All compiler errors must be resolved. The checker prints either PASS or FAIL for the typecheck; it does not conceal failures.
4. In the starter folder `C:\Users\dhapa\AVIRA-Hackathon\avira-traceproof-agent`, run `pnpm.cmd dev`; open the printed URL followed by `/traceproof`.
5. In local Agent-Native Chat, connect an AI provider; first ask "Call the hello action for Alex". Verify the visible actual tool call.
6. Ask: "Call the `investigate-incident` action with `scenario=checkout`. Tell me the exact evidence IDs, observed response and configured threshold. Do not guess a cause." The tool result should contain payment-req, payment-resp, 180ms and 100ms.
7. On `/traceproof`, select checkout, approve 80ms test, run and download ProofPack. This must update from the actual shared `run-incident-experiment` action, not a hard-coded graph.
8. In chat: "Call the `investigate-linux-crash` action with hasCore=true, canRebuild=true, reproducible=false, and tell me why the GDB path is preferred." Verify an actual tool invocation.
9. **Record Clips** showing both the agent invoking action(s) and the React dashboard using their results. Publicly viewable Clips required; git upload does not replace the demonstration.

## Security note

`approved:true` in the demonstration actions is a caller-provided boolean and is not authenticated server-side proof of user consent. The synthetic-only experiment does not change a real system. Never represent this as production authorization architecture.

## Current verification boundaries

- Source and local deterministic engine are testable without credentials.
- Live integration can only be proven with the installed starter, installed node dependencies, connected LLM and a real browser/chat trace. Your Windows run log/screenshot is needed to certify these points.
- Do not push `.env`, `.env.local`, credentials or customer crash dumps to GitHub.
