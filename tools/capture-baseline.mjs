// SPDX-License-Identifier: MIT
/**
 * Capture src/spreadsheet.baseline.json from the corpus.
 *
 *   node tools/capture-baseline.mjs <formulas.txt>
 *
 * Run this ONLY when a behaviour change is intended, and read the diff. The
 * file's whole value is that it fails when evaluation moves; regenerating it to
 * make a failure go away converts the net into a rubber stamp.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { Core as TransLaTeX } from '../src/core.js';
import spreadsheetExpanders from '../src/spreadsheetExpanders.js';
import { evalRules } from '../src/spreadsheet.rules.fixture.js';
import { env, defects } from '../src/spreadsheet.fixtures.js';

const tagged = new Map();
for (const g of defects) for (const c of g.cases) tagged.set(c.formula, g.id);

const formulas = readFileSync(process.argv[2], 'utf-8').split('\n').filter(Boolean);
const out = [];
for (const formula of formulas) {
  let value; let errors = [];
  try {
    const translate = TransLaTeX.buildTranslator(
      { keepTextWhitespace: true, env, ...evalRules }, spreadsheetExpanders);
    translate(formula, (e, v) => { if (e && e.length) errors = e.map(String); value = v; });
  } catch (x) { errors = [`THROW: ${x && x.message}`]; }
  const entry = { formula, value };
  if (errors.length) entry.errorCode = Number((/^(\d+):/.exec(String(errors[0])) || [, '0'])[1]);
  const defect = tagged.get(formula);
  if (defect) entry.defect = defect;
  out.push(entry);
}
writeFileSync(new URL('../src/spreadsheet.baseline.json', import.meta.url), `${JSON.stringify(out, null, 1)}\n`);
console.log(`capture-baseline: ${out.length} cases, ${out.filter((e) => e.defect).length} tagged as defects`);
