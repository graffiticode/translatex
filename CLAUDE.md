# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TransLaTeX is a library for translating LaTeX expressions using translation rules written in L120. The library transforms LaTeX input into specified output formats based on configurable rule sets.

## Development Commands

### Building
```bash
make        # npm install + build (NOT lint or test — `all: init build` is the
            # default goal; `make default` is the one that lints and tests)
npm run build    # Compile using webpack and build tools
```

### Testing and Quality
```bash
npm test    # Run Jest tests with experimental VM modules
npm run lint     # Run ESLint with Airbnb config
```

### Core Development Tasks
- `src/rules.js` is GENERATED, but not by this repo's build. It is authored in **L0014**
  (`~/work/graffiticode/l0014`, a port of L120 — the language this rule set was originally written
  in) as `packages/core/spec/latex-to-latex.gc`, and written here by that repo's
  `tools/emit-translatex-rules.mjs`. Regenerate or verify with:

  ```bash
  cd ../l0014 && node packages/core/tools/emit-translatex-rules.mjs          # write
  cd ../l0014 && node packages/core/tools/emit-translatex-rules.mjs --check  # verify in step
  ```

  The generator lives there rather than here because L0014 depends on this package (it runs a rule
  set's test corpus through TransLaTeX), so the dependency cannot run both ways.

  Until recently `tools/build.js` fetched the rules from `graffiticode.com/data?id=0vgCM11vlfA`.
  That host is gone. `curl` ran without `-f`, so it exited 0 on the 404 and `JSON.parse` threw on
  the HTML error page — aborting the build before it compiled anything. `src/rules.js` survived
  precisely because the write never happened.
- Use `make use-local-packages` to develop with local parselatex dependency

## Architecture

### Core Components
- **src/core.js**: Main translation engine with visitor pattern for AST traversal
- **src/rules.js**: Auto-generated translation rules (do not edit manually)
- **src/assert.js**: Assertion utilities with error codes
- **index.js**: Main entry point exporting TransLaTeX class

### Translation Process
1. LaTeX input is parsed using @graffiticode/parselatex into an AST
2. The visitor pattern traverses the AST applying translation rules
3. Rules are matched against AST patterns using JSON string comparison
4. Expansions are applied with template substitution (%1, %2, etc.)
5. Special expander functions handle complex operations ($add, $multiply, etc.)

### Key Patterns
- Rules follow pattern `{"ast-pattern": ["expansion-template"]}` format
- Visitor methods handle different node types (numeric, binary, unary, etc.)
- Templates support placeholders, binary expansion, and custom expanders
- Environment context (env) carries state like matrix dimensions and formatting

### Number Formatting System
- Excel-like format strings for currency and number formatting
- Supports multiple thousands separators: comma (`,`), dot (`.`), space (` `)
- Multiple currency symbols: `$`, `€`, `¥`, `£`, `₹`, `₽`, `¢`
- Format patterns: `$#,##0.00`, `€# ##0,00`, `¥#,##0`
- Handles prefix/suffix currency placement with `_` notation

### Spreadsheet Functions

TransLaTeX provides spreadsheet-like formula evaluation through the `reducerBuilders` and `expanderBuilders` system in `src/core.js`.

#### Available Functions
- `sum` - Adds all numeric values
- `average` - Computes arithmetic mean
- `round` - Rounds to specified decimal places
- `if` - Conditional evaluation
- `minus` - Subtraction
- `multiply` - Multiplication
- `divide` - Division

#### Adding New Spreadsheet Functions

1. **Add the reducer to `reducerBuilders`** in `src/spreadsheetExpanders.js` (NOT `core.js`,
   which is where this used to say):
```javascript
myfunction: (env) => {
  // Use closure variables for state across iterations
  return (acc, str, index) => {
    str = getCellValue({ env, str });
    if (isValidDecimal(str)) {
      // Process the value
    }
    return result;
  };
},
```

2. **Add the function name to the `fn` type array** in the consuming application's rules file (e.g., `translatex-rules.js`):
```javascript
"fn": ["SUM", "AVERAGE", "MYFUNCTION"]
```

#### How It Works
- The `$fn` expander (line 529) dispatches to reducerBuilders using the lowercase function name: `reducerBuilders[args[0].toLowerCase()](env)`
- When a user enters `=AVERAGE(A1:B5)`:
  1. The range `A1:B5` is expanded to `A1,A2,...,B5` by the `$range` expander
  2. The `$fn` expander calls `reducerBuilders['average'](env)`
  3. The reducer iterates over each cell value via `Array.reduce()`
- Use `getCellValue({ env, str })` to resolve cell references
- Use `isValidDecimal(str)` to check if a value is numeric
- Use `Decimal.js` for precise arithmetic

### External Dependencies
- Depends on @graffiticode/parselatex for LaTeX parsing
- Uses Decimal.js for precise arithmetic operations
- Rules fetched from external Graffiticode system during build