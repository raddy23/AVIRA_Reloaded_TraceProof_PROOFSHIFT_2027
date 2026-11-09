import test from 'node:test';
import assert from 'node:assert/strict';
import { registerTraceproofRoute } from '../tools/register-route.mjs';

test('registers route in standard index-only config', () => {
  const source = `import { type RouteConfig, index } from '@react-router/dev/routes';\nexport default [index('routes/home.tsx')] satisfies RouteConfig;`;
  const result = registerTraceproofRoute(source);
  assert.match(result.source, /route\("traceproof", "routes\/traceproof\.tsx"\)/);
  assert.match(result.source, /import \{ route \} from/);
  assert.match(result.source, /index\('routes\/home\.tsx'\),/);
});

test('does not duplicate existing route', () => {
  const source = `import { route } from '@react-router/dev/routes';\nexport default [route("traceproof", "routes/traceproof.tsx")]`;
  assert.deepEqual(registerTraceproofRoute(source), {source, changed:false});
});

test('retains nested route arrays', () => {
  const source = `import { layout, route } from '@react-router/dev/routes';\nexport default [layout('routes/layout.tsx', [route('home', 'routes/home.tsx')])] satisfies RouteConfig;`;
  const result = registerTraceproofRoute(source);
  assert.match(result.source, /layout\('routes\/layout\.tsx', \[route\('home', 'routes\/home\.tsx'\)\]\),/);
  assert.match(result.source, /route\("traceproof", "routes\/traceproof\.tsx"\)/);
});

test('fails closed for non-array routing config', () => {
  assert.throws(() => registerTraceproofRoute('export default await flatRoutes();'), /Unsupported/);
});

test('idempotent when run twice', () => {
  const input = 'export default [] satisfies RouteConfig;';
  const once = registerTraceproofRoute(input);
  assert.equal(registerTraceproofRoute(once.source).changed, false);
});
