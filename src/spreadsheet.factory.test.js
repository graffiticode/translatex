// SPDX-License-Identifier: MIT
/**
 * The extension API.
 *
 * The load-bearing test here is the first one: the factory must reproduce the
 * rule set the consumers hand-maintain today, exactly. This is a change in how
 * functions are REGISTERED, not in what they compute, and the only way to say
 * that credibly is to generate the vocabulary and compare it to the one that
 * ships.
 */
import { Core as TransLaTeX } from './core.js';
import { unresolvedCall } from './spreadsheetExpanders.js';
import {
  createSpreadsheet, ERROR, spreadsheetErrorMarker, toDecimal, spreadsheetError,
} from './spreadsheet.js';
import { evalRules as fixtureRules } from './spreadsheet.rules.fixture.js';
import { env } from './spreadsheet.fixtures.js';
import baseline from './spreadsheet.baseline.json';

/** POWER, as a consumer would write it. This replaces L0179's whole $fn override. */
const POWER = {
  name: 'POWER',
  minArgs: 2,
  maxArgs: 2,
  apply: ({ args, helpers: { getCellValue, toDecimal: dec } }) => {
    const [b, e] = args.map((a) => getCellValue(a));
    const result = dec('POWER', 0, b).pow(dec('POWER', 1, e));
    return result.isFinite() ? `${result}` : '#NUM!';
  },
};

function run(sheet, formula, cells = env) {
  let value;
  let errors = [];
  try {
    const translate = TransLaTeX.buildTranslator(
      { keepTextWhitespace: true, env: cells, ...sheet.rules.evalRules },
      sheet.expanders,
    );
    translate(formula, (e, v) => { if (e && e.length) errors = e; value = v; });
  } catch (x) {
    errors = [x];
  }
  const code = errors.length
    ? (errors[0] && errors[0].errorCode) || 0
    : undefined;
  return { value, errors, errorCode: code };
}

describe('the generated vocabulary matches the one that ships', () => {
  // POWER is passed so the comparison is like-for-like: the fixture has it
  // because L0179 added it by hand, which is the four-edit problem this removes.
  const sheet = createSpreadsheet({ functions: [POWER] });

  test('words are identical', () => {
    expect(sheet.rules.evalRules.words).toEqual(fixtureRules.words);
  });

  test('types.fn is identical', () => {
    expect(sheet.rules.evalRules.types.fn).toEqual(fixtureRules.types.fn);
  });

  test('the other type patterns are identical', () => {
    expect(sheet.rules.evalRules.types.args).toEqual(fixtureRules.types.args);
    expect(sheet.rules.evalRules.types.cellName).toEqual(fixtureRules.types.cellName);
    expect(sheet.rules.evalRules.types.cellRange).toEqual(fixtureRules.types.cellRange);
  });

  test('adding a function takes ONE descriptor, not four coordinated edits', () => {
    const without = createSpreadsheet();
    expect(without.rules.evalRules.types.fn).not.toContain('power');
    expect(without.rules.evalRules.words.power).toBeUndefined();
    // One descriptor, and the name appears in every place it has to.
    expect(sheet.rules.evalRules.types.fn).toContain('power');
    expect(sheet.rules.evalRules.words.power).toBe('power');
  });

  test('each call returns fresh objects, not a shared singleton', () => {
    // spreadsheetExpanders is one instance shared by every importer; assigning
    // into it changes behaviour process-wide.
    const a = createSpreadsheet();
    const b = createSpreadsheet();
    expect(a.expanders).not.toBe(b.expanders);
    expect(a.rules.evalRules).not.toBe(b.rules.evalRules);
    a.expanders.$call = null;
    expect(b.expanders.$call).not.toBeNull();
  });
});

describe('the corpus does not move', () => {
  const sheet = createSpreadsheet({ functions: [POWER] });

  test('every case whose result does not involve POWER is unchanged', () => {
    // POWER cases legitimately change: they went from an unresolved call to a
    // computed value, which is the whole point of registering it.
    const moved = [];
    for (const c of baseline) {
      if (/POWER/i.test(c.formula)) continue;
      const r = run(sheet, c.formula);
      if (r.value !== c.value) moved.push([c.formula, c.value, r.value]);
    }
    expect(moved).toEqual([]);
  });

  test('and there are enough of them for that to mean something', () => {
    expect(baseline.filter((c) => !/POWER/i.test(c.formula)).length).toBeGreaterThan(400);
  });
});

describe('a registered function actually works', () => {
  const sheet = createSpreadsheet({ functions: [POWER] });

  test.each([
    ['=POWER(A1,2)', '100'],
    ['=POWER(2,10)', '1024'],
    ['=POWER(A1,0)', '1'],
  ])('%s -> %s', (formula, expected) => {
    expect(run(sheet, formula).value).toBe(expected);
  });

  test('POWER is exact, not floating point', () => {
    // 1.05^4 is 1.21550625. Math.pow gives 1.2155062500000004, and a scored
    // cell compares the learner's typed value against this string.
    const cells = { ...env, A1: { val: '1.05' } };
    expect(run(sheet, '=POWER(A1,4)', cells).value).toBe('1.21550625');
  });

  test('without the descriptor it is an unresolved call, with it it is a number', () => {
    const without = createSpreadsheet();
    expect(unresolvedCall(run(without, '=POWER(A1,2)').value)).not.toBeNull();
    expect(run(sheet, '=POWER(A1,2)').value).toBe('100');
  });
});

describe('operators dispatch through the same registry', () => {
  test('overriding MULTIPLY changes `*`, which was impossible before', () => {
    // $add/$multiply/$divide each closed over reducerBuilders.<name> directly,
    // so overriding $fn extended only the NAME(...) path and could not touch
    // the operators at any price.
    const sheet = createSpreadsheet({
      functions: [{
        name: 'MULTIPLY',
        operatorOnly: true,
        minArgs: 1,
        maxArgs: Infinity,
        apply: () => 'overridden',
      }],
    });
    expect(run(sheet, '=A1*A2').value).toBe('overridden');
    // And the untouched operators still work.
    expect(run(sheet, '=A1+A2').value).toBe('30');
  });
});

describe('strict mode says what went wrong', () => {
  const loose = createSpreadsheet({ functions: [POWER] });
  const strict = createSpreadsheet({ functions: [POWER], strict: true });

  test('an unknown function never reaches dispatch — it becomes residue', () => {
    // Worth stating precisely, because it is a consequence of deriving the
    // vocabulary from the registry: `types.fn` and the registry can no longer
    // disagree, so `$call` cannot be handed a name it does not know. An unknown
    // name simply fails to match the call patterns and falls through to the
    // generic concatenation — carrying the argument separator with it.
    //
    // So UNKNOWN_FUNCTION (4100) is unreachable through the default patterns,
    // and the detector is the residue check. That is not a downgrade: 4103 maps
    // to #NAME!, which is exactly what a spreadsheet shows for this.
    for (const sheet of [loose, strict]) {
      const r = run(sheet, '=NOSUCH(A1,A2)');
      expect(r.errors).toHaveLength(0);
      expect(r.value).toContain('NOSUCH');
      const err = sheet.checkResult(r.value);
      expect(err.errorCode).toBe(ERROR.UNRESOLVED);
      expect(spreadsheetErrorMarker(err.errorCode)).toBe('#NAME!');
    }
  });

  test('wrong arity is 4101', () => {
    expect(run(strict, '=POWER(A1)').errorCode).toBe(ERROR.WRONG_ARITY);
    expect(run(strict, '=POWER(A1,A2,A3)').errorCode).toBe(ERROR.WRONG_ARITY);
    expect(run(strict, '=POWER(A1,A2)').errorCode).toBeUndefined();
  });

  test('a bad argument is 4102, not a DecimalError at code 0', () => {
    const cells = { ...env, A1: { val: 'not a number' } };
    expect(run(strict, '=POWER(A1,2)', cells).errorCode).toBe(ERROR.BAD_ARGUMENT);
  });

  test('loose mode does not check arity, which is why it is the default', () => {
    // A deployed item whose formula has been quietly wrong for a year would
    // start erroring the moment a consumer upgraded. Consumers opt in.
    //
    // Note what loose mode does NOT suppress: this POWER descriptor reads its
    // arguments through toDecimal, so a missing one still fails as a bad
    // ARGUMENT (4102) rather than as wrong arity (4101). That is the
    // descriptor's own doing, not the factory's — strictness governs the
    // framework's checks, not what a function chooses to reject.
    expect(run(loose, '=POWER(A1)').errorCode).toBe(ERROR.BAD_ARGUMENT);
    expect(run(strict, '=POWER(A1)').errorCode).toBe(ERROR.WRONG_ARITY);
    expect(run(loose, '=NOSUCH(A1,A2)').errors).toHaveLength(0);
  });

  test('checkResult finds an unresolved call in loose mode', () => {
    const err = loose.checkResult(run(loose, '=NOSUCH(A1,A2)').value);
    expect(err).not.toBeNull();
    expect(err.errorCode).toBe(ERROR.UNRESOLVED);
    expect(loose.checkResult(run(loose, '=SUM(A1,A2)').value)).toBeNull();
  });
});

describe('error codes map to spreadsheet markers', () => {
  test.each([
    [ERROR.UNKNOWN_FUNCTION, '#NAME!'],
    [ERROR.WRONG_ARITY, '#N/A'],
    [ERROR.BAD_ARGUMENT, '#VALUE!'],
    [ERROR.UNRESOLVED, '#NAME!'],
    [ERROR.DIVIDE_BY_ZERO, '#DIV/0!'],
  ])('%i -> %s', (code, marker) => {
    expect(spreadsheetErrorMarker(code)).toBe(marker);
  });

  test('a code with no marker is null, not a guess', () => {
    expect(spreadsheetErrorMarker(1001)).toBeNull();
    expect(spreadsheetErrorMarker(0)).toBeNull();
  });

  test('the engine does not emit markers itself', () => {
    // Markers are the spreadsheet's vocabulary; this package is a LaTeX
    // translator. Baking #NAME! in would put one consumer's presentation in the
    // engine. The consumer maps a code to a marker; the engine only names the
    // code.
    const sheet = createSpreadsheet({ strict: true });
    const r = run(sheet, '=NOSUCH(A1,A2)');
    expect(String(r.value)).not.toContain('#NAME!');
    const err = sheet.checkResult(r.value);
    expect(spreadsheetErrorMarker(err.errorCode)).toBe('#NAME!');
  });

  test('the residue detector MISSES a single-argument unknown call', () => {
    // A real limit, recorded rather than smoothed over. The separator is
    // introduced by the `args` rule, and `args` is "?,?" or a range — a lone
    // argument is neither, so nothing joins anything and there is no residue.
    //
    //     =NOSUCH(A1,A2)  ->  "NOSUCH" + A1 + <US> + A2   detected
    //     =NOSUCH(A1)     ->  "NOSUCHA1"                  NOT detected
    //
    // So `=NOPE(1)` still returns a plausible string with no error and nothing
    // to notice it by. Closing this needs the call itself to be a node the
    // rules can match — which is the parser work in the next phase, not
    // something another expander can reach.
    const sheet = createSpreadsheet({ strict: true });
    const r = run(sheet, '=NOSUCH(A1)');
    expect(r.errors).toHaveLength(0);
    expect(r.value).toBe('NOSUCHA1');
    expect(sheet.checkResult(r.value)).toBeNull();
  });
});

describe('helpers custom functions need', () => {
  test('toDecimal fails with a code instead of a DecimalError', () => {
    expect(() => toDecimal('F', 0, 'abc')).toThrow(/not a number/);
    try {
      toDecimal('F', 0, 'abc');
    } catch (e) {
      expect(e.errorCode).toBe(ERROR.BAD_ARGUMENT);
    }
    expect(toDecimal('F', 0, '1.5').toString()).toBe('1.5');
  });

  test('spreadsheetError carries its code on the object, not just in the text', () => {
    // errorCodeOf in core.js reads the field first and only falls back to
    // scraping the message, which is what made everything report 0.
    const e = spreadsheetError(ERROR.WRONG_ARITY, 'nope');
    expect(e.errorCode).toBe(ERROR.WRONG_ARITY);
    expect(e.message).toContain('4101:');
  });
});
