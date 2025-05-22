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
