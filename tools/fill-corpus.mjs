// SPDX-License-Identifier: MIT
/**
 * The systematic half of the corpus.
 *
 * Formulas harvested from real items and tests are heavily skewed — measured on
 * the harvest alone: 177 cases touch `+` and 135 touch `*`, but only 6 exercise
 * `/` to a numeric result, 5 exercise `-`, and `%`, unary minus and MUL do not
 * appear at all. A mutation that truncated division to two decimal places was
 * caught by three tests; one that broke SUM was caught by 218.
 *
 * Real formulas tell you what people write. They do not tell you what the
 * engine can do, and the gap between those is where regressions hide. This
 * enumerates the surface instead.
 */
const CELLS = ['A1', 'A2', 'A3', 'B1'];
const out = new Set();

// Every binary operator, over cell/cell, cell/number, number/number.
for (const op of ['+', '-', '*', '/']) {
  out.add(`=A1${op}A2`);
  out.add(`=A2${op}A1`);
  out.add(`=A1${op}3`);
  out.add(`=7${op}A1`);
  out.add(`=7${op}3`);
  out.add(`=A1${op}A2${op}A3`);
  out.add(`=(A1${op}A2)${op}A3`);
  out.add(`=A1${op}(A2${op}A3)`);
}
// Precedence pairs, both orders.
for (const a of ['+', '-']) for (const b of ['*', '/']) {
  out.add(`=A1${a}A2${b}A3`);
  out.add(`=A1${b}A2${a}A3`);
}
// Unary minus and percent, which the harvest never exercises.
out.add('=-A1'); out.add('=-A1+A2'); out.add('=A1+-A2'); out.add('=-(A1+A2)'); out.add('=--A1');
out.add('=A1%'); out.add('=50%'); out.add('=A1%+A2'); out.add('=A1*50%');

// Each function across its arity range and one step past each end. What the
// engine does at the edges is not documented anywhere; capturing it is the
// point.
for (const fn of ['SUM', 'AVERAGE', 'MUL']) {
  out.add(`=${fn}()`);
  out.add(`=${fn}(A1)`);
  out.add(`=${fn}(A1,A2)`);
  out.add(`=${fn}(A1,A2,A3)`);
  out.add(`=${fn}(A1:A3)`);
  out.add(`=${fn}(A1:A3,B1)`);
}
out.add('=ROUND(A1)'); out.add('=ROUND(A1,0)'); out.add('=ROUND(A1,2)');
// Rounding MODE, which nothing else pins. Every other ROUND case in the corpus
// rounds the same way under HALF_UP and DOWN, so swapping the mode was invisible
// — a mutation that changed it did not fail a single test. These are chosen so
// the two modes disagree: 0.625 -> 0.63 or 0.62.
out.add('=ROUND(A1/16,2)'); out.add('=ROUND(A3/16,2)'); out.add('=ROUND(A1/8,2)');
out.add('=ROUND(2.5,0)'); out.add('=ROUND(-2.5,0)'); out.add('=ROUND(0.125,2)');
out.add('=ROUND(-0.125,2)'); out.add('=ROUND(1.005,2)');
out.add('=ROUND(A1,2,3)'); out.add('=ROUND(A1/3,4)'); out.add('=ROUND(-A1/3,2)');
out.add('=IF(A1)'); out.add('=IF(A1,A2)'); out.add('=IF(A1,A2,A3)'); out.add('=IF(A1,A2,A3,B1)');
for (const cmp of ['>', '<', '>=', '<=', '=', '!=']) {
  out.add(`=IF(A1${cmp}A2,100,200)`);
  out.add(`=IF(A1${cmp}15,100,200)`);
}

// Nesting, in both operand positions.
out.add('=SUM(SUM(A1,A2),A3)'); out.add('=ROUND(AVERAGE(A1:A3),1)');
out.add('=SUM(A1,AVERAGE(A2:A3))'); out.add('=SUM(A1+A2,A3)'); out.add('=SUM(A1*2,A3/2)');
out.add('=AVERAGE(SUM(A1,A2),A3)');

// Ranges, including the degenerate and reversed forms.
out.add('=SUM(A1:A1)'); out.add('=SUM(A3:A1)'); out.add('=AVERAGE(A1:B1)');

// Values that are not plain positive integers.
for (const c of CELLS) out.add(`=${c}`);
out.add('=0'); out.add('=-0'); out.add('=0.5'); out.add('=.5'); out.add('=1e3');
out.add('=A1/0'); out.add('=0/A1'); out.add('=A1-A1');

console.log([...out].sort().join('\n'));
