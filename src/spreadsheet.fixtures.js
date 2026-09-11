// SPDX-License-Identifier: MIT
/**
 * The characterization corpus for spreadsheet evaluation.
 *
 * WHY THIS EXISTS. Before this file, roughly fifteen assertions across four
 * repos covered formula EVALUATION, and none of them could catch a regression
 * in this package. L0179's eval-equivalence suite looks like a net but is not:
 * both its arms call the same translatex, so a change here moves both
 * identically and the suite stays green. This package's own 47 tests are ~45
 * number formatting; there is no test of any binary operator inside a formula.
 *
 * That is the wrong footing from which to change an evaluator that scores
 * assessments, so this is the net that goes in first.
 *
 * TWO TIERS, and the difference matters.
 *
 *   CURATED  — expectations reasoned out by hand. These assert what the engine
 *              SHOULD do, so a curated case that fails is a bug.
 *   BASELINE — captured from the engine as it stands (spreadsheet.baseline.json).
 *              These assert only that behaviour does not move UNNOTICED. A
 *              baseline case that changes is not automatically wrong; it needs a
 *              human to say the change was intended.
 *
 * Entries in the baseline carry a `defect` tag where the captured value is
 * KNOWN WRONG. Without that, fixing a bug would read as a regression — the
 * classic way a golden-file suite ends up defending its own defects. When a fix
 * lands, its tagged cases are expected to change; everything untagged is
 * expected not to.
 *
 * Sources: L0179's sheet and scoring suites, the L0166 training corpus, and a
 * deployed retirement-planning item (263 distinct formula shapes, the richest
 * single source — every one of its present-value cells is a `/POWER(...)`).
 */

/**
 * The grid every fixture evaluates against.
 *
 * A1..A3 are 10/20/30 because L0179's own tests use those and the shared cases
 * stay recognisable. Everything else is `col*100 + row`: non-zero everywhere,
 * so nothing divides by zero by accident, and distinguishable, so a value that
 * leaks into the output can be traced back to the cell it came from.
 */
export const env = (() => {
  const cells = {};
  const COLS = 'ABCDEFGHIQXZ';
  for (let c = 0; c < COLS.length; c++) {
    for (let r = 1; r <= 60; r++) {
      cells[`${COLS[c]}${r}`] = { val: String((c + 1) * 100 + r) };
    }
  }
  cells.A1 = { val: '10' };
  cells.A2 = { val: '20' };
  cells.A3 = { val: '30' };
  return cells;
})();

/**
 * Hand-reasoned expectations. A failure here is a bug, not a change.
 *
 * `expect` is the value; `errorCode` asserts the failure path instead. Where a
 * case documents a DEFECT rather than correct behaviour, it says so and asserts
 * the wrong value deliberately — those are the cases that must flip when the
 * corresponding fix lands.
 */
const SEP = String.fromCharCode(31);

export const curated = [
  // --- arithmetic, the operators nothing tested before ---
  { formula: '=A1+A2', expect: '30' },
  { formula: '=A2-A1', expect: '10' },
  { formula: '=A1*A2', expect: '200' },
  { formula: '=A2/A1', expect: '2' },
  { formula: '=A1+A2+A3', expect: '60' },
  { formula: '=A1*2', expect: '20' },
  { formula: '=-A1', expect: '-10' },
  { formula: '=A1/(A2+A3)', expect: '0.2' },
  { formula: '=(A1+A2)*A3', expect: '900' },

  // --- the functions, at the arities they are actually written with ---
  { formula: '=SUM(A1:A3)', expect: '60' },
  { formula: '=SUM(A1,A2)', expect: '30' },
  { formula: '=SUM(A1,A2,A3)', expect: '60' },
  { formula: '=SUM(A1)', expect: '10' },
  { formula: '=AVERAGE(A1:A3)', expect: '20' },
  { formula: '=ROUND(A1/3,2)', expect: '3.33' },
  { formula: '=ROUND(A1,0)', expect: '10' },
  { formula: '=MUL(A1,A2)', expect: '200' },

  // --- nesting, and a call on the LEFT of an operator, which works ---
  { formula: '=ROUND(SUM(A1:A3),1)', expect: '60' },
  { formula: '=SUM(A1:A3)+A1', expect: '70' },
  { formula: '=SUM(A1,A2)*A1', expect: '300' },
  { formula: '=A1+SUM(A1,A2)', expect: '40' },
  { formula: '=A1-SUM(A1,A2)', expect: '-20' },

  // --- IF: only a bare truthy value works today; see the defect cases below ---
  { formula: '=IF(A1,B1,C1)', expect: '201' },
  { formula: '=IF(Z1,A1,A2)', expect: '10', note: 'Z1 is 1201, truthy, so the true branch' },

  // --- syntax errors, the one class that reports cleanly ---
  { formula: '=SUM(', errorCode: 1001 },
  { formula: '=)))', errorCode: 1003 },
  { formula: '=@@@', errorCode: 1004 },
];

/**
 * Defects, with what they did and what they do.
 *
 * A group is `open` until its fix lands, then `fixed`. The runner asserts
 * `current` while open and `fixed` once fixed, so the same table is first a
 * pin on the bug and then a regression test for the repair. Both values stay:
 * the wrong one is the record of what was actually happening, which is worth
 * more than a tidy file — half the S1 cases below looked correct.
 */
export const defects = [
  {
    id: 'S1-if-comparison',
    status: 'fixed',
    fixedBy: 'comparison rules ?>? ?<? ?>=? ?<=? ?=? ?!=? plus one expander each',
    note: 'IF ignored comparison operators and always takes the true branch. '
        + 'and always took the true branch. evalRules had no ?>? ?<? ?>=? '
        + 'patterns, so the operand was dropped and evaluateCondition saw the '
        + 'non-empty string "A1". Half of these LOOKED correct, because the true '
        + 'branch happened to be the right answer — which is why it survived so '
        + 'long: it was right exactly as often as a coin.',
    cases: [
      { formula: '=IF(A1>99,100,200)', current: '100', fixed: '200' },
      { formula: '=IF(A1<1,100,200)', current: '100', fixed: '200' },
      { formula: '=IF(A2>A1,100,200)', current: '100', fixed: '100' },
      { formula: '=IF(A1>A2,100,200)', current: '100', fixed: '200' },
      { formula: '=IF(A1>15,100,200)', current: '100', fixed: '200' },
      { formula: '=IF(A1<A2,100,200)', current: '100', fixed: '100' },
      { formula: '=IF(A1<15,100,200)', current: '100', fixed: '100' },
      { formula: '=IF(A1>=A2,100,200)', current: '100', fixed: '200' },
      { formula: '=IF(A1>=15,100,200)', current: '100', fixed: '200' },
      { formula: '=IF(A1<=A2,100,200)', current: '100', fixed: '100' },
      { formula: '=IF(A1<=15,100,200)', current: '100', fixed: '100' },
      { formula: '=IF(A1=A2,100,200)', current: '100', fixed: '200' },
      { formula: '=IF(A1=15,100,200)', current: '100', fixed: '200' },
      { formula: '=IF(A1!=A2,100,200)', current: '100', fixed: '100' },
      { formula: '=IF(A1!=15,100,200)', current: '100', fixed: '100' },
    ],
  },
  {
    id: 'S5-call-right-of-muldiv',
    status: 'open',
    note: 'A function call on the right of * or / loses the call; on the left of '
        + '/ it throws. parselatex binds juxtaposition at the lowest multiplicative '
        + 'precedence. L0179 works around it by bracketing (prepareFormula).',
    // `current` now carries the ARGUMENT SEPARATOR where it used to carry a
    // comma. The value is just as wrong as before, but it is no longer
    // *plausible* — unresolvedCall() can see it, which is the whole point of
    // joining arguments with a character a formula cannot produce.
    cases: [
      { formula: '=A1*SUM(A1,A2)', current: `10A1${SEP}A2`, fixed: '300' },
      { formula: '=A1/SUM(A1,A2)', current: `10A1${SEP}A2`, fixed: '0.33333333333333333333' },
      { formula: '=A1*ROUND(A2,0)', current: `10A2${SEP}0`, fixed: '200' },
      { formula: '=A1/AVERAGE(A1:A3)', current: `10A1${SEP}A2${SEP}A3`, fixed: '0.5' },
      { formula: '=SUM(A1,A2)/A1', current: '', fixed: '3' },
      { formula: '=AVERAGE(A1:A3)/A1', current: '', fixed: '2' },
    ],
  },
  {
    id: 'S2-unknown-function-is-silent',
    status: 'open',
    note: 'An unresolved call returns a plausible string with NO error. This is '
        + 'the worst failure mode in the set: a scored cell gets a wrong value '
        + 'and nothing reports it.',
    cases: [
      { formula: '=NOPE(1)', current: 'NOPE1', fixedErrorCode: 4100 },
      { formula: '=NOSUCH(A1,A2)', current: `NOSUCHA1${SEP}A2`, fixedErrorCode: 4100 },
    ],
  },
];

/**
 * Functions the corpus uses that this package does not implement.
 *
 * POWER is in L0179's `types.fn` but has no reducer here, because the only way
 * to add one is to replace the `$fn` expander wholesale. Marked separately from
 * `defects` because the engine is not doing anything wrong — it was never given
 * the function.
 *
 * How it fails CHANGED with $call, and for the better. Under $fn it was a raw
 * `reducerBuilders[...] is not a function` TypeError, surfaced as errorCode 0 —
 * indistinguishable from a bad argument. $call handles a missing reducer
 * instead of crashing, so an unknown function now behaves like any other
 * unresolved call: it leaves the argument separator in the result, which
 * unresolvedCall() can see. Still no error code — that needs the function
 * registry — but it is detectable, which it was not.
 */
export const unsupported = { functions: ['POWER'], leavesResidue: true };
