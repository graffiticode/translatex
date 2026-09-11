module.exports = {
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": [
    "airbnb",
  ],
  "ignorePatterns": [
    // Generated: written by L0014's emit-translatex-rules.mjs.
    "src/rules.js",
    // Vendored verbatim from L0179 as a test fixture; keeping it byte-identical
    // to its source matters more than matching this repo's style.
    "src/spreadsheet.rules.fixture.js",
  ],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
  ],
  "globals": {
    "test": "readonly",
    "describe": "readonly",
    "expect": "readonly",
    "window": "writable",
  },
  "rules": {
    "padded-blocks": 0,
    "arrow-body-style": 0,
    "func-names": 0,
    "no-multi-assign": 0,
    "prefer-destructuring": 0,
    "no-console": 0,
    "import/extensions": 0,
    "import/prefer-default-export": 0,
    "no-shadow": 0,
    "no-loop-func": 0,
    "no-continue": 0,
    "max-len": 0,
    "no-use-before-define": 0,
    "no-cond-assign": 0,
    "no-param-reassign": 0,
    "operator-linebreak": 0,
    "no-plusplus": 0,
    "indent": 0,
    "no-multi-spaces": 0,
    // for...of is ordinary modern JS; airbnb's objection is about a
    // regenerator-runtime cost that does not apply here.
    "no-restricted-syntax": 0,
    "no-mixed-operators": 0,
    "prefer-arrow-callback": 2,
    "semi": 2,
    "no-var": 2,
    "prefer-const": 2,
    "space-infix-ops": 2,
    "no-unused-vars": 2,
  },
};
