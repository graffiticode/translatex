/*
 * Copyright 2021 ARTCOMPILER INC. All Rights Reserved.
 *
 */
import Decimal from 'decimal.js';
import { Ast, Parser } from '@graffiticode/parselatex';
import { Assert, assert, message } from './assert.js';
import { rules } from './rules.js';

(function (ast) {

  function newNode(op, args) {
    return {
      op,
      args,
    };
  }

  function binaryNode(op, args) {
    if (args.length > 1) {
      return { op, args };
    }
    return args[0];
  }

  const createLetterArray = (start, end) => (
    Array.from({ length: end.charCodeAt(0) - start.charCodeAt(0) + 1 }, (_, i) => String.fromCharCode(start.charCodeAt(0) + i))
  );

  const createIntegerArray = (start, end) => {
    const startNum = +start;
    const endNum = +end;
    return Array.from({ length: endNum - startNum + 1 }, (_, i) => String(startNum + i));
  };

  const isValidDecimal = (val) => {
    try {
      const d = new Decimal(val);
      return d !== null;
    } catch (error) {
      // Ignore the error
      return false;
    }
  };

  const parseCellName = (name) => [name.slice(0, 1), name.slice(1)];

  const isLetter = (c) => c.toUpperCase() >= 'A' && c.toUpperCase() <= 'Z';

  const isIntegerString = (str) => /^-?\d+$/.test(str);

  const isValidCellName = (name) => parseCellName(name).reduce((acc, val, index) => (
    index === 0 && isLetter(val) || isIntegerString(val)
  ), false);

  const rangeReducerBuilder = () => (acc = {}, val, index) => {
    if (index === 0) {
      return {
        start: parseCellName(val),
      };
    }
      const start = acc.start;
      const end = parseCellName(val);
      const colNames = createLetterArray(start[0], end[0]);
      const rowNames = createIntegerArray(start[1], end[1]);
      const cellValues = colNames.flatMap((colName) => (
        rowNames.map((rowName) => (
          colName.toUpperCase() + rowName
        ))
      )).filter((v) => (
        v !== undefined
      ));
      return cellValues.join(',');

  };

  const normalizeNode = (node) => node;

  const normalizeReducerBuilder = () => (acc = [], val) => {
    return [
      ...acc,
      val.toUpperCase(),
    ];
  };

  const parseFormatString = (formatStr) => {
    // Parse Excel-like format strings
    // Examples: "$#,##0.00", "€#.##0,00", "¥#,##0", "#,##0.00_$", "($#,##0.00)"
    const result = {
      currency: '',
      thousandsSeparator: ',',
      decimalSeparator: '.',
      decimalPlaces: 0,
      prefix: '',
      suffix: '',
      showThousands: false,
      accountingStyle: false,
    };

    // Check for accounting style (parentheses format)
    if (formatStr.startsWith('(') && formatStr.endsWith(')')) {
      result.accountingStyle = true;
      formatStr = formatStr.slice(1, -1); // Remove outer parentheses
    }

    // Extract currency symbols and position
    const currencySymbols = ['$', '€', '¥', '£', '₹', '₽', '¢'];
    let workingStr = formatStr;
    // Check for currency at start
    currencySymbols.some((symbol) => {
      if (workingStr.startsWith(symbol)) {
        result.currency = symbol;
        result.prefix = symbol;
        workingStr = workingStr.slice(1);
        return true;
      }
      return false;
    });

    // Check for currency at end (after underscore)
    if (!result.currency) {
      currencySymbols.some((symbol) => {
        if (workingStr.includes(`_${symbol}`)) {
          result.currency = symbol;
          result.suffix = symbol;
          workingStr = workingStr.replace(`_${symbol}`, '');
          return true;
        }
        return false;
      });
    }

    // Detect thousands separator and decimal separator
    if (workingStr.includes('#,##0') || workingStr.includes('#.##0') || workingStr.includes('# ##0')) {
      result.showThousands = true;
      if (workingStr.includes('#,##0.')) {
        // Standard format: comma thousands, dot decimal
        result.thousandsSeparator = ',';
        result.decimalSeparator = '.';
      } else if (workingStr.includes('#.##0,')) {
        // European format: dot thousands, comma decimal
        result.thousandsSeparator = '.';
        result.decimalSeparator = ',';
      } else if (workingStr.includes('# ##0,')) {
        // French/International format: space thousands, comma decimal
        result.thousandsSeparator = ' ';
        result.decimalSeparator = ',';
      } else if (workingStr.includes('# ##0.')) {
        // Canadian format: space thousands, dot decimal
        result.thousandsSeparator = ' ';
        result.decimalSeparator = '.';
      } else if (workingStr.includes('# ##0')) {
        // Space thousands, no decimals (default to dot decimal for future use)
        result.thousandsSeparator = ' ';
        result.decimalSeparator = '.';
      } else if (workingStr.includes('#.##0')) {
        // Dot thousands, no decimals (default to comma decimal for European style)
        result.thousandsSeparator = '.';
        result.decimalSeparator = ',';
      }
      // Default case for #,##0 (comma thousands) is already set in result initialization
    }

    // Count decimal places
    const decimalMatch = workingStr.match(/[.,]0+$/);
    if (decimalMatch) {
      result.decimalPlaces = decimalMatch[0].length - 1;
    }

    return result;
  };

  const formatNumber = (value, formatOptions) => {
    const num = Number(value);
    if (Number.isNaN(num)) {
      return value;
    }

    const {
      thousandsSeparator,
      decimalSeparator,
      decimalPlaces,
      prefix,
      suffix,
      showThousands,
      accountingStyle,
    } = formatOptions;

    // Handle negative numbers for accounting style
    const isNegative = num < 0;
    const absoluteNum = Math.abs(num);

    // Format the absolute number with specified decimal places
    let formatted = absoluteNum.toFixed(decimalPlaces);

    // Replace decimal separator if needed
    if (decimalSeparator !== '.') {
      formatted = formatted.replace('.', decimalSeparator);
    }

    // Add thousands separator if needed
    if (showThousands) {
      const parts = formatted.split(decimalSeparator);
      const integerPart = parts[0];
      const decimalPart = parts[1] || '';

      // Add thousands separators to integer part
      const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

      formatted = decimalPart ? `${withThousands}${decimalSeparator}${decimalPart}` : withThousands;
    }

    // Add prefix and suffix
    formatted = `${prefix}${formatted}${suffix}`;

    // Handle accounting style for negative numbers
    if (accountingStyle && isNegative) {
      return `(${formatted})`;
    } if (isNegative) {
      return `-${formatted}`;
    }

    return formatted;
  };

  const formatCurrency = (str, decimalPlaces = 2) => {
    // Default currency formatting for backward compatibility
    return formatNumber(str, {
      currency: '$',
      thousandsSeparator: ',',
      decimalSeparator: '.',
      decimalPlaces,
      prefix: '$',
      suffix: '',
      showThousands: true,
    });
  };

  const isDateFormat = (formatStr) => {
    // Check if the format string is a date format
    const datePatterns = ['m/', 'd/', 'y', 'mmm', 'mmmm', 'ddd', 'dddd'];
    const lowerFormat = formatStr.toLowerCase();
    return datePatterns.some((pattern) => lowerFormat.includes(pattern));
  };

  const parseDate = (value) => {
    // Parse various date input formats
    // Supports: Date objects, timestamps, date strings
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const num = Number(value);
    if (!Number.isNaN(num)) {
      // Mac Excel serial date number (days since 1904-01-01, no leap year bug)
      if (num >= 0 && num < 2957004) { // Excel max date is Dec 31, 9999
        // Mac Excel date serial number
        // Mac Excel treats January 1, 1904 as serial number 0
        const days = Math.floor(num);

        // Mac Excel epoch is January 1, 1904
        // Use UTC to avoid timezone issues
        const macExcelEpoch = new Date(Date.UTC(1904, 0, 1));
        const date = new Date(macExcelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
        return date;
      }
      // Unix timestamp (milliseconds) - very large numbers
      if (num > 2957004) {
        return new Date(num);
      }
    }

    // Try to parse as date string
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (date, formatStr) => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
      return String(date || '');
    }

    const pad = (num, digits = 2) => String(num).padStart(digits, '0');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Build a map of all format tokens and their values
    const tokens = {
      yyyy: String(date.getFullYear()),
      yy: pad(date.getFullYear() % 100),
      mmmm: monthsFull[date.getMonth()],
      mmm: months[date.getMonth()],
      mm: pad(date.getMonth() + 1),
      m: String(date.getMonth() + 1),
      dd: pad(date.getDate()),
      d: String(date.getDate()),
    };

    // Process the format string character by character
    let result = '';
    let i = 0;

    while (i < formatStr.length) {
      let matched = false;

      // Try to match tokens from longest to shortest
      const tokenKeys = Object.keys(tokens).sort((a, b) => b.length - a.length);

      tokenKeys.some((token) => {
        const substr = formatStr.substring(i, i + token.length).toLowerCase();
        if (substr === token) {
          result += tokens[token];
          i += token.length;
          matched = true;
          return true;
        }
        return false;
      });

      if (!matched) {
        result += formatStr[i];
        i++;
      }
    }

    return result;
  };

  const formatValue = ({ env, args }) => {
    const format = args[1] || env.format || '';
    let formattedValue;
    if (format.toLowerCase() === 'currency') {
      // Backward compatibility
      formattedValue = formatCurrency(args[0]);
    } else if (format.includes('#') || format.includes('0')) {
      // Excel-like format string for numbers
      const formatOptions = parseFormatString(format);
      formattedValue = formatNumber(args[0], formatOptions);
    } else if (isDateFormat(format)) {
      // Date format string
      const date = parseDate(args[0]);
      formattedValue = date ? formatDate(date, format) : args[0];
    } else {
      formattedValue = args[0];
    }
    return formattedValue;
  };

  const getCellValue = ({ env, str }) => (
    isValidCellName(str) && env[str.toUpperCase()]?.val || str
  );

  const evaluateCondition = (value) => {
    // Handle boolean-like evaluations similar to Excel
    // FALSE: 0, "0", "", "FALSE" (case insensitive)
    // TRUE: everything else
    if (value === null || value === undefined || value === '') {
      return false;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === '0' || trimmed.toUpperCase() === 'FALSE') {
        return false;
      }
    }
    if (typeof value === 'number' || value instanceof Decimal) {
      return +value !== 0;
    }
    return true;
  };

  const reducerBuilders = {
    round: (env) => (acc = '', str, index) => {
      const cellValue = getCellValue({ env, str });
      if (isValidDecimal(cellValue)) {
        if (index === 0) {
          return new Decimal(cellValue);
        }
        if (index === 1) {
          return new Decimal(acc).toDecimalPlaces(+cellValue, Decimal.ROUND_HALF_UP);
        }
      }
      return acc;
    },
    sum: (env) => (acc = 0, str) => {
      const cellValue = getCellValue({ env, str });
      if (isValidDecimal(cellValue)) {
        return new Decimal(acc).plus(new Decimal(cellValue));
      }
      return acc;
    },
    minus: (env) => (acc = '', str, index) => {
      const cellValue = getCellValue({ env, str });
      if (isValidDecimal(cellValue)) {
        if (index === 0) {
          return new Decimal(cellValue);
        }
        return new Decimal(acc).minus(new Decimal(cellValue));
      }
      return acc;
    },
    multiply: (env) => (acc = 1, str) => {
      const cellValue = getCellValue({ env, str });
      if (isValidDecimal(cellValue)) {
        return new Decimal(acc).times(new Decimal(cellValue));
      }
      return acc;
    },
    divide: (env) => (acc = '', str, index) => {
      const cellValue = getCellValue({ env, str });
      if (isValidDecimal(cellValue)) {
        if (index === 0) {
          return new Decimal(cellValue);
        }
        return new Decimal(acc).dividedBy(new Decimal(cellValue));
      }
      return acc;
    },
    normalize: normalizeReducerBuilder,
    range: rangeReducerBuilder,
    if: (env) => (acc = null, str, index) => {
      str = getCellValue({ env, str });
      if (index === 0) {
        // First argument is the condition
        return { condition: evaluateCondition(str), trueValue: null, falseValue: null };
      } if (index === 1) {
        // Second argument is the true value
        return { ...acc, trueValue: str };
      } if (index === 2) {
        // Third argument is the false value
        // Return the appropriate value based on the condition
        return acc.condition ? acc.trueValue : str;
      }
      // Ignore extra arguments
      return acc;
    },
    average: (env) => {
      let sum = new Decimal(0);
      let count = 0;
      return (acc, str) => {
        str = getCellValue({ env, str });
        if (isValidDecimal(str)) {
          sum = sum.plus(new Decimal(str));
          count++;
        }
        return count > 0 ? sum.dividedBy(count) : new Decimal(0);
      };
    },
  };

  const expanderBuilders = {
    $cell: {
      type: 'fn',
      fn: ({ env }) => (
        (args) => (
          env[args[1].toUpperCase()]?.val || '0'
        )
      ),
    },
    $fmt: {
      type: 'fn',
      fn: ({ config, env }) => (
        (args) => {
          // Handle raw config parsing for $fmt when used with parameters like $fmt{%1,format}
          if (config.rawConfig) {
            // Parse {isNegative:true} or {%1,format} -> [value, format]
            const configStr = config.rawConfig.slice(1, -1); // Remove { }
            // Check for isNegative flag
            if (configStr.includes('isNegative:true')) {
              // Apply negative to the value for accounting style processing
              const formatSpec = env.format?.formatString || env.format || '';
              args = [`-${args[0]}`, formatSpec];
            } else if (configStr.includes('isNegative:false')) {
              // Keep value positive
              const formatSpec = env.format?.formatString || env.format || '';
              args = [args[0], formatSpec];
            } else {
              // Legacy format: Split only on the first comma to separate value from format
              const firstCommaIndex = configStr.indexOf(',');
              if (firstCommaIndex >= 0) {
                let valueStr = configStr.slice(0, firstCommaIndex);
                const format = configStr.slice(firstCommaIndex + 1);
                // Replace %1 with actual value and use second part as format
                valueStr = valueStr.replace('%1', args[0]);
                args = [valueStr, format];
              }
            }
          } else if (args.length === 1) {
            // When $fmt is used without parameters, get format from environment
            const formatSpec = env.format?.formatString || env.format || '';
            args = [args[0], formatSpec];
          }
          return formatValue({ env, args });
        }
      ),
    },
    $range: {
      type: 'fn',
      fn: () => (
        (args) => (
          args.reduce(reducerBuilders.range(), undefined)
        )
      ),
    },
    $add: {
      type: 'fn',
      fn: ({ env }) => (
        (args) => (
          `${args.reduce(reducerBuilders.sum(env), undefined)}`
        )
      ),
    },
    $minus: {
      type: 'fn',
      fn: ({ env }) => (
        (args) => {
          if (args.length === 1) {
            args.unshift('0');
          }
          return `${args.reduce(reducerBuilders.minus(env), undefined)}`;
        }
      ),
    },
    $multiply: {
      type: 'fn',
      fn: ({ env }) => (
        (args) => (
          `${args.reduce(reducerBuilders.multiply(env), undefined)}`
        )
      ),
    },
    $percent: {
      type: 'fn',
      fn: ({ env }) => (
        (args) => {
          args.push('0.01');
          return `${args.reduce(reducerBuilders.multiply(env), undefined)}`;
        }
      ),
    },
    $divide: {
      type: 'fn',
      fn: ({ env }) => (
        (args) => (
          `${args.reduce(reducerBuilders.divide(env), undefined)}`
        )
      ),
    },
    $fn: {
      type: 'fn',
      fn: ({ env }) => (
        (args) => (
          `${args[1].split(',').reduce(reducerBuilders[args[0].toLowerCase()](env), undefined)}`
        )
      ),
    },
    $normalize: {
      type: 'fn',
      fn: ({ config, env }) => (
        (args) => (
          `${args.reduce(normalizeNode(reducerBuilders.normalize(env)), config?.acc)}`
        )
      ),
    },
  };

  const getExpanderBuilderConfig = (template) => {
    const configIndex = template.indexOf('{');
    const expanderName = (configIndex > 0 && template.slice(0, configIndex) || template).trim();
    assert(expanderBuilders[expanderName]);
    const expanderConfig = configIndex > 0 && template.slice(configIndex);
    // Special handling for $fmt expander - don't parse as JSON
    if (expanderName === '$fmt') {
      return { rawConfig: expanderConfig };
    }
    return expanderConfig && JSON.parse(expanderConfig) || {};
  };

  // The outer Visitor function provides a global scope for all visitors,
  // as well as dispatching to methods within a visitor.
  function Visitor(ast) {
    function visit(options, node, visit, resume) {
      assert(node.op && node.args, `Visitor.visit() op=${node.op} args = ${node.args}`);
      switch (node.op) {
      case Parser.NUM:
        node = visit.numeric(node, resume);
        break;
      case Parser.ADD:
      case Parser.SUB:
      case Parser.PM:
      case Parser.BACKSLASH: // set operator
      case Parser.DIV:
      case Parser.FRAC:
      case Parser.BINOM:
      case Parser.LOG:
      case Parser.COLON:
      case Parser.FUNC:
      case Parser.TYPE:
      case Parser.SUBSCRIPT:
        if (node.args.length === 1) {
          node = visit.unary(node, resume);
        } else {
          node = visit.binary(node, resume);
        }
        break;
      case Parser.MUL:
      case Parser.TIMES:
      case Parser.COEFF:
      case Parser.CDOT:
        node = visit.multiplicative(node, resume);
        break;
      case Parser.POW:
        node = visit.exponential(node, resume);
        break;
      case Parser.VAR:
        node = visit.variable(node, resume);
        break;
      case Parser.SQRT:
      case Parser.SIN:
      case Parser.COS:
      case Parser.TAN:
      case Parser.SEC:
      case Parser.CSC:
      case Parser.COT:
      case Parser.ARCSIN:
      case Parser.ARCCOS:
      case Parser.ARCTAN:
      case Parser.ARCSEC:
      case Parser.ARCCSC:
      case Parser.ARCCOT:
      case Parser.SINH:
      case Parser.COSH:
      case Parser.TANH:
      case Parser.ARCSINH:
      case Parser.ARCCOSH:
      case Parser.ARCTANH:
      case Parser.ARCSECH:
      case Parser.ARCCSCH:
      case Parser.ARCCOTH:
      case Parser.SECH:
      case Parser.CSCH:
      case Parser.COTH:
      case Parser.PERCENT:
      case Parser.M:
      case Parser.ABS:
      case Parser.FACT:
      case Parser.FORALL:
      case Parser.EXISTS:
      case Parser.IN:
      case Parser.SUM:
      case Parser.LIM:
      case Parser.EXP:
      case Parser.TO:
      case Parser.DERIV:
      case Parser.INTEGRAL:
      case Parser.PROD:
      case Parser.CUP:
      case Parser.BIGCUP:
      case Parser.CAP:
      case Parser.BIGCAP:
      case Parser.PIPE:
      case Parser.ION:
      case Parser.OVERLINE:
      case Parser.OVERSET:
      case Parser.UNDERSET:
      case Parser.MATHBF:
      case Parser.TEXT:
      case Parser.NONE:
      case Parser.DEGREE:
      case Parser.DOT:
      case Parser.MATHFIELD:
      case Parser.SET:
      case Parser.NOT:
      case Parser.OPERATORNAME:
        node = visit.unary(node, resume);
        break;
      case Parser.COMMA:
      case Parser.MATRIX:
      case Parser.VEC:
      case Parser.ROW:
      case Parser.COL:
      case Parser.LIST:
      case Parser.ANGLEBRACKET:
        node = visit.comma(node, resume);
        break;
      case Parser.EQL:
      case Parser.LT:
      case Parser.LE:
      case Parser.GT:
      case Parser.GE:
      case Parser.NE:
      case Parser.NGTR:
      case Parser.NLESS:
      case Parser.NI:
      case Parser.SUBSETEQ:
      case Parser.SUPSETEQ:
      case Parser.SUBSET:
      case Parser.SUPSET:
      case Parser.NNI:
      case Parser.NSUBSETEQ:
      case Parser.NSUPSETEQ:
      case Parser.NSUBSET:
      case Parser.NSUPSET:
      case Parser.APPROX:
      case Parser.IMPLIES:
      case Parser.PERP:
      case Parser.PROPTO:
      case Parser.PARALLEL:
      case Parser.NPARALLEL:
      case Parser.SIM:
      case Parser.CONG:
      case Parser.CAPRIGHTARROW:
      case Parser.RIGHTARROW:
      case Parser.LEFTARROW:
      case Parser.LONGRIGHTARROW:
      case Parser.LONGLEFTARROW:
      case Parser.OVERRIGHTARROW:
      case Parser.OVERLEFTARROW:
      case Parser.CAPLEFTRIGHTARROW:
      case Parser.LEFTRIGHTARROW:
      case Parser.LONGLEFTRIGHTARROW:
      case Parser.OVERLEFTRIGHTARROW:
        node = visit.equals(node, resume);
        break;
      case Parser.PAREN:
      case Parser.BRACKET:
      case Parser.BRACE:
      case Parser.INTERVAL:
      case Parser.INTERVALOPEN:
      case Parser.INTERVALLEFTOPEN:
      case Parser.INTERVALRIGHTOPEN:
        node = visit.paren(node);
        break;
      default:
        if (visit.name !== 'normalizeLiteral' &&
            visit.name !== 'sort') {
          node = newNode(Parser.VAR, [`INTERNAL ERROR Should not get here. Unhandled node operator ${node.op}`]);
        }
        break;
      }
      return node;
    }
    function lookup(options, word) {
      if (!word) {
        return '';
      }
      const words = Parser.option(options, 'words');
      let val;
      if (words) {
        val = words[word];
      }
      if (!val) {
        val = word;
        if (val.charAt(0) === '\\') {
          val = val.substring(1);
        }
      }
      return val;
    }
    function normalizeFormatObject(fmt) {
      // Normalize the fmt object to an array of objects
      let list = [];
      switch (fmt.op) {
      case Parser.VAR:
        list.push({
          code: fmt.args[0],
        });
        break;
      case Parser.MUL:
        {
          let code = '';
          let length;  // undefined and zero have different meanings.
          fmt.args.forEach((f) => {
            if (f.op === Parser.VAR) {
              code += f.args[0];
            } else if (f.op === Parser.NUM) {
              length = +f.args[0];
            }
          });
          list.push({
            code,
            length,
          });
        }
        break;
      case Parser.COMMA:
        fmt.args.forEach((f) => {
          list = list.concat(normalizeFormatObject(f));
        });
        break;
      default:
        break;
      }
      return list;
    }
    function parseFormatPattern(pattern) {
      // Normalize the fmt object to an array of objects
      const [name, arg] = pattern.split('[');
      return {
        name,
        arg: arg && arg.substring(0, arg.indexOf(']')) || undefined,
      };
    }
    function checkNumberType(fmt, node) {
      const fmtList = normalizeFormatObject(fmt);
      return fmtList.some((f) => {
        const code = f.code;
        const length = f.length;
        switch (code) {
        case 'integer':
          if (node.numberFormat === 'integer') {
            if (length === undefined || length === node.args[0].length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case 'decimal':
          if (node.numberFormat === 'decimal' &&
              node.isRepeating) {
            if (length === undefined) {
              return true;
            }
              // Repeating is infinite.
              return false;

          }
          if (node.numberFormat === 'decimal') {
            if (length === undefined ||
                length === 0 && node.args[0].indexOf('.') === -1 ||
                length === node.args[0].substring(node.args[0].indexOf('.') + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case 'repeatingDecimal':
          if (node.numberFormat === 'decimal' &&
              node.isRepeating) {
            assert(!length, 'The repeatingDecimal pattern does not take a length');
            return true;
          }
          return false;
        case 'number':
          if (node.numberFormat === 'decimal' &&
              node.isRepeating) {
            if (length === undefined) {
              return true;
            }
              // Repeating is infinite.
              return false;

          }
          if (node.numberFormat === 'integer' ||
              node.numberFormat === 'decimal') {
            const brk = node.args[0].indexOf('.');
            if (length === undefined ||
                length === 0 && brk === -1 ||
                brk >= 0 && length === node.args[0].substring(brk + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case 'scientific':
          if (node.isScientific) {
            const coeff = node.args[0].args[0];
            if (length === undefined ||
                length === 0 && coeff.indexOf('.') === -1 ||
                length === coeff.substring(coeff.indexOf('.') + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case 'fraction':
          if (node.isFraction ||
              node.isMixedNumber) {
            return true;
          }
          break;
        case 'simpleFraction':
        case 'nonMixedFraction': // deprecated
          if (node.isFraction) {
            return true;
          }
          break;
        case 'mixedFraction':  // deprecated
        case 'mixedNumber':
          if (node.isMixedNumber) {
            return true;
          }
          break;
        case 'fractionOrDecimal':
          if (node.isFraction ||
              node.isMixedNumber ||
              node.numberFormat === 'decimal') {
            return true;
          }
          break;
        default:
          assert(false, message(2015, [code]));
          break;
        }
        return false;
      });
    }
    function checkMatrixType(fmt, node) {
      const fmtList = normalizeFormatObject(fmt);
      return fmtList.some((f) => {
        const code = f.code;
        switch (code) {
        case 'simpleSmallRowMatrix':
        case 'smallRowMatrix':
          return node.op === Parser.MATRIX && node.m === 1 && node.n < 4;
        case 'simpleSmallColumnMatrix':
        case 'smallColumnMatrix':
          return node.op === Parser.MATRIX && node.m < 4 && node.n === 1;
        case 'simpleSmallMatrix':
        case 'smallMatrix':
          return node.op === Parser.MATRIX && node.m < 4 && node.n < 4;
        case 'matrix':
          return node.op === Parser.MATRIX;
        case 'row':
          return node.op === Parser.ROW;
        case 'column':
          return node.op === Parser.COL;
        default:
          return false;
        }
      });
    }

    function checkPolynomialType(pattern, node) {
      const fmt = parseFormatPattern(pattern);
      const name = fmt.name;
      const arg = fmt.arg;
      switch (name) {
      case 'polynomial':
        if (arg) {
          if (arg.indexOf('>') === 0) {
            const n = parseInt(arg.substring(1), 10);
            return node.isPolynomial > n;
          }
          const n = parseInt(arg, 10);
          return node.isPolynomial > n;
        }
        return node.isPolynomial;
      default:
        return false;
      }
    }

    function isSimpleExpression(node) {
      if (node.op === Parser.NUM ||
          node.op === Parser.VAR ||
          typeof node === 'string') {
        return true;
      }
      return false;
    }
    function hasSimpleExpressions(node) {
      assert(node.op === Parser.MATRIX || node.op === Parser.ROW || node.op === Parser.COL);
      return node.args.every((n) => {
        if (n.op === Parser.MATRIX || n.op === Parser.ROW || n.op === Parser.COL) {
          return hasSimpleExpressions(n);
        }
        return isSimpleExpression(n);
      });
    }
    function matchType(options, pattern, node) {
      if (pattern.op === Parser.TYPE &&
          pattern.args[0].op === Parser.VAR) {
        let name = pattern.args[0].args[0];
        name = name.indexOf('[') > 0 && name.slice(0, name.indexOf('[')) || name;
        switch (name) {
        case 'number':
        case 'integer':
        case 'decimal':
        case 'scientific':
        case 'fraction':
        case 'simpleFraction':
        case 'mixedFraction':  // deprecated
        case 'mixedNumber':
        case 'fractionOrDecimal':
        case 'repeatingDecimal':
          return checkNumberType(pattern.args[0], node);
        case 'variable':
          return node.op === Parser.VAR;
        case 'simpleSmallRowMatrix':
        case 'simpleSmallColumnMatrix':
        case 'simpleSmallMatrix':
          return checkMatrixType(pattern.args[0], node) && hasSimpleExpressions(node);
        case 'smallRowMatrix':
        case 'smallColumnMatrix':
        case 'smallMatrix':
        case 'matrix':
        case 'row':
        case 'column':
          return checkMatrixType(pattern.args[0], node);
        case 'polynomial':
          return checkPolynomialType(pattern.args[0].args[0], node);
        default:
          {
            const types = Parser.option(options, 'types');
            const type = types[name];
            if (type) {
              assert(type instanceof Array);
              return type.some((pattern) => {
                // FIXME pre-compile types.
                const matches = match(options, [Parser.create(options, pattern)], node);
                return matches.length > 0;
              });
            }
          }
        }
        return false;
      } if (pattern.op === Parser.COLON &&
          pattern.args[0].op === Parser.VAR && pattern.args[0].args[0] === '?') {
        // This is a legacy case that can be removed when all content is updated.
        assert(pattern.args[1].op === Parser.VAR);
        switch (pattern.args[1].args[0]) {
        case 'N':
          return node.op === Parser.NUM;
        case 'V':
          return node.op === Parser.VAR;
        default:
        }
        return false;
      }
      return (
        pattern.op === Parser.VAR && pattern.args[0] === '?' ||
        pattern.op === Parser.MATRIX && node.op === Parser.MATRIX
      );
    }

    // ["? + ?", "? - ?"], "1 + 2"
    function match(options, patterns, node) {
      if (patterns.size === 0 || node === undefined) {
        return false;
      }
      const matches = patterns.filter((pattern) => {
        if (pattern.op === undefined || node.op === undefined) {
          return false;
        }
        if (ast.intern(pattern) === ast.intern(node) ||
            matchType(options, pattern, node)) {
          return true;
        }
        if (pattern.op === node.op) {
          if (pattern.args.length === node.args.length) {
            // Same number of args, so see if each matches.
            return pattern.args.every((arg, i) => {
              if (pattern.op === Parser.VAR) {
                // We've already matched ? so we are looking for literal matches.
                if (arg === node.args[i]) {
                  return true;
                }
                return false;
              }
              const result = match(options, [arg], node.args[i]);
              return result.length === 1;
            });
          } if (pattern.args.length < node.args.length) {
            // Different number of args, then see if there is a wildcard match.
            const nargs = node.args.slice(1);
            if (pattern.args.length === 2) {
              // Binary node pattern
              const result = (
                match(options, [pattern.args[0]], node.args[0]).length > 0 &&
                match(options, [pattern.args[1]], newNode(node.op, nargs)).length > 0
                  // Match rest of the node against the second pattern argument.
              );
              return result;
            }
          }
        }
        return false;
      });
      // if (matches.length > 0) {
      //   console.log("match() node: " + JSON.stringify(node, null, 2));
      //   console.log("match() matches: " + JSON.stringify(matches, null, 2));
      // }
      return matches;
    }
    function expandBinary(template, args, env) {
      const t = template;
      args.forEach((arg, i) => {
        template = template.replace(new RegExp(`%${i + 1}`, 'g'), arg.args[0]);
      });
      if (args.length > 2) {
        return expandBinary(t, [newNode(Parser.VAR, [template])].concat(args.slice(2)), env);
      }
      return template;
    }
    function expand(expansion, args, env) {
      env = env || {};
      // Use first matched expansion for now.
      let template = expansion.template;
      // console.log(
      //   "expand()",
      //   "expansion=" + JSON.stringify(expansion, null, 2),
      // );
      if (args.length === 0) {
        // This handles the case of empty brackets, such as () and \{\}.
        args.push(newNode(Parser.VAR, ['']));
      }
      if (template && template.indexOf('%OP') >= 0 && env.op) {
        template = template.replace(new RegExp('%OP', 'g'), env.op);
      }
      if (template && args) {
        if (template.indexOf('%%') >= 0) {
          template = template.replace(new RegExp('%%', 'g'), args[0].args[0]);
        }
        const configIndex = template.indexOf('{');
        const expanderName = (configIndex > 0 && template.slice(0, configIndex) || template).trim();
        if (expanderBuilders[expanderName]) {
          const expanderBuilder = expanderBuilders[expanderName].fn;
          const config = getExpanderBuilderConfig(template);
          const expander = expanderBuilder({ config, env });
          const vals = [];
          args.forEach((arg) => {
            vals.push(arg.args[0]);
          });
          template = expander(vals);
        }
        if (template.indexOf('%*') >= 0) {
          let s = '';
          args.forEach((arg, i) => {
            if (s !== '') {
              s += ' ';
            }
            // Replicate expansion for each argument.
            if (i === args.length - 1) {
              // If this is the last element in the sequence, lop off the
              // trailing separator. Times two because what comes before the
              // "%*", if anything, is a bracket so need to include the close
              // bracket.
              template = template.slice(0, 2 * template.indexOf('%*') + '%*'.length);
            }
            s += template.replace('%*', arg.args[0]).replace('%M', arg.m).replace('%N', arg.n);
          });
          template = s;  // Overwrite template.
        }
        if (template.indexOf('%IP') >= 0) {
          template = template.replace(new RegExp('%IP', 'g'), env.ip);
        }
        if (template.indexOf('%FP0') >= 0) {
          template = template.replace(new RegExp('%FP0', 'g'), env.fp);
        }
        if (template.indexOf('%FP') >= 0) {
          template = template.replace(new RegExp('%FP', 'g'), env.fp.split('').join(' '));
        }
        if (template.indexOf('%M') >= 0) {
          assert(env.m);
          template = template.replace(new RegExp('%M', 'g'), env.m);
        }
        if (template.indexOf('%N') >= 0) {
          assert(env.n);
          template = template.replace(new RegExp('%N', 'g'), env.n);
        }
        if (expansion.isBinary && args.length > 2) {
          template = expandBinary(template, args, env);
        } else {
          args.forEach((arg, i) => {
            template = template.replace(new RegExp(`%${i + 1}`, 'g'), !arg ? '' : arg.args[0]);
          });
        }
        return {
          op: Parser.VAR,
          args: [template],
        };
      }
      return args[0];
    }

    function matchedExpansion(options, rules, matches) {
      let expansions = [];
      matches.forEach((m) => {
        expansions = expansions.concat(rules[JSON.stringify(m)]);
      });
      if (expansions.length === 0) {
        // Make one up.
        expansions.push({ template: '' });
      }
      // Use first match.
      return expansions[0];
    }

    function getNodeArgsForExpansion(node, expansion) {
      // Parse out the number of params in the expansion.
      assert(typeof expansion.template === 'string');
      const template = expansion.template;
      if (template.indexOf('%%') >= 0) {
        return [node];
      }
      // let a = template.split("%");  // ["..", "1..", "2.."]
      // let nn = a.filter(n => {
      //   // Include '%1', %M, %N
      //   return !Number.isNaN(+n[0]) || n[0] === "M" || n[0] === "N";
      // });
      return node.args;
    }
    function unflattenLeftRecursive(node) {
      if (node.args.length <= 2) {
        return node;
      }
      const rnode = node.args.pop();
      return binaryNode(node.op, [
        unflattenLeftRecursive(node),
        rnode,
      ]);
    }
    function unflattenRightRecursive(node) {
      if (node.args.length <= 2) {
        return node;
      }
      const lnode = node.args.shift();
      return binaryNode(node.op, [
        lnode,
        unflattenRightRecursive(node),
      ]);
    }
    function translate(options, root, rules) {
      // Translate math from LaTeX.
      // rules = {ptrn: tmpl, ...};
      if (rules instanceof Array) {
        if (rules.length === 1) {
          rules = rules[0];
        } else {
          rules = mergeMaps(options, rules[1], rules[0]);
        }
      }
      const globalRules = rules;
      const keys = Object.keys(rules);
      const patterns = [];
      keys.forEach((k) => {
        patterns.push(JSON.parse(k));
      });
      if (!root || !root.args) {
        assert(false, 'Should not get here. Illformed node.');
        return 0;
      }
      return visit(options, root, {
        name: 'translate',
        numeric(node) {
          const args = [{
            op: Parser.VAR,
            args: [lookup(options, node.args[0])],
          }];
          const env = options.env || {};
          if (node.numberFormat === 'decimal') {
            const parts = node.args[0].split('.');
            env.ip = parts[0];
            env.fp = parts[1] || '0';  // 7.
          }
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          const expansion = matchedExpansion(options, rules, matches, 1);
          return expand(expansion, args, env);
        },
        binary(node) {
          if (node.op === Parser.SUBSCRIPT) {
            node = unflattenRightRecursive(node);
          } else {
            node = unflattenLeftRecursive(node);
          }
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          const expansion = matchedExpansion(options, rules, matches, node.args.length);
          const argRules = getRulesForArgs(expansion);
          const nodeArgs = getNodeArgsForExpansion(node, expansion);
          let args = [];
          nodeArgs.forEach((n, i) => {
            const rhs = Parser.option(options, 'RHS', i > 0);
            args = args.concat(translate(options, n, [globalRules, argRules]));
            Parser.option(options, 'RHS', rhs);
          });
          expansion.isBinary = true;
          return expand(expansion, args, { ...options.env, op: node.op });
        },
        multiplicative(node) {
          node = unflattenLeftRecursive(node);
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          const expansion = matchedExpansion(options, rules, matches, node.args.length);
          const argRules = getRulesForArgs(expansion, rules);
          const nodeArgs = getNodeArgsForExpansion(node, expansion);
          let args = [];
          nodeArgs.forEach((n, i) => {
            const rhs = Parser.option(options, 'RHS', i > 0);
            args = args.concat(translate(options, n, [globalRules, argRules]));
            Parser.option(options, 'RHS', rhs);
          });
          expansion.isBinary = true;
          return expand(expansion, args, { ...options.env, op: node.op });
        },
        unary(node) {
          // -10 => (-10)
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          const expansion = matchedExpansion(options, rules, matches, node.args.length);
          const argRules = getRulesForArgs(expansion, rules);
          const nodeArgs = getNodeArgsForExpansion(node, expansion);
          let args = [];
          nodeArgs.forEach((n) => {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          return expand(expansion, args, { ...options.env, op: node.op });
        },
        exponential(node) {
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          const expansion = matchedExpansion(options, rules, matches, node.args.length);
          const argRules = getRulesForArgs(expansion, rules);
          const nodeArgs = getNodeArgsForExpansion(node, expansion);
          let args = [];
          nodeArgs.forEach((n) => {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          return expand(expansion, args, options.env);
        },
        variable(node) {
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          const expansion = matchedExpansion(options, rules, matches, node.args.length);
          const argRules = getRulesForArgs(expansion, rules);
          const nodeArgs = getNodeArgsForExpansion(node, expansion);
          let args = [];
          args.push(newNode(Parser.VAR, [lookup(options, nodeArgs.shift())]));
          nodeArgs.forEach((n) => {
            // Now translate the subscripts.
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          return expand(expansion, args, options.env);
        },
        comma(node) {
          const env = options.env || {};
          if (node.op === Parser.MATRIX || node.op === Parser.ROW || node.op === Parser.COL) {
            if (node.op === Parser.MATRIX) {
              assert(node.args[0].op === Parser.ROW);
              assert(node.args[0].args[0].op === Parser.COL);
              node.m = env.m = node.args[0].args.length;
              node.n = env.n = node.args[0].args[0].args.length;
              node.args.forEach((n, i) => {
                // matrix dimensions
                n.m = i + 1;
              });
            } else if (node.op === Parser.ROW) {
              node.args.forEach((n, i) => {
                n.m = i + 1;
                n.n = undefined;
              });
            } else {
              node.args.forEach((n, i) => {
                n.m = node.m;
                n.n = i + 1;
              });
            }
            const matches = match(options, patterns, node);
            if (matches.length === 0) {
              return node;
            }
            // Use first match for now.
            const expansion = matchedExpansion(options, rules, matches, node.args.length);
            let args = [];
            const argRules = getRulesForArgs(expansion, rules);
            const nodeArgs = getNodeArgsForExpansion(node, expansion);
            nodeArgs.forEach((n, i) => {
              args = args.concat(translate(options, n, [globalRules, argRules]));
              args[i].m = n.m;
              args[i].n = n.n;
            });
            return expand(expansion, args, env);
          }
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          const expansion = matchedExpansion(options, rules, matches, node.args.length);
          const argRules = getRulesForArgs(expansion, rules);
          const nodeArgs = getNodeArgsForExpansion(node, expansion);
          let args = [];
          nodeArgs.forEach((n) => {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          expansion.isBinary = true;
          return expand(expansion, args, env);
        },
        equals(node) {
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          const expansion = matchedExpansion(options, rules, matches, node.args.length);
          const argRules = getRulesForArgs(expansion, rules);
          const nodeArgs = getNodeArgsForExpansion(node, expansion);
          let args = [];
          nodeArgs.forEach((n) => {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          expansion.isBinary = true;
          return expand(expansion, args, options.env);
        },
        paren(node) {
          const matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          const expansion = matchedExpansion(options, rules, matches, 1);
          const argRules = getRulesForArgs(expansion, rules);
          const nodeArgs = getNodeArgsForExpansion(node, expansion);
          const args = [];
          nodeArgs.forEach((n) => {
            args.push(translate(options, n, [globalRules, argRules]));
          });
          return expand(expansion, args, options.env);
        },
      });
    }

    this.translate = translate;
  }

  // function dumpRules(rules) {
  //   let str = '';
  //   for (const [key, val] of rules) {
  //     str += `${JSON.stringify(key, null, 2)} --> ${JSON.stringify(val, null, 2)}\n`;
  //   }
  //   return str;
  // }

  function getRulesForArgs(expansion) {
    return expansion.rules;
  }

  function mergeMaps(options, m1, m2) {
    const map = {};
    if (m1) {
      if (m1 instanceof Array) {
        // We have context alternates, so pick the first match.
        let match = {};
        m1.some((m) => {
          if (m.context) {
            const contexts = m.context && m.context.split(' ') || [];
            // A rule can have more than one context.
            return contexts.some((context) => {
              if (options[context]) {
                match = m.value;
                return true;
              }
              return false;
            });
          }
            // No context, so its a catchall.
            match = m;
            return true;

        });
        m1 = match;
      }
      const keys = Object.keys(m1);
      keys.forEach((k) => {
        map[k] = m1[k];
      });
    }
    const keys = Object.keys(m2);
    let m;
    keys.forEach((k) => {
      if (!Number.isNaN(parseInt(k, 10))) {
        // Flatten context arrays.
        m = m2[k];
        k = Object.keys(m)[0];
      } else {
        m = m2;
      }
      if (!map[k]) {
        map[k] = m[k];
      }
    });
    return map;
  }

  function getExpansionFromTemplate(template) {
    let context;
    const start = template.indexOf('\\context');
    if (start >= 0) {
      template = template.slice(start + '\\context'.length);
      const stop = template.indexOf('}');
      context = template.slice(1, stop);
      template = template.slice(stop + 1);
    }
    return {
      context,
      template,
    };
  }

  function compileExpansion(options, expansion) {
    let compiledExpansion;
    if (expansion instanceof Array) {
      // [{..}, {..}]
      assert(expansion.length === 1);
      compiledExpansion = compileExpansion(options, expansion[0]);
    } else if (typeof expansion === 'string') {
      // "\context{RHS}%1"
      compiledExpansion = getExpansionFromTemplate(expansion);
    } else {
      // {"%1": {"?": "%1"}}
      // {"%1": [cntx1 {"?": "%1"}, cntx2 {?: "%1"}] --> [{context: "cntx1", expansion: "%1"},...]}
      let context = '';
      const templates = Object.keys(expansion);
      assert(templates.length === 1);
      const template = templates[0];
      const rules = expansion[template];
      let compiledRules;
      if (rules instanceof Array) {
        compiledRules = [];
        rules.forEach((rule) => {
          if (rule.options) {
            context += rule.options.RHS ? ' RHS' : '';
            context += rule.options.EndRoot ? ' EndRoot' : '';
            context += rule.options.NoParens ? ' NoParens' : '';
            compiledRules.push({
              context,
              value: compileRules(options, rule.value),
            });
          } else {
            compiledRules.push(compileRules(options, rule));
          }
        });
      } else {
        compiledRules = compileRules(options, rules);
      }
      compiledExpansion = {
        template,
        rules: compiledRules,
      };
    }
    return compiledExpansion;
  }
  function compileRules(options, rules) {
    // {"?": "%1"}
    // [cntx1 "%1", cntx2 {"%1": {?: "%1"}}] --> [{context: "cntx1", expansion: "%1"},...]}
    // { "ast as string": expansion, ... }
    const compiledRules = {};
    const keys = Object.keys(rules);
    keys.forEach((key) => {
      const pattern = JSON.stringify(Parser.create(options, key));  // Parse and normalize.
      const expansion = compileExpansion(options, rules[key]);
      if (!compiledRules[pattern]) {
        compiledRules[pattern] = [expansion];
      } else {
        compiledRules[pattern].push(expansion);
      }
    });
    return compiledRules;
  }
  function translate(options, node, rules) {
    const visitor = new Visitor(ast);
    const compiledRules = compileRules(options, rules);
    return visitor.translate(options, node, compiledRules);
  }
  function trim(str) {
    let i = 0;
    let out = '';
    for (; i < str.length; i++) {
      switch (str.charAt(i)) {
      case ' ':
      case '\t':
      case '\n':
        if (out.length === 0 || out.charAt(out.length - 1) === ' ') {
          // Erase space at beginning and after other space.
          continue;
        }
        out += ' ';
        break;
      default:
        out += str.charAt(i);
        break;
      }
    }
    while (out.charAt(out.length - 1) === ' ') {
      // Trim off trailing whitespace.
      out = out.substring(0, out.length - 1);
    }
    while (out.lastIndexOf('baseline') !== -1 && out.lastIndexOf(' baseline') === out.length - ' baseline'.length) {
      // Trim off trailing modifiers
      out = out.substring(0, out.length - ' baseline'.length);
    }
    return out;
  }
  Parser.fn.translate = function (n1, options) {
    const rules = Parser.option(options, 'rules');
    let n = translate(options, n1, rules);
    if (!n || n.op !== Parser.VAR) {
      n = newNode(Parser.VAR, ['']);
    }
    return trim(n.args[0]);
  };

  Parser.option = function option(options, p, v) {
    assert(options);
    let opt = options && options[p];
    if (v !== undefined) {
      // Set the option value.
      Parser.options = options = options || {};
      options[p] = v;
    }
    if (opt === undefined) {
      switch (p) {
      case 'field':
        opt = 'integer';
        break;
      case 'decimalPlaces':
        opt = 10;
        break;
      case 'toleranceAbsolute':
      case 'tolerancePercent':
      case 'toleranceRange':
      case 'setThousandsSeparator':
      case 'setDecimalSeparator':
      case 'dontExpandPowers':
      case 'dontFactorDenominators':
      case 'dontFactorTerms':
      case 'dontConvertDecimalToFraction':
      case 'strict':
      case 'antiderivative':
        opt = undefined;
        break;
      case 'types':
        opt = {};
        break;
      default:
        opt = false;
        break;
      }
    }
    // Return the original or default option.
    return opt;
  };

}(new Ast()));
export const Core = (function () {
  Assert.reserveCodeRange(4000, 4999, 'core');
  const messages = Assert.messages;
  const message = Assert.message;
  const assert = Assert.assert;
  messages[4001] = 'No Math Core spec provided.';
  messages[4002] = 'No Math Core solution provided.';
  messages[4003] = 'No Math Core spec value provided.';
  messages[4004] = "Invalid Math Core spec method '%1'.";
  messages[4005] = 'Operation taking too long.';
  messages[4006] = "Invalid option name '%1'.";
  messages[4007] = "Invalid option value '%2' for option '%1'.";
  messages[4008] = 'Internal error: %1';

  const mu = 10 ** -6; // micro, \\mu
  const env = {
    ROUND: {},
    SUM: {},
    MUL: {},
    IF: {},
    matrix: {},
    pmatrix: {},
    bmatrix: {},
    Bmatrix: {},
    vmatrix: {},
    Vmatrix: {},
    array: {},
    '\\alpha': { type: 'var' },
    '\\beta': { type: 'var' },
    '\\gamma': { type: 'var' },
    '\\delta': { type: 'var' },
    '\\epsilon': { type: 'var' },
    '\\zeta': { type: 'var' },
    '\\eta': { type: 'var' },
    '\\theta': { type: 'var' },
    '\\iota': { type: 'var' },
    '\\kappa': { type: 'var' },
    '\\lambda': { type: 'var' },
    '\\mu': { type: 'const', value: mu },
    '\\nu': { type: 'var' },
    '\\xi': { type: 'var' },
    '\\pi': { type: 'const', value: Math.PI },
    '\\rho': { type: 'var' },
    '\\sigma': { type: 'var' },
    '\\tau': { type: 'var' },
    '\\upsilon': { type: 'var' },
    '\\phi': { type: 'var' },
    '\\chi': { type: 'var' },
    '\\psi': { type: 'var' },
    '\\omega': { type: 'var' },
    '\\sin': { type: 'var' },
    '\\cos': { type: 'var' },
    '\\tan': { type: 'var' },
    '\\sec': { type: 'var' },
    '\\csc': { type: 'var' },
    '\\cot': { type: 'var' },
    '\\arcsin': { type: 'var' },
    '\\arccos': { type: 'var' },
    '\\arctan': { type: 'var' },
    '\\arcsec': { type: 'var' },
    '\\arccsc': { type: 'var' },
    '\\arccot': { type: 'var' },
    '\\sinh': { type: 'var' },
    '\\cosh': { type: 'var' },
    '\\tanh': { type: 'var' },
    '\\sech': { type: 'var' },
    '\\csch': { type: 'var' },
    '\\coth': { type: 'var' },
    '\\log': { type: 'var' },
    '\\ln': { type: 'var' },
    '\\lg': { type: 'var' },
  };

  function validateOption(p, v) {
    switch (p) {
    case 'field':
      switch (v) {
      case undefined: // undefined means use default
      case 'integer':
      case 'real':
      case 'complex':
        break;
      default:
        assert(false, message(4007, [p, v]));
        break;
      }
      break;
    case 'decimalPlaces':
      if (v === undefined || +v >= 0 && +v <= 20) {
        break;
      }
      assert(false, message(4007, [p, v]));
      break;
    case 'toleranceAbsolute':
      if (v === undefined || +v >= 0 ||
          typeof v === 'string') {
        break;
      }
      assert(false, message(4007, [p, v]));
      break;
    case 'tolerancePercent':
      if (v === undefined || +v >= 0) {
        break;
      }
      assert(false, message(4007, [p, v]));
      break;
    case 'toleranceRange':
      if (v === undefined ||
          v instanceof Array && v.length === 2) {
        break;
      }
      assert(false, message(4007, [p, v]));
      break;
    case 'antiderivative':
      if (typeof v === 'undefined' ||
          typeof v === 'string') {
        break;
      }
      assert(false, message(4007, [p, v]));
      break;
    case 'RHS':
    case 'NoParens':
    case 'EndRoot':
    case 'allowDecimal':
    case 'allowInterval':
    case 'dontExpandPowers':
    case 'dontFactorDenominators':
    case 'dontFactorTerms':
    case 'dontConvertDecimalToFraction':
    case 'dontSimplifyImaginary':
    case 'ignoreOrder':
    case 'inverseResult':
    case 'requireThousandsSeparator':
    case 'ignoreText':
    case 'ignoreTrailingZeros':
    case 'allowThousandsSeparator':
    case 'compareSides':
    case 'ignoreCoefficientOne':
    case 'strict':
    case 'integrationConstant':
    case 'absoluteValue':
    case 'parsingIntegralExpr':
    case 'keepTextWhitespace':
      if (typeof v === 'undefined' || typeof v === 'boolean') {
        break;
      }
      assert(false, message(4007, [p, v]));
      break;
    case 'setThousandsSeparator':
      if (typeof v === 'undefined' ||
          typeof v === 'string' && v.length === 1 ||
          v instanceof Array) {
        break;
      }
      assert(false, message(4007, [p, v]));
      break;
    case 'setDecimalSeparator':
      if (typeof v === 'undefined' ||
          typeof v === 'string' && v.length === 1 ||
          v instanceof Array && v.length > 0 && v[0].length === 1) {
        break;
      }
      assert(false, message(4007, [p, JSON.stringify(v)]));
      break;
    case 'words':
    case 'rules':
    case 'types':
    case 'data':
    case 'env':
      if (typeof v === 'undefined' ||
          typeof v === 'object') {
        break;
      }
      assert(false, message(4007, [p, v]));
      break;
    default:
      assert(false, message(4006, [p]));
      break;
    }
    // If we get this far, all is well.

  }
  function validateOptions(options) {
    if (options) {
      Object.keys(options).forEach((option) => {
        validateOption(option, options[option]);
      });
    }
  }
  function translate(options, solution, resume) {
    // console.log(
    //   "translate()",
    //   "options=" + JSON.stringify(options, null, 2),
    //   "solution=" + solution,
    // );
    if (!options) {
      options = {};
    }
    if (!options.rules) {
      // Use the default rules in rules.js.
      options.words = rules.words;
      options.rules = rules.rules;
      options.types = rules.types;
    }
    const spec = {
      method: 'translate',
      options,
    };

    options.allowInterval = true;
    const evaluator = makeEvaluator(spec, resume);
    evaluator.evaluate(solution, (err, val) => {
      resume(err, val);
    });
  }
  function makeEvaluator(spec, resume) {
    let valueNode;
    const method = spec.method;
    const value = spec.value;
    const options = Parser.options = spec.options;
    // Convert words keys to env format so parselatex treats them as identifiers
    const wordsAsEnv = options.words
      ? Object.fromEntries(Object.keys(options.words).map(k => [k, { type: 'var' }]))
      : {};
    let pendingError;
    try {
      Assert.setLocation('spec');
      validateOptions(options);
      Parser.pushEnv({
        ...env,
        ...wordsAsEnv,
        ...options.env,
      });
      valueNode = value !== undefined ? Parser.create(options, value, 'spec') : undefined;
      Parser.popEnv();
    } catch (e) {
      pendingError = e;
      resume([{
        result: null,
        errorCode: parseErrorCode(e.message),
        message: parseMessage(e.message),
        stack: e.stack,
        location: e.location,
        model: null,  // Unused, for now.
        toString() {
          return `${this.errorCode}: (${this.location}) ${this.message}\n${this.stack}`;
        },
      }], '');  // If error, empty string.
    }
    const evaluate = function evaluate(solution, resume) {
      try {
        if (pendingError) {
          throw pendingError;
        }
        Assert.setLocation('user');
        assert(solution !== undefined, message(4002));
        Parser.pushEnv({
          ...env,
          ...wordsAsEnv,
          ...options.env,
        });
        const solutionNode = Parser.create(options, solution, 'user');
        assert(solutionNode, message(4008, ['invalid input']));
        Assert.setLocation('spec');
        let result;
        switch (method) {
        case 'translate':
          result = solutionNode.translate(options);
          break;
        default:
          assert(false, message(4004, [method]));
          break;
        }
        Parser.popEnv();
        resume([], result);
      } catch (e) {
        console.log(`ERROR evaluate() ${e.stack}`);
        const message = e.message;
        resume([{
          result: null,
          errorCode: parseErrorCode(message),
          message: parseMessage(message),
          stack: e.stack,
          location: e.location,
          toString() {
            return `${this.errorCode}: (${this.location}) ${this.message}\n${this.stack}`;
          },
        }], '');  // If error, empty string.

      }
    };
    return {
      evaluate,
      model: valueNode,
    };
    function parseErrorCode(e) {
      e = typeof e === 'string' && e || '';
      const code = +e.slice(0, e.indexOf(':'));
      if (!Number.isNaN(code)) {
        return code;
      }
      return 0;
    }
    function parseMessage(e) {
      const code = parseErrorCode(e);
      if (code) {
        return e.slice(e.indexOf(':') + 2);
      }
      return e;
    }
  }

  // Exports
  return {
    translate,
  };
}());

if (typeof window !== 'undefined') {
  // Make a browser hook.
  window.Core = Core;
}
