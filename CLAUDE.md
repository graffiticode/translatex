# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TransLaTeX is a library for translating LaTeX expressions using translation rules written in L120. The library transforms LaTeX input into specified output formats based on configurable rule sets.

## Development Commands

### Building
```bash
make        # Full build: runs npm install, lint, and test
npm run build    # Compile using webpack and build tools
```

### Testing and Quality
```bash
npm test    # Run Jest tests with experimental VM modules
npm run lint     # Run ESLint with Airbnb config
```

### Core Development Tasks
- The build system fetches translation rules from a remote Graffiticode instance (ID: 0vgCM11vlfA)
- Rules are stored in `src/rules.js` and auto-generated during build
- Use `make use-local-packages` to develop with local parselatex dependency

## Architecture

### Core Components
- **src/core.js**: Main translation engine with visitor pattern for AST traversal
- **src/rules.js**: Auto-generated translation rules (do not edit manually)
- **src/assert.js**: Assertion utilities with error codes
- **index.js**: Main entry point exporting TransLaTeX class

### Translation Process
1. LaTeX input is parsed using @artcompiler/parselatex into an AST
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

1. **Add the reducer to `reducerBuilders`** in `src/core.js` (around line 370):
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
- Depends on @artcompiler/parselatex for LaTeX parsing
- Uses Decimal.js for precise arithmetic operations
- Rules fetched from external Graffiticode system during build