// SPDX-License-Identifier: MIT
/**
 * The spreadsheet extension API.
 *
 * WHAT THIS REPLACES. Adding one function to a spreadsheet dialect used to take
 * FOUR coordinated edits in a consumer repo — `words` (which is what makes a
 * multi-character name lex as one token rather than P·O·W·E·R), plus `types.fn`
 * in three separate rule sets — and then a fifth step that could not be done at
 * all from outside: the reducer itself. `reducerBuilders` was module-private, so
 * the only way in was to replace the `$fn` expander wholesale, which is exactly
 * what L0179 did for POWER.
 *
 * Four edits that must agree is not a chore, it is a drift generator. L0166 and
 * L0179 shipped rule sets whose only difference was the word `power`, appearing
 * in three of those four places in one repo and none in the other.
 *
 * Here a function is ONE descriptor and everything else is derived from it.
 *
 *   const { expanders, rules } = createSpreadsheet({
 *     functions: [{
 *       name: 'POWER',
 *       minArgs: 2,
 *       maxArgs: 2,
 *       apply: ({ args, helpers: { getCellValue, toDecimal } }) => {
 *         const [b, e] = args.map((a) => getCellValue(a));
 *         return `${toDecimal('POWER', 0, b).pow(toDecimal('POWER', 1, e))}`;
 *       },
 *     }],
 *   });
 *
 * NO SHARED MUTABLE STATE. `spreadsheetExpanders` is one object instance shared
 * by every importer, so a consumer that assigned into it would change behaviour
 * process-wide. This returns fresh objects per call.
 */
import Decimal from 'decimal.js';
import baseExpanders, {
  ARG_SEP,
  reducerBuilders,
  getCellValue,
  isValidDecimal,
  evaluateCondition,
  unresolvedCall,
} from './spreadsheetExpanders.js';

/**
 * Error codes, in the 4000-4999 range this package reserves.
 *
 * The point of these is that `errorCode: 0` — which is what a raw TypeError or
 * a DecimalError collapses to — cannot distinguish "you called a function that
 * does not exist" from "you passed a bad argument" from "the parser lost your
 * call". All three produced a plausible wrong answer or an empty cell, and a
 * consumer had to regex the message text against implementation internals to
 * tell them apart.
 */
export const ERROR = {
  UNKNOWN_FUNCTION: 4100,
  WRONG_ARITY: 4101,
  BAD_ARGUMENT: 4102,
  UNRESOLVED: 4103,
  DIVIDE_BY_ZERO: 4104,
};

const MARKERS = {
  [ERROR.UNKNOWN_FUNCTION]: '#NAME!',
  [ERROR.WRONG_ARITY]: '#N/A',
  [ERROR.BAD_ARGUMENT]: '#VALUE!',
  [ERROR.UNRESOLVED]: '#NAME!',
  [ERROR.DIVIDE_BY_ZERO]: '#DIV/0!',
};

/**
 * The spreadsheet marker for an error code, or null.
 *
 * Exported rather than applied: markers are the SPREADSHEET's vocabulary, and
 * this package is a LaTeX translator that happens to be able to evaluate one.
 * Emitting `#NAME!` from here would bake one consumer's presentation into the
 * engine. Both L0166 and L0179 hand-rolled their own `#NAME!` detection by
 * regex-scanning formulas for identifiers — L0179's scans inside string
 * literals, so `=IF(x,"Yes","No")` reports `Undefined names: Yes, No` — and this
 * is what lets them delete that for one shared mapping.
 */
export function spreadsheetErrorMarker(code) {
  return MARKERS[code] || null;
}

/** An error carrying a machine-readable code, so errorCodeOf does not have to scrape. */
export function spreadsheetError(code, text) {
  const err = new Error(`${code}: ${text}`);
  err.errorCode = code;
  return err;
}

/**
 * `new Decimal(value)`, but failing with a code instead of a DecimalError.
 *
 * `[DecimalError] Invalid argument: ` escaping as errorCode 0 is one of the two
 * ways a consumer currently cannot tell what went wrong. Every built-in reducer
 * that reads a number should come through here.
 */
export function toDecimal(fnName, index, value) {
  if (!isValidDecimal(value)) {
    throw spreadsheetError(
      ERROR.BAD_ARGUMENT,
      `argument ${index + 1} of ${fnName} is not a number: ${JSON.stringify(String(value))}`,
    );
  }
  return new Decimal(value);
}

/**
 * The built-in vocabulary, as descriptors.
 *
 * These wrap the EXISTING reducers rather than reimplementing them. That is
 * deliberate and load-bearing: the characterization corpus pins current
 * behaviour to the digit, so the factory has to be a change in how functions
 * are REGISTERED, not in what they compute. Rewriting them here would make
 * every corpus diff ambiguous.
 *
 * Arity bounds are transcribed from what each reducer actually tolerates, not
 * from what would be tidy. `round` reads index 0 and 1 and ignores the rest;
 * `if` reads three and ignores extras. Declaring those honestly is what lets
 * strict mode reject a wrong count without changing loose-mode behaviour.
 */
export const builtins = [
  {
 name: 'SUM', minArgs: 1, maxArgs: Infinity, reduce: reducerBuilders.sum,
},
  {
 name: 'AVERAGE', minArgs: 1, maxArgs: Infinity, reduce: reducerBuilders.average,
},
  {
 name: 'MUL', minArgs: 1, maxArgs: Infinity, reduce: reducerBuilders.mul,
},
  {
 name: 'ROUND', minArgs: 1, maxArgs: 2, reduce: reducerBuilders.round,
},
  {
 name: 'IF', minArgs: 3, maxArgs: 3, reduce: reducerBuilders.if,
},
];

/**
 * Operators dispatch through the SAME registry as named calls.
 *
 * Today `$add`, `$minus`, `$multiply`, `$percent` and `$divide` each close over
 * `reducerBuilders.<name>` directly, so overriding `$fn` extends only the
 * `NAME(...)` path and cannot touch `+ - * / %` at any price. Routing them
 * through the registry means overriding MULTIPLY changes `*` too — a property
 * the current design cannot provide.
 */
export const DEFAULT_OPERATORS = {
  '+': 'SUM',
  '-': 'MINUS',
  '*': 'MULTIPLY',
  '/': 'DIVIDE',
  '%': 'PERCENT',
};

/**
 * Reducers reachable only through an operator, never by name.
 *
 * `operatorOnly` keeps them out of `words` and `types.fn`. It is a separate flag
 * rather than "is it an operator target?" because SUM is BOTH — it is what `+`
 * dispatches to AND a function people write. Deriving callability from the
 * operator map excluded SUM from the vocabulary, which quietly stopped
 * `=SUM(A1,A2)` resolving at all.
 */
const OPERATOR_BUILTINS = [
  {
 name: 'MINUS', minArgs: 1, maxArgs: Infinity, operatorOnly: true, reduce: reducerBuilders.minus,
},
  {
 name: 'MULTIPLY', minArgs: 1, maxArgs: Infinity, operatorOnly: true, reduce: reducerBuilders.multiply,
},
  {
 name: 'DIVIDE', minArgs: 1, maxArgs: Infinity, operatorOnly: true, reduce: reducerBuilders.divide,
},
  {
 name: 'PERCENT', minArgs: 1, maxArgs: Infinity, operatorOnly: true, reduce: reducerBuilders.multiply,
},
];

/** Helpers handed to a custom `apply`. Everything a reducer legitimately needs. */
const helpers = {
  getCellValue: (str, env) => getCellValue({ env, str }),
  isValidDecimal,
  evaluateCondition,
  toDecimal,
  fail: (code, text) => { throw spreadsheetError(code, text); },
  Decimal,
};

/**
 * The rule PATTERNS, with the vocabulary left out.
 *
 * Patterns and vocabulary are separable and are owned in different places: this
 * is the grammar of a spreadsheet formula, which changes when the engine gains a
 * capability, while `words` and `types.fn` change every time anyone adds a
 * function. Generating the second from the registry is what collapses the four
 * edits to one; the first is passed through, so a consumer authoring patterns
 * elsewhere (in L0014) can supply its own.
 */
const DEFAULT_PATTERNS = {
  eval: {
    '=\\type{cellName}': ['$cell'],
    '=?': [{
      '%2': {
        '\\type{fn}(\\type{args})': '$call',
        '\\type{fn}(?,?)': '$call',
        '\\type{fn}(?)': '$call',
        '?>=?': '$ge',
        '?<=?': '$le',
        '?!=?': '$ne',
        '?>?': '$gt',
        '?<?': '$lt',
        '?=?': '$eq',
        '?+?': '$add',
        '?-?': '$minus',
        '?*?': '$multiply',
        '?/?': '$divide',
        '?%': '$percent',
        '-?': '$minus',
      },
    }],
    '-?': ['-%1'],
    '\\type{cellRange}': ['$range{"sep":"list"}'],
    '\\type{args}': ['$argsep'],
    '\\type{cellName}': ['%1%2'],
    '\\type{fn}(\\type{cellRange})': ['%1(%2)'],
    '??': ['%1%2'],
    '?': ['%1'],
  },
};

const TYPE_PATTERNS = {
  args: ['\\type{cellName}:\\type{cellName}', '?,?'],
  cellName: ['\\type{variable}\\type{integer}'],
  cellRange: ['\\type{cellName}:\\type{cellName}'],
};

/** Merge descriptors by upper-cased name; later wins, so a consumer can override a built-in. */
function buildRegistry(functions) {
  const registry = new Map();
  for (const d of [...builtins, ...OPERATOR_BUILTINS, ...(functions || [])]) {
    if (!d || !d.name) continue;
    registry.set(String(d.name).toUpperCase(), {
      minArgs: 1,
      maxArgs: Infinity,
      ...d,
      name: String(d.name).toUpperCase(),
    });
  }
  return registry;
}

/** Invoke one descriptor against an argument list. */
function invoke(descriptor, list, env, strict) {
  if (strict && (list.length < descriptor.minArgs || list.length > descriptor.maxArgs)) {
    let want;
    if (descriptor.maxArgs === Infinity) {
      want = `at least ${descriptor.minArgs}`;
    } else if (descriptor.minArgs === descriptor.maxArgs) {
      want = `${descriptor.minArgs}`;
    } else {
      want = `${descriptor.minArgs} to ${descriptor.maxArgs}`;
    }
    throw spreadsheetError(
      ERROR.WRONG_ARITY,
      `${descriptor.name} expects ${want} arguments, got ${list.length}`,
    );
  }
  if (descriptor.apply) {
    return String(descriptor.apply({
      args: list,
      env,
      helpers: { ...helpers, getCellValue: (str) => getCellValue({ env, str }) },
    }));
  }
  return `${list.reduce(descriptor.reduce(env), undefined)}`;
}

/**
 * Build a spreadsheet vocabulary: its expanders and its rule sets.
 *
 * `strict` turns the new diagnostics on. It is OFF by default and that is not
 * timidity: an unknown function currently returns a plausible string, and a
 * deployed item whose formula has been quietly wrong for a year would start
 * erroring the moment a consumer upgraded. Consumers opt in, watch, then it
 * becomes the default in a major.
 */
export function createSpreadsheet(options = {}) {
  const {
    functions = [],
    operators = DEFAULT_OPERATORS,
    patterns = DEFAULT_PATTERNS,
    strict = false,
  } = options;

  const registry = buildRegistry(functions);

  // The vocabulary, derived. This is the four-edits-to-one step: `words` and
  // `types.fn` are generated from the same registry the reducers come from, so
  // they cannot disagree with it or with each other.
  const callable = [...registry.values()]
    .filter((d) => !d.operatorOnly)
    .map((d) => d.name.toLowerCase())
    .sort();
  const words = Object.fromEntries(callable.map((n) => [n, n]));
  const types = { ...TYPE_PATTERNS, fn: callable };

  const dispatch = (name, list, env) => {
    const descriptor = registry.get(String(name).toUpperCase());
    if (!descriptor) {
      if (strict) {
        throw spreadsheetError(ERROR.UNKNOWN_FUNCTION, `unknown function ${String(name).toUpperCase()}`);
      }
      // Loose mode leaves the separator in, so unresolvedCall() can still see it.
      return `${name}${list.join(ARG_SEP)}`;
    }
    return invoke(descriptor, list, env, strict);
  };

  const operatorExpander = (opName, transform) => ({
    type: 'fn',
    fn: ({ env }) => ((args) => {
      const list = transform ? transform([...args]) : [...args];
      return dispatch(operators[opName], list, env);
    }),
  });

  const expanders = {
    ...baseExpanders,
    $call: {
      type: 'fn',
      fn: ({ env }) => ((args) => dispatch(
        args[0],
        String(args[1] === undefined ? '' : args[1]).split(ARG_SEP),
        env,
      )),
    },
    $add: operatorExpander('+'),
    $minus: operatorExpander('-', (args) => (args.length === 1 ? ['0', ...args] : args)),
    $multiply: operatorExpander('*'),
    $divide: operatorExpander('/'),
    $percent: operatorExpander('%', (args) => [...args, '0.01']),
  };

  const evalRules = { words, types, rules: patterns.eval };

  return {
    expanders,
    rules: { evalRules },
    functions: [...registry.values()],
    helpers,
    strict,
    /** Check a result for an unresolved call. Returns an error or null. */
    checkResult(value) {
      const residue = unresolvedCall(value);
      if (!residue) return null;
      return spreadsheetError(ERROR.UNRESOLVED, `unresolved expression: ${residue}`);
    },
  };
}
