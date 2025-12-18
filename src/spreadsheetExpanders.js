/*
 * Spreadsheet expanders for TransLaTeX
 * Provides cell references, ranges, formatting, and spreadsheet functions
 */
import Decimal from 'decimal.js';

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
  mul: (env) => (acc = 1, str) => {
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

export default expanderBuilders;
