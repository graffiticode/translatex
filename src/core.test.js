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
