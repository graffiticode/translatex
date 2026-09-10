import { Core as TransLaTeX } from './core.js';
import spreadsheetExpanders from './spreadsheetExpanders.js';

test('translate -1 + 2', () => {
  const rules = {
 words: { 1: 'one', 2: 'two' },
types: { numeric: ['\\type{number}', '-\\type{number}'] },
rules: {
 '-?': ['(negative %1)'], '\\type{numeric}+\\type{numeric}': ['%1 plus %2'], '\\type{numeric}': ['(number %1)'], '?': ['{no match}'],
},
};
  TransLaTeX.translate(rules, '-1 + 2', (err, val) => {
    const expected = '(negative (number one)) plus (number two)';
    expect(val).toBe(expected);
  });
});

test('currency formatting - US format', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,$#,##0.00}'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,234.56');
  });
});

test('currency formatting - European format', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,€#.##0,00}'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('€1.234,56');
  });
});

test('currency formatting - suffix format', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,#,##0.00_$}'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('1,234.56$');
  });
});

test('currency formatting - no decimals', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,¥#,##0}'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('¥1,235');
  });
});

test('currency formatting - backward compatibility', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,currency}'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,234.56');
  });
});

test('currency formatting - French format with space separator', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,€# ##0,00}'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234567.89', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('€1 234 567,89');
  });
});

test('currency formatting - International format with space separator', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,# ##0.00_$}'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234567.89', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('1 234 567.89$');
  });
});

test('currency formatting - Russian Ruble with space separator', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,₽# ##0,00}'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234567.89', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('₽1 234 567,89');
  });
});

test('currency formatting - using env.format', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '\\type{number}': ['$fmt'],
      '?': ['%1'],
    },
    env: { format: 'Currency' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1000', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,000.00');
  });
});

test('currency formatting - using env.format.formatString', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '\\type{number}': ['$fmt'],
      '?': ['%1'],
    },
    env: { format: { formatString: '€# ##0,00' } },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('€1 234,56');
  });
});

test('graffiticode test harness format', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
    env: { format: 'Currency' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1000', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,000.00');
  });
});

test('actual formatCellValue calling pattern', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
    env: { format: 'Currency' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1500.75', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,500.75');
  });
});

test('formatCellValue with custom format string', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
    env: { format: '€# ##0,00' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('2345.67', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('€2 345,67');
  });
});

test('US dollar with space separator no decimals - $# ##0', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
    env: { format: '$# ##0' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('12345.67', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$12 346');
  });
});

test('accounting style formatting - positive number', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
    env: { format: '($#,##0.00)' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,234.56');
  });
});

test('accounting style formatting - negative number', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '-?': [
        {
          '%1': {
            '\\type{number}': '$fmt{isNegative:true}',
          },
        },
      ],
      '\\type{number}': '$fmt{isNegative:false}',
      '?': ['%1'],
    },
    env: { format: '($#,##0.00)' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('-1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('($1,234.56)');
  });
});

test('accounting style formatting - zero', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '-?': [
        {
          '%1': {
            '\\type{number}': '$fmt{isNegative:true}',
          },
        },
      ],
      '\\type{number}': '$fmt{isNegative:false}',
      '?': ['%1'],
    },
    env: { format: '($#,##0.00)' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('0', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$0.00');
  });
});

test('accounting style formatting - European format', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '-?': [
        {
          '%1': {
            '\\type{number}': '$fmt{isNegative:true}',
          },
        },
      ],
      '\\type{number}': '$fmt{isNegative:false}',
      '?': ['%1'],
    },
    env: { format: '(€#.##0,00)' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('-2345.67', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('(€2.345,67)');
  });
});

test('accounting style formatting - suffix currency', () => {
  const options = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '-?': [
        {
          '%1': {
            '\\type{number}': '$fmt{isNegative:true}',
          },
        },
      ],
      '\\type{number}': '$fmt{isNegative:false}',
      '?': ['%1'],
    },
    env: { format: '(#,##0.00_$)' },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('-987.65', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('(987.65$)');
  });
});

// Date formatting tests
test('date formatting - m/d/yyyy format', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,m/d/yyyy}'],
    },
  };

  const translate = TransLaTeX.buildTranslator(rules, spreadsheetExpanders);

  // Test with Mac Excel serial date (March 14, 2024)
  translate('43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('3/14/2024');
  });

  // Test with a different date (January 1, 2024)
  translate('43831', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('1/1/2024');
  });
});

test('date formatting - mm/dd/yyyy format', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,mm/dd/yyyy}'],
    },
  };

  const translate = TransLaTeX.buildTranslator(rules, spreadsheetExpanders);

  // March 14, 2024
  translate('43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('03/14/2024');
  });

  // January 5, 2024
  translate('43835', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('01/05/2024');
  });
});

test('date formatting - d-mmm-yy format', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,d-mmm-yy}'],
    },
  };

  const translate = TransLaTeX.buildTranslator(rules, spreadsheetExpanders);

  // March 14, 2024
  translate('43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('14-Mar-24');
  });

  // December 25, 2024
  translate('44190', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('25-Dec-24');
  });
});

test('date formatting - dd-mmm-yyyy format', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,dd-mmm-yyyy}'],
    },
  };

  const translate = TransLaTeX.buildTranslator(rules, spreadsheetExpanders);

  // March 14, 2024
  translate('43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('14-Mar-2024');
  });

  // January 1, 2024
  translate('43831', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('01-Jan-2024');
  });
});

test('date formatting - using env.format', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1}'],
    },
    env: { format: 'm/d/yyyy' },
  };

  const translate = TransLaTeX.buildTranslator(rules, spreadsheetExpanders);

  // March 14, 2024
  translate('43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('3/14/2024');
  });
});

test('date formatting - invalid date handling', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,m/d/yyyy}'],
    },
  };

  const translate = TransLaTeX.buildTranslator(rules, spreadsheetExpanders);

  // Test with very large number (not a valid Excel date)
  translate('3000000000', (err, val) => {
    expect(err).toStrictEqual([]);
    // Should be parsed as Unix timestamp (milliseconds since 1970)
    // This will vary by timezone, so just check it's a valid date format
    expect(val).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  });

  // Test with zero (Mac Excel: Jan 1, 1904)
  translate('0', (err, val) => {
    expect(err).toStrictEqual([]);
    // Due to timezone handling, this might be Dec 31, 1903 or Jan 1, 1904
    expect(val).toMatch(/^(12\/31\/1903|1\/1\/1904)$/);
  });
});

test('date formatting - Mac Excel serial dates', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,mm/dd/yyyy}'],
    },
  };

  const translate = TransLaTeX.buildTranslator(rules, spreadsheetExpanders);

  // January 2, 1904 (Mac Excel serial 1)
  translate('1', (err, val) => {
    expect(err).toStrictEqual([]);
    // Due to timezone handling, this might be Jan 1 or Jan 2, 1904
    expect(val).toMatch(/^01\/(01|02)\/1904$/);
  });

  // February 29, 1904 (Mac Excel serial 59 - 1904 was a leap year)
  translate('59', (err, val) => {
    expect(err).toStrictEqual([]);
    // Due to timezone handling, this might be Feb 28 or Feb 29, 1904
    expect(val).toMatch(/^02\/(28|29)\/1904$/);
  });

  // March 1, 1904 (Mac Excel serial 60)
  translate('60', (err, val) => {
    expect(err).toStrictEqual([]);
    // Due to timezone handling, this might be Feb 29 or Mar 1, 1904
    expect(val).toMatch(/^(02\/29|03\/01)\/1904$/);
  });
});

test('date formatting - case insensitive format patterns', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,MM/DD/YYYY}'],
    },
  };

  const translate = TransLaTeX.buildTranslator(rules, spreadsheetExpanders);

  // March 14, 2024
  translate('43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('03/14/2024');
  });
});

test('variable type matching', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '\\type{variable}': ['var %1'],
      '??': ['%1%2'],
      '?': ['%1'],
    },
  };

  TransLaTeX.translate(rules, 'x', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('var x');
  });
});

test('cell name type matching', () => {
  const rules = {
    words: {},
    types: {
      cellName: ['\\type{variable}\\type{integer}'],
    },
    rules: {
      '\\type{cellName}': ['cell %1%2'],
      '??': ['mul %1%2'],
      '?': ['%1'],
    },
  };

  TransLaTeX.translate(rules, 'A1', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('cell A1');
  });
});

test('cell value evaluation with $cell', () => {
  const options = {
    words: {},
    types: {
      cellName: ['\\type{variable}\\type{integer}'],
    },
    rules: {
      '=\\type{cellName}': ['$cell'],
      '\\type{cellName}': ['%1%2'],
      '??': ['%1%2'],
      '?': ['%1'],
    },
    env: {
      A1: { val: '42' },
    },
  };

  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('=A1', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('42');
  });
});

test('cell range expansion with $range', () => {
  const options = {
    words: {},
    types: {
      cellName: ['\\type{variable}\\type{integer}'],
      cellRange: ['\\type{cellName}:\\type{cellName}'],
    },
    rules: {
      '\\type{cellRange}': ['$range'],
      '\\type{cellName}': ['%1%2'],
      '?': ['%1'],
    },
  };

  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  translate('A1:A3', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('A1,A2,A3');
  });
});

test('functions with cell range', () => {
  const options = {
    words: {
      "sum": "sum",
      "average": "average",
      "mul": "mul",
    },
    types: {
      cellName: ['\\type{variable}\\type{integer}'],
      cellRange: ['\\type{cellName}:\\type{cellName}'],
      fn: ['sum', "average", "mul"],
    },
    rules: {
      '=?': [{
        '%2': {
          '\\type{fn}(\\type{cellRange})': '$fn',
          "\\type{fn}(?,?)": "[2] $fn",
          "\\type{fn}(?)": "[3] $fn",
        },
      }],
      '\\type{cellRange}': ['$range'],
      '\\type{cellName}': ['%1%2'],
      '??': ['%1%2'],
      '?': ['%1'],
    },
    env: {
      A1: { val: '10' },
      A2: { val: '20' },
      A3: { val: '30' },
    },
  };

  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);

  translate('=sum(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('60');
  });

  translate('=average(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('20');
  });

  translate('=mul(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('6000');  // 10 * 20 * 30 = 6000
  });
});

test('function names are case-insensitive', () => {
  // Words config uses lowercase, but both lowercase and uppercase input work.
  // The wordsAsEnv adds both forms to the parser environment.

  const options = {
    words: {
      "sum": "sum",
      "average": "average",
    },
    types: {
      cellName: ['\\type{variable}\\type{integer}'],
      cellRange: ['\\type{cellName}:\\type{cellName}'],
      fn: ['sum', 'average'],  // lowercase only - matching is case-insensitive
    },
    rules: {
      '=?': [{
        '%2': {
          '\\type{fn}(\\type{cellRange})': '$fn',
        },
      }],
      '\\type{cellRange}': ['$range'],
      '\\type{cellName}': ['%1%2'],
      '??': ['%1%2'],
      '?': ['%1'],
    },
    env: {
      A1: { val: '10' },
      A2: { val: '20' },
      A3: { val: '30' },
    },
  };

  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);

  // Lowercase input works
  translate('=sum(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('60');
  });

  // Uppercase input works
  translate('=SUM(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('60');
  });

  translate('=average(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('20');
  });

  translate('=AVERAGE(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('20');
  });
});


// Percent formats. "0.0%" used to parse as zero decimal places with no scaling, so 0.75 rendered
// as "1" and 0.10 as "0" — an integer with no percent sign. Excel scales by 100 and keeps the
// decimals the format asks for.
const fmt = (format, value) => {
  const options = { words: {}, types: {}, rules: { '?': [`$fmt{%1,${format}}`] } };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  let out;
  translate(value, (err, val) => { out = val; });
  return out;
};

test.each([
  ['0.0%', '0.75', '75.0%'],
  ['0.0%', '0.10', '10.0%'],
  ['0.0%', '0.025', '2.5%'],
  ['0.0%', '0.04', '4.0%'],
  ['0.0%', '1', '100.0%'],
  ['0.0%', '0', '0.0%'],
  ['0%', '0.1', '10%'],
  ['0.00%', '0.025', '2.50%'],
  ['#,##0.0%', '12.345', '1,234.5%'],
])('percent format %s applied to %s', (format, value, expected) => {
  expect(fmt(format, value)).toBe(expected);
});

// The shape a spreadsheet actually uses: the format comes from `env`, and a leading minus is
// routed through `$fmt{isNegative:true}` rather than being part of the value.
const fmtEnv = (format, value) => {
  const options = {
    words: {},
    types: {},
    env: { format },
    rules: {
      '-\\type{number}': [{ '%1': { '\\type{number}': '$fmt{isNegative:true}' } }],
      '\\type{number}': ['$fmt{isNegative:false}'],
      '?': ['%1'],
    },
  };
  const translate = TransLaTeX.buildTranslator(options, spreadsheetExpanders);
  let out;
  translate(value, (err, val) => { out = val; });
  return out;
};

test('percent works through the env-supplied format, as a sheet supplies it', () => {
  expect(fmtEnv('0.0%', '0.75')).toBe('75.0%');
  expect(fmtEnv('$#,##0', '100000')).toBe('$100,000');
});

test('a negative percent keeps its sign', () => {
  expect(fmtEnv('0.0%', '-0.25')).toBe('-25.0%');
});

test('percent scaling is exact, not floating point', () => {
  // 0.07 * 100 is 7.000000000000001 in float; Decimal keeps it 7.
  expect(fmt('0.00%', '0.07')).toBe('7.00%');
});

test('formats without a percent sign are unchanged', () => {
  expect(fmt('$#,##0', '100000')).toBe('$100,000');
  expect(fmt('#,##0.00', '1234.5')).toBe('1,234.50');
  expect(fmt('0.0', '0.75')).toBe('0.8');
});
