# GitHub publish — Windows PowerShell

Once the installed Agent-Native starter has passed its build and live demo checks, open a **new** PowerShell window:

```powershell
cd "$HOME\AVIRA-Hackathon\avira-traceproof-agent"
git status
```

Verify `.gitignore` excludes `.env`, `.env.*`, `node_modules/`, `.react-router/`, `.vite/`, `build/`, `dist/`, `avira_backups/`, and any database or local authentication data. Commit only code, docs, tests and synthetic samples. Never publish API keys. Do not rely on `.gitignore` to unstage a file already tracked; inspect `git status` and `git diff --cached --name-only`.

Create a public repo in https://github.com/new using the exact project name. Then, if this is a new local repo:

```powershell
git init
git add .
git diff --cached --name-only
# REVIEW OUTPUT FOR SECRETS before proceeding
git commit -m "AVIRA TraceProof Agent-Native prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/AVIRA_Reloaded_TraceProof_PROOFSHIFT_2027.git
git push -u origin main
```

Replace `YOUR_USERNAME`. If `origin` already exists, use `git remote -v` and update deliberately instead of blindly adding it. This upload is optional for Builder.io eligibility; do not delay the required Clips recording and official form.
