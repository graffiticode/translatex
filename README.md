# TransLaTeX
A library for translating LaTeX

#### DESCRIPTION

This module implements a LaTeX translator using translation rules written in L120.

#### BUILD

```
$ make
```

This command will run ESLint linter and Jest tests.

#### INSTALLING

```
$ npm i './translatex'
```

where `./translatex` refers to the directory that contains this repo.

#### CALLING

```javascript
import {TransLaTeX} from '@artcompiler/translatex'
const str = TransLaTeX.translate(rules, '-1+2');
console.log(str);  // (negative (number one)) plus (number two)
```
where `rules` is a rules object created using **L120**. For example:
https://gc.acx.ac/item?id=3LgCjBbX9u0

A rules object is the DATA JSON obtained by clicking the **DATA** link in the navigation bar at the top of the Graffiticode browser window. Here is a sample:
https://gc.acx.ac/data?id=3LgCjBbX9u0

#### NUMBER FORMATTING

TransLaTeX supports Excel-like number formatting using the `$fmt` expander. This allows you to format numbers with different currency symbols, thousands separators, and decimal places.

##### Format String Syntax

The format string uses Excel-like patterns:
- `#` - Optional digit
- `0` - Required digit
- `,` - Thousands separator (position determines separator type)
- `.` - Decimal separator (position determines separator type)
- Currency symbols: `$`, `€`, `¥`, `£`, `₹`, `₽`, `¢`
- `_` prefix for suffix placement (e.g., `_$` puts $ at the end)

##### Examples

```javascript
// US Dollar format with comma thousands separator
const rules = {
  rules: { "?": ["$fmt{%1,$#,##0.00}"] }
};
TransLaTeX.translate(rules, "1234.56");  // "$1,234.56"

// European format with dot thousands, comma decimal
const rules = {
  rules: { "?": ["$fmt{%1,€#.##0,00}"] }
};
TransLaTeX.translate(rules, "1234.56");  // "€1.234,56"

// Japanese Yen (no decimals)
const rules = {
  rules: { "?": ["$fmt{%1,¥#,##0}"] }
};
TransLaTeX.translate(rules, "1234.56");  // "¥1,235"

// Currency suffix
const rules = {
  rules: { "?": ["$fmt{%1,#,##0.00_$}"] }
};
TransLaTeX.translate(rules, "1234.56");  // "1,234.56$"

// French format with space thousands separator
const rules = {
  rules: { "?": ["$fmt{%1,€# ##0,00}"] }
};
TransLaTeX.translate(rules, "1234567.89");  // "€1 234 567,89"

// International format with space separator
const rules = {
  rules: { "?": ["$fmt{%1,# ##0.00_$}"] }
};
TransLaTeX.translate(rules, "1234567.89");  // "1 234 567.89$"
```

##### Supported Currency Symbols

- `$` - US Dollar
- `€` - Euro
- `¥` - Japanese Yen
- `£` - British Pound
- `₹` - Indian Rupee
- `₽` - Russian Ruble
- `¢` - Cent

##### Thousands Separators

- **Comma (`,`)** - Used in US, UK: `1,234.56`
- **Dot (`.`)** - Used in Europe: `1.234,56`
- **Space (` `)** - Used in France, Germany, Russia, International: `1 234 567,89`

The separator behavior is determined by the pattern:
- `#,##0.00` = comma thousands, dot decimal (US/UK)
- `#.##0,00` = dot thousands, comma decimal (European)
- `# ##0,00` = space thousands, comma decimal (French/International)
- `# ##0.00` = space thousands, dot decimal (Canadian/Scientific)

##### Countries Using Space Separators

Space as thousands separator is used in:
- **France** - `€1 234 567,89`
- **Germany** - `1 234 567,50 €`
- **Russia** - `₽1 234 567,89`
- **Poland, Czech Republic, Slovakia** - `1 234 567,89`
- **Nordic countries** (Sweden, Norway, Finland) - `1 234 567,89`
- **Scientific/International documents** - Following ISO 31-0 standard

