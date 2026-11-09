param([string]$Destination = "$HOME\AVIRA-Hackathon\avira-traceproof-agent")
$ErrorActionPreference = 'Stop'
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Report = Join-Path $Source 'INTEGRATION_LOCAL_RESULTS.txt'
Set-Content -Path $Report -Value "AVIRA FINAL - $(Get-Date -Format o)" -Encoding UTF8
function Log([string]$msg) { Write-Host $msg; Add-Content -Path $Report -Value $msg }

Log "Source: $Source"
Log "Destination: $Destination"
if (!(Test-Path (Join-Path $Destination 'package.json'))) { throw 'Cannot find official Agent-Native starter. Nothing changed.' }
if (!(Test-Path (Join-Path $Destination 'app\routes.ts'))) { throw 'Cannot find app/routes.ts. Nothing changed.' }
if (!(Test-Path (Join-Path $Destination 'node_modules'))) { throw 'Run pnpm.cmd install in the starter first.' }
foreach ($d in @('actions','lib','app\routes','app\components','samples','docs','tests')) { New-Item -ItemType Directory -Force -Path (Join-Path $Destination $d) | Out-Null }

# Preserve previous page and move broken route backups outside auto-discovery.
$backupFolder = Join-Path $Destination 'avira_backups'
New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null
$page = Join-Path $Destination 'app\routes\traceproof.tsx'
if (Test-Path $page) { Copy-Item $page (Join-Path $backupFolder 'traceproof.tsx.previous.bak') -Force }
Get-ChildItem -Path (Join-Path $Destination 'app\routes') -File -Filter 'traceproof*.bak' | ForEach-Object {
 Move-Item -LiteralPath $_.FullName -Destination (Join-Path $backupFolder $_.Name) -Force
 Log "Moved stale route backup: $($_.Name)"
}
Copy-Item (Join-Path $Source 'actions\*.ts') (Join-Path $Destination 'actions') -Force
Copy-Item (Join-Path $Source 'lib\*.mjs') (Join-Path $Destination 'lib') -Force
Copy-Item (Join-Path $Source 'lib\*.d.mts') (Join-Path $Destination 'lib') -Force
Copy-Item (Join-Path $Source 'app\routes\traceproof.tsx') (Join-Path $Destination 'app\routes') -Force
Copy-Item (Join-Path $Source 'app\components\ProofShift3D.tsx') (Join-Path $Destination 'app\components') -Force
Copy-Item (Join-Path $Source 'samples\*') (Join-Path $Destination 'samples') -Recurse -Force
Copy-Item (Join-Path $Source 'docs\*') (Join-Path $Destination 'docs') -Recurse -Force
Copy-Item (Join-Path $Source 'tests\*.test.mjs') (Join-Path $Destination 'tests') -Force
Copy-Item (Join-Path $Source 'README.md') (Join-Path $Destination 'AVIRA_README.md') -Force
Copy-Item (Join-Path $Source 'WORKFLOW_2026_README.md') (Join-Path $Destination 'AVIRA_WORKFLOW_2026.md') -Force

& node (Join-Path $Source 'tools\register-route.mjs') $Destination 2>&1 | ForEach-Object { Log "$_" }
if ($LASTEXITCODE -ne 0) { throw 'Route registration failed. Original routes.ts was preserved. See app/routes.ts.' }
Log 'PASS: AVIRA page, actions and React Router registration installed.'
$ignoreFile = Join-Path $Destination '.gitignore'
if (Test-Path $ignoreFile) {
 $ignore = Get-Content $ignoreFile -Raw
 if ($ignore -notmatch '(?m)^avira_backups/$') { Add-Content $ignoreFile "`navira_backups/" }
}

Push-Location $Destination
try {
 Log 'Checking TypeScript (no production deployment configuration needed for this check)...'
 & pnpm.cmd exec tsc --noEmit 2>&1 | ForEach-Object { Log "$_" }
 if ($LASTEXITCODE -ne 0) { Log 'FAIL: TypeScript check'; exit 1 }
 Log 'PASS: TypeScript check.'
} finally { Pop-Location }
Log 'NEXT: cd "$HOME\AVIRA-Hackathon\avira-traceproof-agent" ; pnpm.cmd dev'
Log 'OPEN: http://localhost:8080/traceproof (use port shown in terminal)'
Log 'AI invocation still requires a connected provider and a visible live tool call.'
