import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../app/routes/traceproof.tsx',import.meta.url),'utf8');
test('Purpose guide is user-controlled and accessible',()=>{
 assert.match(source,/const \[purpose,setPurpose\]=useState\(false\)/);
 assert.match(source,/aria-expanded=\{purpose\}/);
 assert.match(source,/aria-controls="purpose-guide"/);
 assert.match(source,/id="purpose-guide"/);
});
test('Purpose guide describes problem, solution, domains and shared AI action without overclaims',()=>{
 for(const word of ['Problem:','Solution:','e-commerce','automotive','cloud','analyze-trace','human','not automatic fault repair']) assert.ok(source.toLowerCase().includes(word.toLowerCase()),word);
});
test('Guided UI exposes input, analysis, evidence, approval and report',()=>{
 for(const word of ['Upload evidence file','Paste JSON or CSV events','Run 30-second demo','Analyze evidence','Evidence ledger','Two choices','I approve this synthetic calculation','Download full investigation report','Clear / Start over'])assert.ok(source.includes(word),word);
});
