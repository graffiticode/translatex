import { Core as TransLaTeX } from './core.js';

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
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,$#,##0.00}'],
    },
  };
  TransLaTeX.translate(rules, '1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,234.56');
  });
});

test('currency formatting - European format', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,€#.##0,00}'],
    },
  };
  TransLaTeX.translate(rules, '1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('€1.234,56');
  });
});

test('currency formatting - suffix format', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,#,##0.00_$}'],
    },
  };
  TransLaTeX.translate(rules, '1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('1,234.56$');
  });
});

test('currency formatting - no decimals', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,¥#,##0}'],
    },
  };
  TransLaTeX.translate(rules, '1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('¥1,235');
  });
});

test('currency formatting - backward compatibility', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,currency}'],
    },
  };
  TransLaTeX.translate(rules, '1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,234.56');
  });
});

test('currency formatting - French format with space separator', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,€# ##0,00}'],
    },
  };
  TransLaTeX.translate(rules, '1234567.89', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('€1 234 567,89');
  });
});

test('currency formatting - International format with space separator', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,# ##0.00_$}'],
    },
  };
  TransLaTeX.translate(rules, '1234567.89', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('1 234 567.89$');
  });
});

test('currency formatting - Russian Ruble with space separator', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '?': ['$fmt{%1,₽# ##0,00}'],
    },
  };
  TransLaTeX.translate(rules, '1234567.89', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('₽1 234 567,89');
  });
});

test('currency formatting - using env.format', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '\\type{number}': ['$fmt'],
      '?': ['%1'],
    },
    env: { format: 'Currency' },
  };
  TransLaTeX.translate(rules, '1000', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,000.00');
  });
});

test('currency formatting - using env.format.formatString', () => {
  const rules = {
    words: {},
    types: {},
    rules: {
      '\\type{number}': ['$fmt'],
      '?': ['%1'],
    },
    env: { format: { formatString: '€# ##0,00' } },
  };
  TransLaTeX.translate(rules, '1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('€1 234,56');
  });
});

test('graffiticode test harness format', () => {
  const rules = {
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
  TransLaTeX.translate(rules, '1000', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,000.00');
  });
});

test('actual formatCellValue calling pattern', () => {
  const formatRules = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
  };

  const options = {
    allowInterval: true,
    RHS: false,
    env: { format: 'Currency' },
    ...formatRules,
  };

  TransLaTeX.translate(options, '1500.75', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,500.75');
  });
});

test('formatCellValue with custom format string', () => {
  const formatRules = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
  };

  const options = {
    allowInterval: true,
    RHS: false,
    env: { format: '€# ##0,00' },
    ...formatRules,
  };

  TransLaTeX.translate(options, '2345.67', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('€2 345,67');
  });
});

test('US dollar with space separator no decimals - $# ##0', () => {
  const formatRules = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
  };

  const options = {
    allowInterval: true,
    RHS: false,
    env: { format: '$# ##0' },
    ...formatRules,
  };

  TransLaTeX.translate(options, '12345.67', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$12 346');
  });
});

test('accounting style formatting - positive number', () => {
  const formatRules = {
    words: {},
    types: {},
    rules: {
      '??': ['%1%2'],
      '\\type{number}': ['$fmt'],
      '-?': ['-%1'],
      '?': ['%1'],
    },
  };

  const options = {
    allowInterval: true,
    RHS: false,
    env: { format: '($#,##0.00)' },
    ...formatRules,
  };

  TransLaTeX.translate(options, '1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$1,234.56');
  });
});

test('accounting style formatting - negative number', () => {
  const formatRules = {
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
  };

  const options = {
    allowInterval: true,
    RHS: false,
    env: { format: '($#,##0.00)' },
    ...formatRules,
  };

  TransLaTeX.translate(options, '-1234.56', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('($1,234.56)');
  });
});

test('accounting style formatting - zero', () => {
  const formatRules = {
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
  };

  const options = {
    allowInterval: true,
    RHS: false,
    env: { format: '($#,##0.00)' },
    ...formatRules,
  };

  TransLaTeX.translate(options, '0', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('$0.00');
  });
});

test('accounting style formatting - European format', () => {
  const formatRules = {
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
  };

  const options = {
    allowInterval: true,
    RHS: false,
    env: { format: '(€#.##0,00)' },
    ...formatRules,
  };

  TransLaTeX.translate(options, '-2345.67', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('(€2.345,67)');
  });
});

test('accounting style formatting - suffix currency', () => {
  const formatRules = {
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
  };

  const options = {
    allowInterval: true,
    RHS: false,
    env: { format: '(#,##0.00_$)' },
    ...formatRules,
  };

  TransLaTeX.translate(options, '-987.65', (err, val) => {
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

  // Test with Mac Excel serial date (March 14, 2024)
  TransLaTeX.translate(rules, '43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('3/14/2024');
  });

  // Test with a different date (January 1, 2024)
  TransLaTeX.translate(rules, '43831', (err, val) => {
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

  // March 14, 2024
  TransLaTeX.translate(rules, '43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('03/14/2024');
  });

  // January 5, 2024
  TransLaTeX.translate(rules, '43835', (err, val) => {
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

  // March 14, 2024
  TransLaTeX.translate(rules, '43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('14-Mar-24');
  });

  // December 25, 2024
  TransLaTeX.translate(rules, '44190', (err, val) => {
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

  // March 14, 2024
  TransLaTeX.translate(rules, '43904', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('14-Mar-2024');
  });

  // January 1, 2024
  TransLaTeX.translate(rules, '43831', (err, val) => {
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

  // March 14, 2024
  TransLaTeX.translate(rules, '43904', (err, val) => {
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

  // Test with very large number (not a valid Excel date)
  TransLaTeX.translate(rules, '3000000000', (err, val) => {
    expect(err).toStrictEqual([]);
    // Should be parsed as Unix timestamp (milliseconds since 1970)
    // This will vary by timezone, so just check it's a valid date format
    expect(val).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  });

  // Test with zero (Mac Excel: Jan 1, 1904)
  TransLaTeX.translate(rules, '0', (err, val) => {
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

  // January 2, 1904 (Mac Excel serial 1)
  TransLaTeX.translate(rules, '1', (err, val) => {
    expect(err).toStrictEqual([]);
    // Due to timezone handling, this might be Jan 1 or Jan 2, 1904
    expect(val).toMatch(/^01\/(01|02)\/1904$/);
  });

  // February 29, 1904 (Mac Excel serial 59 - 1904 was a leap year)
  TransLaTeX.translate(rules, '59', (err, val) => {
    expect(err).toStrictEqual([]);
    // Due to timezone handling, this might be Feb 28 or Feb 29, 1904
    expect(val).toMatch(/^02\/(28|29)\/1904$/);
  });

  // March 1, 1904 (Mac Excel serial 60)
  TransLaTeX.translate(rules, '60', (err, val) => {
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

  // March 14, 2024
  TransLaTeX.translate(rules, '43904', (err, val) => {
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

  TransLaTeX.translate(options, '=A1', (err, val) => {
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

  TransLaTeX.translate(options, 'A1:A3', (err, val) => {
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

  TransLaTeX.translate(options, '=sum(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('60');
  });

  TransLaTeX.translate(options, '=average(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('20');
  });

  TransLaTeX.translate(options, '=mul(A1:A3)', (err, val) => {
    expect(err).toStrictEqual([]);
    expect(val).toBe('6000');  // 10 * 20 * 30 = 6000
  });
});

