// SPDX-License-Identifier: MIT
/**
 * A spreadsheet rule set, vendored AS A TEST FIXTURE.
 *
 * This package has no spreadsheet rule set of its own — every consumer keeps
 * one, and they have drifted. This is a verbatim copy of L0179's, taken so the
 * characterization corpus in spreadsheet.fixtures.js has something to run
 * against. It is NOT the published vocabulary and nothing outside the tests
 * should import it.
 *
 * It is temporary. The plan is for translatex to GENERATE the rule set from a
 * function registry (createSpreadsheet), at which point this file is deleted
 * and the corpus runs against the real thing.
 *
 * One mismatch is deliberate and load-bearing for the baseline: `types.fn` here
 * lists `power`, because L0179 added it — but this package's stock
 * `spreadsheetExpanders` has no `power` reducer, since the only way to add one
 * today is to replace the `$fn` expander wholesale, which is exactly what L0179
 * does. So every POWER case in the corpus fails here, and is marked
 * `unsupported` rather than `defect`. That gap IS the argument for the
 * extension API.
 */
export const evalRules = {
  "words": {
    "average": "average",
    "if": "if",
    "mul": "mul",
    "power": "power",
    "round": "round",
    "sum": "sum",
  },
  "types": {
    "args": [
      "\\type{cellName}:\\type{cellName}",
      "?,?"
    ],
    "cellName": [
      "\\type{variable}\\type{integer}"
    ],
    "cellRange": [
      "\\type{cellName}:\\type{cellName}"
    ],
    "fn": [
      "average",
      "if",
      "mul",
      "power",
      "round",
      "sum",
    ]
  },
  "rules": {
    "=\\type{cellName}": [
      "$cell"
    ],
    "=?": [
      {
        "%2": {
          "\\type{fn}(\\type{args})": "$fn",
          "\\type{fn}(?,?)": "$fn",
          "\\type{fn}(?)": "$fn",
          "?+?": "$add",
          "?-?": "$minus",
          "?*?": "$multiply",
          "?/?": "$divide",
          "?%": "$percent",
          "-?": "$minus"
        }
      }
    ],
    "-?": [
      "-%1"
    ],
    "\\type{cellRange}": [
      "$range"
    ],
    "\\type{args}": [
      "%1,%2"
    ],
    "\\type{cellName}": [
      "%1%2"
    ],
    "\\type{fn}(\\type{cellRange})": [
      "%1(%2)"
    ],
    "??": [
      "%1%2"
    ],
    "{{var:\\type{cellName}}}": [
      "{{var:%2}}"
    ],
    "?": [
      "%1"
    ]
  }
};

export const cellNameRules = {
  "types": {
    "cellName": [
      "\\type{variable}\\type{integer}"
    ],
    "cellRange": [
      "\\type{cellName}:\\type{cellName}"
    ],
    "fn": [
      "average",
      "if",
      "mul",
      "power",
      "round",
      "sum",
    ]
  },
  "rules": {
    "\\type{cellName}": [
      "%1%2"
    ],
    "=?": [
      {
        "%2": {
          "\\type{fn}(\\type{cellRange})": "%2",
          "?+?": "%1,%2",
          "?-?": "%1,%2",
          "?*?": "%1,%2",
          "?/?": "%1,%2",
          "\\type{cellName}": "%1%2"
        }
      }
    ],
    "\\type{cellRange}": [
      "$range"
    ],
    "??": [
      "%1%2"
    ],
    "?": [
      "%1"
    ]
  },
}

export const formatRules = {
  "rules": {
    "??": [
      "%1%2"
    ],
    "-\\type{number}": [
      {
        "%1": {
          "\\type{number}": "$fmt{isNegative:true}",
        },
      },
    ],
    "\\type{number}": [
      "$fmt{isNegative:false}"
    ],
    "?": [
      "%1"
    ]
  },
}

export const normalizeRules = {
  "types": {
    "cellName": [
      "\\type{variable}\\type{integer}"
    ],
    "cellRange": [
      "\\type{cellName}:\\type{cellName}"
    ],
    "fn": [
      "average",
      "if",
      "mul",
      "power",
      "round",
      "sum",
    ]
  },
  "rules": {
    "=\\type{cellName}": [
      "$cell"
    ],
    "=?": [
      {
        "%2": {
          "\\type{cellRange}": "%1:%2",
          "\\type{fn}(\\type{cellRange})": "$normalize",
          "?+?": "$normalize {\"acc\": [\"SUM\"]}",
          "?-?": "$normalize {\"acc\": [\"SUB\"]}",
          "?*?": "$normalize {\"acc\": [\"MUL\"]}",
          "?/?": "$normalize {\"acc\": [\"DIV\"]}",
          "?%": "$percent",
          "-?": "$minus"
        }
      }
    ],
    "\\type{cellRange}": [
      "$range"
    ],
    "\\type{cellName}": [
      "%1%2"
    ],
    "\\type{fn}(\\type{cellRange})": [
      "%1(%2)"
    ],
    "??": [
      "%1%2"
    ],
    "?": [
      "%1"
    ]
  },
}
