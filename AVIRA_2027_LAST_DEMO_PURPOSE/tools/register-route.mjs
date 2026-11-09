#!/usr/bin/env node
/** Safely register the Agent-Native React Router page without altering other routes. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function registerTraceproofRoute(source) {
  if (/\broute\s*\(\s*['"]\/?traceproof['"]\s*,/.test(source)) return { source, changed: false };
  const exportIndex = source.search(/\bexport\s+default\s*\[/);
  if (exportIndex < 0) {
    throw new Error('Unsupported app/routes.ts structure. Expected `export default [ ... ]`. No modification made; print routes.ts to inspect.');
  }
  const marker = /\bexport\s+default\s*\[/g;
  marker.lastIndex = exportIndex;
  const match = marker.exec(source);
  const start = match.index + match[0].length - 1;
  // Match the closing bracket in the exported array while respecting strings and comments.
  let depth = 0, end = -1, state = 'normal';
  for (let i = start; i < source.length; i++) {
    const c = source[i], next = source[i + 1];
    if (state === 'line') { if (c === '\n') state = 'normal'; continue; }
    if (state === 'block') { if (c === '*' && next === '/') { state = 'normal'; i++; } continue; }
    if (state === 'single' || state === 'double' || state === 'template') {
      if (c === '\\') { i++; continue; }
      if ((state === 'single' && c === "'") || (state === 'double' && c === '"') || (state === 'template' && c === '`')) state = 'normal';
      continue;
    }
    if (c === '/' && next === '/') { state = 'line'; i++; continue; }
    if (c === '/' && next === '*') { state = 'block'; i++; continue; }
    if (c === "'") { state = 'single'; continue; }
    if (c === '"') { state = 'double'; continue; }
    if (c === '`') { state = 'template'; continue; }
    if (c === '[') depth++;
    if (c === ']' && --depth === 0) { end = i; break; }
  }
  if (end < 0) throw new Error('Could not safely find export default route array closing bracket. No modification made.');
  const body = source.slice(start + 1, end);
  const trimmed = body.trimEnd();
  const comma = trimmed.length && !trimmed.endsWith(',') ? ',' : '';
  let updated = source.slice(0, end) + `${comma}\n  route("traceproof", "routes/traceproof.tsx"),\n` + source.slice(end);
  // Reuse the existing package import or add a new import without editing existing bindings.
  if (!/\bimport\s*\{[^}]*\broute\b[^}]*\}\s*from\s*['"]@react-router\/dev\/routes['"]/.test(updated)) {
    updated = `import { route } from "@react-router/dev/routes";\n` + updated;
  }
  return { source: updated, changed: true };
}

const script = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (script === fileURLToPath(import.meta.url)) {
  const project = path.resolve(process.argv[2] ?? process.cwd());
  const file = path.join(project, 'app', 'routes.ts');
  if (!fs.existsSync(file)) { console.error(`FAIL: ${file} missing`); process.exit(2); }
  const original = fs.readFileSync(file, 'utf8');
  try {
    const result = registerTraceproofRoute(original);
    if (result.changed) {
      fs.mkdirSync(path.join(project, "avira_backups"), { recursive: true });
      fs.copyFileSync(file, path.join(project, "avira_backups", "routes.ts.pre-avira.bak"));
      fs.writeFileSync(file, result.source);
      console.log('PASS: /traceproof registered in app/routes.ts (original backed up).');
    } else console.log('PASS: /traceproof route already registered.');
  } catch (error) { console.error(`FAIL: ${error.message}`); process.exit(1); }
}
