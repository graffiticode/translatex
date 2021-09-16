import { Core as TransLaTeX } from './core.js';

test('1 + 2', () => {
  const rules = {"options":{"data":{},"words":{"1":"one","2":"two"},"types":{"numeric":["\\type{number}","-\\type{number}"]},"rules":{"-?":["(negative %1)"],"\\type{numeric}+\\type{numeric}":["%1 plus %2"],"\\type{numeric}":["(number %1)"],"?":["{no match}"]},"allowInterval":true},"tests":[{"score":1,"source":"-1+2","actual":"(negative (number one)) plus (number two)","expected":"(negative (number one)) plus (number two)"}],"_":{"builds":[{"name":"api","commit":"f8caa23"}]}};
  const recieved = TransLaTeX.translate(rules, '1 + 2');
  const expected = '(negative (number one)) plus (number two)';
  expect(recieved).toBe(expected);
});
