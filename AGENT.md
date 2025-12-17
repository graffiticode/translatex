# AGENT.md - TransLaTeX Development Guide

## Commands
- **Build**: `make` or `npm run build` (fetches rules from Graffiticode, runs webpack)
- **Test**: `npm test` (Jest with experimental VM modules)
- **Lint**: `npm run lint` (ESLint with Airbnb config)
- **Single test**: `npm test -- --testNamePattern="test name"`
- **Local dev**: `make use-local-packages` (use local parselatex dependency)

## Architecture
- **Entry**: `index.js` exports TransLaTeX class
- **Core**: `src/core.js` - main translation engine with visitor pattern for AST traversal
- **Rules**: `src/rules.js` - auto-generated translation rules (DO NOT EDIT MANUALLY)
- **Parsing**: Uses @artcompiler/parselatex for LaTeX → AST conversion
- **Numbers**: Decimal.js for precise arithmetic, Excel-like formatting with `$fmt` expander

## Code Style (ESLint Airbnb)
- ES modules (`import`/`export`), Node.js 21+
- Arrow functions preferred, semicolons required
- No var, prefer const, space around operators
- Ignore rules.js from linting (auto-generated)
- Pattern matching uses JSON string comparison with template substitution (%1, %2)
- Environment context (env) carries state like matrix dimensions and cell formatting

## Key Patterns
- Rules: `{"ast-pattern": ["expansion-template"]}` format with placeholders and expanders
- Currency formatting: `$fmt{value,format}` supports `$€¥£₹₽¢` with separators `,` `.` ` `
