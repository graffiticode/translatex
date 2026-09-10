// SPDX-License-Identifier: MIT
/**
 * The evaluation net. See spreadsheet.fixtures.js for what the tiers mean.
 *
 * EVERY ASSERTION IS MADE OUTSIDE THE resume CALLBACK, deliberately. The rest of
 * this suite asserts inside it:
 *
 *     translate('1234.56', (err, val) => { expect(val).toBe('$1,234.56'); });
 *
 * which passes vacuously if the callback ever stops being invoked — the test
 * cannot tell "correct" from "never ran". `resume` is synchronous, so capturing
 * into a variable and asserting after the call costs nothing and closes that
 * hole. `runs exactly once` below pins the synchrony the pattern depends on.
 */
import { Core as TransLaTeX } from './core.js';
import spreadsheetExpanders from './spreadsheetExpanders.js';
import { evalRules } from './spreadsheet.rules.fixture.js';
import {
 env, curated, defects, unsupported,
} from './spreadsheet.fixtures.js';
import baseline from './spreadsheet.baseline.json';

/**
 * The numeric code an error carries, or 0 when it carries none.
 *
 * Codes are recovered by splitting the message on the first colon — the
 * convention assert.js establishes. Anything not thrown through it (a raw
 * TypeError from a missing reducer, a DecimalError from a bad argument) has no
 * code and lands on 0, which is why 0 means "we do not know what went wrong".
 */
function errorCodeOf(errors) {
  if (!errors.length) return undefined;
  const m = /^(\d+):/.exec(String(errors[0]));
  return m ? Number(m[1]) : 0;
}

/** Evaluate one formula. Returns plain data; never throws. */
function evaluate(formula, cells = env) {
  let value;
  let errors = [];
  let calls = 0;
  try {
    const translate = TransLaTeX.buildTranslator(
      { keepTextWhitespace: true, env: cells, ...evalRules },
      spreadsheetExpanders,
    );
    translate(formula, (err, val) => {
      calls++;
      if (err && err.length) errors = err.map(String);
      value = val;
    });
  } catch (x) {
    errors = [`THROW: ${x && x.message}`];
  }
  const code = errorCodeOf(errors);
  return {
 value, errors, errorCode: code, calls,
};
}

describe('the runner itself', () => {
  test('resume is synchronous and runs exactly once', () => {
    // The whole non-vacuous pattern rests on this. If resume ever becomes
    // async, every assertion below silently stops testing anything, so it is
    // pinned rather than assumed.
    const r = evaluate('=A1+A2');
    expect(r.calls).toBe(1);
    expect(r.value).toBe('30');
  });

  test('a formula that cannot be evaluated still returns data, not a throw', () => {
    const r = evaluate('=SUM(');
    expect(r.errorCode).toBe(1001);
    expect(r.value).toBe('');
  });
});

describe('curated — these assert what the engine should do', () => {
  test.each(curated.map((c) => [c.formula, c]))('%s', (_formula, c) => {
    const r = evaluate(c.formula);
    if (c.errorCode !== undefined) {
      expect(r.errorCode).toBe(c.errorCode);
    } else {
      expect(r.errors).toStrictEqual([]);
      expect(r.value).toBe(c.expect);
    }
  });
});

describe('defects — pinned as they behave today, so the fix has a test to flip', () => {
  for (const group of defects) {
    describe(group.id, () => {
      test.each(group.cases.map((c) => [c.formula, c]))('%s', (_formula, c) => {
        const r = evaluate(c.formula);
        if (c.fixedErrorCode !== undefined) {
          // Currently returns a plausible string with NO error at all.
          expect(r.errors).toStrictEqual([]);
          expect(r.value).toBe(c.current);
        } else {
          expect(r.value).toBe(c.current);
        }
      });
    });
  }
});

describe('baseline — captured behaviour, asserting only that it does not move unnoticed', () => {
  test('the corpus is present and not silently empty', () => {
    // Without this, a broken import would make every case below vanish and the
    // suite would report success on zero coverage.
    expect(baseline.length).toBeGreaterThan(300);
  });

  test.each(baseline.map((c) => [c.formula, c]))('%s', (_formula, c) => {
    const r = evaluate(c.formula);
    expect(r.value).toBe(c.value);
    expect(r.errorCode).toBe(c.errorCode ?? undefined);
  });

  test('every unsupported function fails the same recognisable way', () => {
    // POWER has no reducer here; the only way to add one is to replace $fn.
    // When the extension API lands this expectation changes, and that is the
    // point of writing it down.
    for (const fn of unsupported.functions) {
      const r = evaluate(`=${fn}(A1,A2)`);
      expect(r.errorCode).toBe(unsupported.errorCode);
      expect(r.value).toBe('');
    }
  });
});
