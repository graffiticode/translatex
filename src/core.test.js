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
