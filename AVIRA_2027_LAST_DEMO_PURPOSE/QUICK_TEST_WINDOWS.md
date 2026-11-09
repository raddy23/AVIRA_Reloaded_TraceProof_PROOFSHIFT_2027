# AVIRA — final usability update

1. Stop the current `pnpm.cmd dev` server (Ctrl+C).
2. From this extracted folder run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\INSTALL_AND_VERIFY.ps1`.
3. Start `cd "$HOME\AVIRA-Hackathon\avira-traceproof-agent"` followed by `pnpm.cmd dev`.
4. Open the exact URL `http://localhost:8080/traceproof` (adjust port if different).
5. Click **Purpose & how it works**. Click **Try e-commerce** → **Analyze evidence**. Expect 180 ms against 100 ms and VIOLATION.
6. Click **Clear / Start over**. Confirm input and analysis are cleared. Re-select sample.
7. Approve and run one synthetic experiment. Export report.
8. In `/home`, ask the connected agent to call `analyze-trace` with the sample events and `thresholdMs=100`; verify an actual tool invocation, not just prose.

**Deadline:** Nov 9 2026 11:59 PM PT = Nov 10 2026 1:29 PM IST.

The threshold is prefilled for each sample. Uploaded data uses an editable starting value of 100 ms; set the real requirement if known. Simulations do not verify production repairs.
