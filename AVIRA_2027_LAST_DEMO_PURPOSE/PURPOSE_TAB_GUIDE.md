# AVIRA TraceProof — Purpose & How It Works tab

A new **Purpose & how it works** toggle is placed immediately under the project header at `/traceproof`.

On click it explains:
- **Problem**: manual event correlation and difficulty proving improvements.
- **Solution**: deterministic analysis, optional AI explanations, human approval, bounded synthetic experiment, exported evidence.
- **Domains**: formatted examples in e-commerce/banking software, automotive/embedded, cloud/QA, and instrumentation software. This is *not* a universal raw-log decoder.
- **AI + Human**: the dashboard calls the shared `analyze-trace` action, while a connected AI agent can use the same action. The engineer reviews the evidence, chooses parameters, and authorizes the simulation.
- **Output and limitations**: timing classification and evidence references, simulated comparison and exported JSON; no production repair claims.

## Install
Extract the archive. In PowerShell, enter the extracted `AVIRA_AgentNative_Integration_Kit` folder and run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\INSTALL_AND_VERIFY.ps1"
```

This copies source into the existing `C:\Users\dhapa\AVIRA-Hackathon\avira-traceproof-agent` starter, then runs its TypeScript checker. Restart `pnpm.cmd dev` and open `http://localhost:8080/traceproof`.

The UI guide works without an AI provider; chat-side invocation still needs a connected AI provider and a live verification.
