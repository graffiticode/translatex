/*global window, document, */
import _ from 'vendor/underscore';

/**
 * DO NOT EDIT HERE!
 * Those symbols come from Questions API mathSymbols file
 */
var curatedSymbols = [
    {
        id: '',
        label: 'empty',
        title: '',
        numberpad_and_keypad: true
    }, //empty whitespace symbol

    {
        id: 'x',
        label: 'x',
        type: 'write',
        val: 'x',
        shortcut: ['x'],
        title: 'x',
        label_latex: true
    },
    {
        id: 'y',
        label: 'y',
        type: 'write',
        val: 'y',
        shortcut: ['y'],
        title: 'y',
        label_latex: true
    },
    {
        id: 'z',
        label: 'z',
        type: 'write',
        val: 'z',
        shortcut: ['z'],
        title: 'z',
        label_latex: true
    },
    {
        id: 'a',
        label: 'a',
        type: 'write',
        val: 'a',
        shortcut: ['a'],
        title: 'a',
        label_latex: true
    },
    {
        id: 'b',
        label: 'b',
        type: 'write',
        val: 'b',
        shortcut: ['b'],
        title: 'b',
        label_latex: true
    },
    {
        id: 'c',
        label: 'c',
        type: 'write',
        val: 'c',
        shortcut: ['c'],
        title: 'c',
        label_latex: true
    },
    {
        id: 'd',
        label: 'd',
        type: 'write',
        val: 'd',
        shortcut: ['d'],
        title: 'd',
        label_latex: true
    },
    {
        id: 'f',
        label: 'f',
        type: 'write',
        val: 'f',
        shortcut: ['f'],
        title: 'f',
        label_latex: true
    },
    {
        id: 'abc',
        label: 'abc',
        type: 'write',
        val: '\\text{abc}',
        shortcut: ['toggle', 'abc'],
        title: 'abc'
    },

    {
        id: ',',
        label: ',',
        type: 'write',
        val: ',',
        shortcut: [],
        title: ''
    },
    {
        id: '\'',
        label: '\\prime',
        type: 'write',
        val: '\'',
        shortcut: [],
        title: 'Prime/Arcminute'
    },
    {
        id: '"',
        label: '\\doublePrime',
        type: 'write',
        val: '"',
        shortcut: [],
        title: 'Double Prime/Arcsecond'
    },
    {
        id: '\\$',
        label: '$',
        type: 'write',
        val: '\\$',
        shortcut: [],
        title: 'Dollars'
    },

    {
        id: '+',
        label: '+',
        type: 'write',
        val: '+',
        shortcut: ['+'],
        title: 'Plus'
    },
    {
        id: '-',
        label: '-',
        type: 'write',
        val: '-',
        shortcut: ['-'],
        title: 'Minus'
    },
    {
        id: '\\times',
        label: '×',
        type: 'write',
        val: '\\times',
        shortcut: ['*'],
        title: 'Multiply'
    },
    {
        id: '\\div',
        label: '÷',
        type: 'write',
        val: '\\div',
        shortcut: ['toggle', '/'],
        title: 'Divide'
    },
    {
        id: '\\pm',
        label: '±',
        type: 'write',
        val: '\\pm',
        shortcut: ['toggle', 'pm'],
        title: 'Plus or minus'
    },

    {
        id: '=',
        label: '=',
        type: 'write',
        val: '=',
        shortcut: ['='],
        title: 'Equals'
    },
    {
        id: '>',
        label: '>',
        type: 'write',
        val: '>',
        shortcut: ['>'],
        title: 'Greater than'
    },
    {
        id: '<',
        label: '<',
        type: 'write',
        val: '<',
        shortcut: ['<'],
        title: 'Less than'
    },
    {
        id: '\\ge',
        label: '≥',
        type: 'write',
        val: '\\ge',
        shortcut: ['toggle', 'gte'],
        title: 'Greater than or equal to'
    },
    {
        id: '\\le',
        label: '≤',
        type: 'write',
        val: '\\le',
        shortcut: ['toggle', 'lte'],
        title: 'Less than or equal to'
    },
    {
        id: '\\ne',
        label: '≠',
        type: 'write',
        val: '\\neq',
        shortcut: ['toggle', 'ne'],
        title: 'Not equal to'
    },
    {
        id: '\\approx',
        label: '≈',
        type: 'write',
        val: '\\approx',
        shortcut: ['toggle', 'ae'],
        title: 'Approximately equal to'
    },
    {
        id: '\\perp',
        label: '\\perp',
        type: 'write',
        val: '\\perp',
        shortcut: ['toggle', 'pr'],
        title: 'Perpendicular to'
    },
    {
        id: '\\propto',
        label: '\\propto',
        type: 'write',
        val: '\\propto',
        shortcut: ['toggle', 'pl'],
        title: 'Proportional to'
    },
    {
        id: '\\mid',
        label: '|',
        type: 'write',
        val: '|',
        shortcut: [],
        title: 'Vertical line'
    },
    {
        id: '\\ngtr',
        label: '\\ngtr',
        type: 'write',
        val: '\\ngtr',
        shortcut: [],
        title: 'Not greater than'
    },
    {
        id: '\\nless',
        label: '\\nless',
        type: 'cmd',
        val: '\\nless',
        shortcut: [],
        title: 'Not less than'
    },

    {
        id: '\\left(\\right)',
        label: '\\left(\\right)',
        type: 'cmd',
        val: '(',
        shortcut: ['toggle', 'rd'],
        title: 'Group in parentheses'
    },
    {
        id: '\\left[\\right]',
        label: '\\left[\\right]',
        type: 'cmd',
        val: '[',
        shortcut: ['toggle', 'sr'],
        title: 'Group in brackets'
    },
    {
        id: '\\left\\{\\right\\}',
        label: '\\left\\{\\right\\}',
        type: 'cmd',
        val: '{',
        shortcut: ['toggle', 'cr'],
        title: 'Group in curly braces'
    },
    {
        id: '\\left[\\right)',
        label: '\\left[\\right)',
        type: 'write',
        val: '\\left[\\right)',
        shortcut: [],
        title: 'Group in odd braces'
    },
    {
        id: '\\left(\\right]',
        label: '\\left(\\right]',
        type: 'write',
        val: '\\left(\\right]',
        shortcut: [],
        title: 'Group in odd braces'
    },
    {
        id: '[',
        label: '[',
        type: 'write',
        val: '[',
        shortcut: ['['],
        title: 'Left squre bracket'
    }, {
        id: ']',
        label: ']',
        type: 'write',
        val: ']',
        shortcut: [']'],
        title: 'Right square bracket'
    },

    {
        id: '^',
        label: 'x^{}',
        type: 'cmd',
        val: '^',
        shortcut: ['^'],
        title: 'Exponent',
        label_latex: true
    },
    {
        id: '^2',
        label: 'x^2',
        type: 'write',
        val: '^2',
        shortcut: ['toggle', 'pt'],
        title: 'Square',
        label_latex: true
    },
    {
        id: '_',
        label: 'x_{}',
        type: 'cmd',
        val: '_',
        shortcut: ['_'],
        title: 'Subscript',
        label_latex: true
    },

    {
        id: '\\frac',
        label: '\\frac{x}{}',
        type: 'cmd',
        val: '/',
        shortcut: ['/'],
        title: 'Fraction using previous expression as numerator'
    },
    {
        id: 'x\\frac{}{}',
        label: 'x\\frac{}{}',
        type: 'write',
        val: '\\frac{}{}',
        shortcut: ['toggle', 'mf'],
        title: 'Fraction',
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Left'
            },
            {
                type: 'keystroke',
                val: 'Up'
            }
        ]
    }, // Move cursor back and up after adding the fraction, to focus the numerator.
    {
        id: '\\frac{}{}',
        label: '\\frac{}{}',
        type: 'write',
        val: '\\frac{}{}',
        shortcut: [],
        title: 'Fraction',
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Left'
            },
            {
                type: 'keystroke',
                val: 'Up'
            }
        ]
    }, // Move cursor back and up after adding the fraction, to focus the numerator.
    {
        id: ':',
        label: ':',
        type: 'write',
        val: ':',
        shortcut: [':'],
        title: 'Ratio'
    },
    {
        id: '%',
        label: '%',
        type: 'write',
        val: '%',
        shortcut: ['%'],
        title: 'Percentage'
    },
    {
        id: '\\abs',
        label: '\\abs{}',
        type: 'cmd',
        val: '\\abs',
        shortcut: ['toggle', 'abs'],
        title: 'Absolute value'
    },

    {
        id: '\\sqrt',
        label: '\\sqrt{}',
        type: 'cmd',
        val: '\\sqrt',
        shortcut: ['toggle', 'sq'],
        title: 'Square root'
    },
    {
        id: '\\sqrt[3]{}',
        label: '\\sqrt[3]{}',
        type: 'cmd',
        val: '\\lrncuberoot',
        shortcut: ['toggle', 'cb'],
        title: 'Cube root'
    },
    {
        id: '\\sqrt[n]{}',
        label: '\\sqrt[]{}',
        type: 'cmd',
        val: '\\nthroot',
        shortcut: ['toggle', 'nsq'],
        title: 'Nth root'
    },
    {
        id: '\\int_{}^{}',
        label: '\\int_{}^{}',
        type: 'write',
        val: '\\int_{}^{}',
        shortcut: ['toggle', 'int'],
        title: 'Integral',
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Left'
            },
            {
                type: 'keystroke',
                val: 'Down'
            }
        ]
    },
    {
        id: '\\sum',
        label: '\\sum',
        type: 'write',
        val: '\\sum',
        shortcut: [],
        title: 'Summation',
        label_latex: true
    },
    {
        id: '\\partial',
        label: '\\partial',
        type: 'write',
        val: '\\partial',
        shortcut: [],
        title: 'Partial Derivative',
        label_latex: true
    },
    {
        id: '\\lim_{x\\to {}}',
        label: '\\lim_{x\\to {}}',
        type: 'write',
        val: '\\lim_{x\\to {}}',
        shortcut: [],
        title: 'Limit x to',
        label_latex: true
    },

    {
        id: '\\underset{\\sim}{\\mathbf{}}',
        label: '\\underset{\\sim}{\\mathbf{}}',
        type: 'write',
        val: '\\underset{\\sim}{\\mathbf{}}',
        shortcut: ['toggle', 'vec'],
        title: 'Vector',
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Left'
            },
            {
                type: 'keystroke',
                val: 'Left'
            }
        ],
        aliases: ['\\mathbf{\\underset{\\sim}{}}']
    },
    {
        id: '\\mathbb{R}',
        label: '\\mathbb{R}',
        type: 'write',
        val: '\\mathbb{R}',
        shortcut: ['toggle', 'rea'],
        title: 'Real number set'
    },
    {
        id: '\\mathbbq',
        label: '\\mathbb{Q}',
        type: 'write',
        val: '\\mathbb{Q}',
        shortcut: [],
        title: 'Q'
    },
    {
        id: '\\mathbbn',
        label: '\\mathbb{N}',
        type: 'write',
        val: '\\mathbb{N}',
        shortcut: [],
        title: 'N'
    },
    {
        id: '\\mathbbz',
        label: '\\mathbb{Z}',
        type: 'write',
        val: '\\mathbb{Z}',
        shortcut: [],
        title: 'Z'
    },
    {
        id: '\\mathbbi',
        label: '\\mathbb{I}',
        type: 'write',
        val: '\\mathbb{I}',
        shortcut: [],
        title: 'I'
    },
    {
        id: '\\mathbbc',
        label: '\\mathbb{C}',
        type: 'write',
        val: '\\mathbb{C}',
        shortcut: [],
        title: 'C'
    },
    {
        id: 'imaginary',
        label: 'i',
        type: 'write',
        val: '\\text{i}',
        shortcut: [],
        title: 'Imaginary Number'
    },
    {
        id: 'euler',
        label: 'e',
        type: 'write',
        val: '\\text{e}',
        shortcut: [],
        title: 'Euler Number'
    },

    {
        id: '\\alpha',
        label: '\\alpha',
        type: 'write',
        val: '\\alpha',
        shortcut: ['toggle', 'al'],
        title: 'Alpha'
    },
    {
        id: '\\beta',
        label: '\\beta',
        type: 'write',
        val: '\\beta',
        shortcut: ['toggle', 'be'],
        title: 'Beta'
    },
    {
        id: '\\gamma',
        label: '\\gamma',
        type: 'write',
        val: '\\gamma',
        shortcut: ['toggle', 'ga'],
        title: 'Gamma'
    },
    {
        id: '\\delta',
        label: '\\delta',
        type: 'write',
        val: '\\delta',
        shortcut: ['toggle', 'de'],
        title: 'Delta'
    },
    {
        id: '\\epsilon',
        label: '\\epsilon',
        type: 'write',
        val: '\\epsilon',
        shortcut: ['toggle', 'ep'],
        title: 'Epsilon'
    },
    {
        id: '\\varepsilon',
        label: '\\varepsilon',
        type: 'write',
        val: '\\varepsilon',
        shortcut: ['toggle', 'vep'],
        title: 'Epsilon'
    },
    {
        id: '\\zeta',
        label: '\\zeta',
        type: 'write',
        val: '\\zeta',
        shortcut: ['toggle', 'ze'],
        title: 'Zeta'
    },
    {
        id: '\\eta',
        label: '\\eta',
        type: 'write',
        val: '\\eta',
        shortcut: ['toggle', 'et'],
        title: 'Eta'
    },
    {
        id: '\\theta',
        label: '\\theta',
        type: 'write',
        val: '\\theta',
        shortcut: ['toggle', 'th'],
        title: 'Theta'
    },
    {
        id: '\\iota',
        label: '\\iota',
        type: 'write',
        val: '\\iota',
        shortcut: ['toggle', 'io'],
        title: 'Iota'
    },
    {
        id: '\\kappa',
        label: '\\kappa',
        type: 'write',
        val: '\\kappa',
        shortcut: ['toggle', 'ka'],
        title: 'Kappa'
    },
    {
        id: '\\lambda',
        label: '\\lambda',
        type: 'write',
        val: '\\lambda',
        shortcut: ['toggle', 'lbd'],
        title: 'Lambda'
    },
    {
        id: '\\mu',
        label: '\\mu',
        type: 'write',
        val: '\\mu',
        shortcut: ['toggle', 'mu'],
        title: 'Mu'
    },
    {
        id: '\\nu',
        label: '\\nu',
        type: 'write',
        val: '\\nu',
        shortcut: ['toggle', 'nu'],
        title: 'Nu'
    },
    {
        id: '\\xi',
        label: '\\xi',
        type: 'write',
        val: '\\xi',
        shortcut: ['toggle', 'xi'],
        title: 'Xi'
    },
    {
        id: 'o',
        label: 'o',
        type: 'write',
        val: 'o',
        shortcut: ['toggle', 'omc'],
        title: 'Omicron',
        label_latex: true
    },
    {
        id: '\\pi',
        label: '\\pi',
        type: 'write',
        val: '\\pi',
        shortcut: ['toggle', 'pi'],
        title: 'Pi'
    },
    {
        id: '\\rho',
        label: '\\rho',
        type: 'write',
        val: '\\rho',
        shortcut: ['toggle', 'rh'],
        title: 'Rho'
    },
    {
        id: '\\sigma',
        label: '\\sigma',
        type: 'write',
        val: '\\sigma',
        shortcut: ['toggle', 'sig'],
        title: 'Sigma'
    },
    {
        id: '\\tau',
        label: '\\tau',
        type: 'write',
        val: '\\tau',
        shortcut: ['toggle', 'ta'],
        title: 'Tau'
    },
    {
        id: '\\upsilon',
        label: '\\upsilon',
        type: 'write',
        val: '\\upsilon',
        shortcut: ['toggle', 'ups'],
        title: 'Upsilon'
    },
    {
        id: '\\phi',
        label: '\\phi',
        type: 'write',
        val: '\\phi',
        shortcut: ['toggle', 'ph'],
        title: 'Phi'
    },
    {
        id: '\\chi',
        label: '\\chi',
        type: 'write',
        val: '\\chi',
        shortcut: ['toggle', 'ch'],
        title: 'Chi'
    },
    {
        id: '\\psi',
        label: '\\psi',
        type: 'write',
        val: '\\psi',
        shortcut: ['toggle', 'psi'],
        title: 'Psi'
    },
    {
        id: '\\omega',
        label: '\\omega',
        type: 'write',
        val: '\\omega',
        shortcut: ['toggle', 'omg'],
        title: 'Omega'
    },
    {
        id: 'A',
        label: 'A',
        type: 'write',
        val: 'A',
        shortcut: ['toggle', 'ual'],
        title: 'Alpha (uppercase)',
        label_latex: true
    },
    {
        id: 'B',
        label: 'B',
        type: 'write',
        val: 'B',
        shortcut: ['toggle', 'ube'],
        title: 'Beta (uppercase)',
        label_latex: true
    },
    {
        id: '\\Gamma',
        label: '\\Gamma',
        type: 'write',
        val: '\\Gamma',
        shortcut: ['toggle', 'uga'],
        title: 'Gamma (uppercase)'
    },
    {
        id: '\\Delta',
        label: '\\Delta',
        type: 'write',
        val: '\\Delta',
        shortcut: ['toggle', 'ude'],
        title: 'Delta (uppercase)'
    },
    {
        id: 'E',
        label: 'E',
        type: 'write',
        val: 'E',
        shortcut: ['toggle', 'uep'],
        title: 'Epsilon (uppercase)',
        label_latex: true
    },
    {
        id: 'Z',
        label: 'Z',
        type: 'write',
        val: 'Z',
        shortcut: ['toggle', 'uze'],
        title: 'Zeta (uppercase)',
        label_latex: true
    },
    {
        id: 'H',
        label: 'H',
        type: 'write',
        val: 'H',
        shortcut: ['toggle', 'uet'],
        title: 'Eta (uppercase)',
        label_latex: true
    },
    {
        id: '\\Theta',
        label: '\\Theta',
        type: 'write',
        val: '\\Theta',
        shortcut: ['toggle', 'uth'],
        title: 'Theta (uppercase)'
    },
    {
        id: 'I',
        label: 'I',
        type: 'write',
        val: 'I',
        shortcut: ['toggle', 'uio'],
        title: 'Iota (uppercase)',
        label_latex: true
    },
    {
        id: 'K',
        label: 'K',
        type: 'write',
        val: 'K',
        shortcut: ['toggle', 'uka'],
        title: 'Kappa (uppercase)',
        label_latex: true
    },
    {
        id: '\\Lambda',
        label: '\\Lambda',
        type: 'write',
        val: '\\Lambda',
        shortcut: ['toggle', 'ulbd'],
        title: 'Lambda (uppercase)'
    },
    {
        id: 'M',
        label: 'M',
        type: 'write',
        val: 'M',
        shortcut: ['toggle', 'umu'],
        title: 'Mu (uppercase)',
        label_latex: true
    },
    {
        id: 'N',
        label: 'N',
        type: 'write',
        val: 'N',
        shortcut: ['toggle', 'unu'],
        title: 'Nu (uppercase)',
        label_latex: true
    },
    {
        id: '\\Xi',
        label: '\\Xi',
        type: 'write',
        val: '\\Xi',
        shortcut: ['toggle', 'uxi'],
        title: 'Xi (uppercase)'
    },
    {
        id: 'O',
        label: 'O',
        type: 'write',
        val: 'O',
        shortcut: ['toggle', 'uomc'],
        title: 'Omicron (uppercase)',
        label_latex: true
    },
    {
        id: '\\Pi',
        label: '\\Pi',
        type: 'write',
        val: '\\Pi',
        shortcut: ['toggle', 'upi'],
        title: 'Pi (uppercase)'
    },
    {
        id: 'R',
        label: 'R',
        type: 'write',
        val: 'R',
        shortcut: ['toggle', 'urh'],
        title: 'Rho (uppercase)',
        label_latex: true
    },
    {
        id: '\\Sigma',
        label: '\\Sigma',
        type: 'write',
        val: '\\Sigma',
        shortcut: ['toggle', 'w'],
        title: 'Sigma (uppercase)'
    },
    {
        id: 'T',
        label: 'T',
        type: 'write',
        val: 'T',
        shortcut: ['toggle', 'uta'],
        title: 'Tau (uppercase)',
        label_latex: true
    },
    {
        id: '\\Upsilon',
        label: '\\Upsilon',
        type: 'write',
        val: '\\Upsilon',
        shortcut: ['toggle', 'uups'],
        title: 'Upsilon (uppercase)'
    },
    {
        id: '\\Phi',
        label: '\\Phi',
        type: 'write',
        val: '\\Phi',
        shortcut: ['toggle', 'uph'],
        title: 'Phi (uppercase)'
    },
    {
        id: 'X',
        label: 'X',
        type: 'write',
        val: 'X',
        shortcut: ['toggle', 'uch'],
        title: 'Chi (uppercase)',
        label_latex: true
    },
    {
        id: '\\Psi',
        label: '\\Psi',
        type: 'write',
        val: '\\Psi',
        shortcut: ['toggle', 'upsi'],
        title: 'Psi (uppercase)'
    },
    {
        id: '\\Omega',
        label: '\\Omega',
        type: 'write',
        val: '\\Omega',
        shortcut: ['toggle', 'uomg'],
        title: 'Omega (uppercase)'
    },

    {
        id: '\\sin',
        label: '\\sin',
        type: 'write',
        val: '\\sin',
        shortcut: ['toggle', 'sin'],
        title: 'Sine'
    },
    {
        id: '\\cos',
        label: '\\cos',
        type: 'write',
        val: '\\cos',
        shortcut: ['toggle', 'cos'],
        title: 'Cosine'
    },
    {
        id: '\\tan',
        label: '\\tan',
        type: 'write',
        val: '\\tan',
        shortcut: ['toggle', 'tan'],
        title: 'Tangent'
    },
    {
        id: '\\arcsin',
        label: '\\arcsin',
        type: 'write',
        val: '\\arcsin',
        shortcut: ['toggle', 'isin'],
        title: 'Inverse sine'
    },
    {
        id: '\\arccos',
        label: '\\arccos',
        type: 'write',
        val: '\\arccos',
        shortcut: ['toggle', 'icos'],
        title: 'Inverse cosine'
    },
    {
        id: '\\arctan',
        label: '\\arctan',
        type: 'write',
        val: '\\arctan',
        shortcut: ['toggle', 'itan'],
        title: 'Inverse tangent'
    },
    {
        id: '\\sec',
        label: '\\sec',
        type: 'write',
        val: '\\sec',
        shortcut: [],
        title: ''
    },
    {
        id: '\\csc',
        label: '\\csc',
        type: 'write',
        val: '\\csc',
        shortcut: [],
        title: ''
    },
    {
        id: '\\cot',
        label: '\\cot',
        type: 'write',
        val: '\\cot',
        shortcut: [],
        title: ''
    },
    {
        id: '\\sin^{-1}',
        label: '\\sin^{-1}',
        type: 'write',
        val: '\\sin^{-1}',
        shortcut: [],
        title: ''
    },
    {
        id: '\\sec^{-1}',
        label: '\\sec^{-1}',
        type: 'write',
        val: '\\sec^{-1}',
        shortcut: [],
        title: ''
    },
    {
        id: '\\cos^{-1}',
        label: '\\cos^{-1}',
        type: 'write',
        val: '\\cos^{-1}',
        shortcut: [],
        title: ''
    },
    {
        id: '\\csc^{-1}',
        label: '\\csc^{-1}',
        type: 'write',
        val: '\\csc^{-1}',
        shortcut: [],
        title: ''
    },
    {
        id: '\\tan^{-1}',
        label: '\\tan^{-1}',
        type: 'write',
        val: '\\tan^{-1}',
        shortcut: [],
        title: ''
    },
    {
        id: '\\cot^{-1}',
        label: '\\cot^{-1}',
        type: 'write',
        val: '\\cot^{-1}',
        shortcut: [],
        title: ''
    },

    {
        id: '\\cap',
        label: '\\intersection',
        type: 'write',
        val: '\\intersection',
        shortcut: ['toggle', 'ir'],
        title: 'Intersection'
    },
    {
        id: '\\cup',
        label: '\\union',
        type: 'write',
        val: '\\union',
        shortcut: ['toggle', 'un'],
        title: 'Union'
    },
    {
        id: '\\in',
        label: '\\in',
        type: 'write',
        val: '\\in',
        shortcut: ['toggle', 'mo'],
        title: 'Member of'
    },
    {
        id: '\\notin',
        label: '\\notin',
        type: 'write',
        val: '\\notin',
        shortcut: ['toggle', 'nmo'],
        title: 'Not member of'
    },
    {
        id: '\\ni',
        label: '\\ni',
        type: 'write',
        val: '\\ni',
        shortcut: ['toggle', 'cs'],
        title: 'Contains'
    },
    {
        id: '\\subseteq',
        label: '\\subseteq',
        type: 'write',
        val: '\\subseteq',
        shortcut: ['toggle', 'sb'],
        title: 'Subset'
    },
    {
        id: '\\supseteq',
        label: '\\supseteq',
        type: 'write',
        val: '\\supseteq',
        shortcut: ['toggle', 'sp'],
        title: 'Superset'
    },
    {
        id: '\\subset',
        label: '\\subset',
        type: 'write',
        val: '\\subset',
        shortcut: ['toggle', 'ssb'],
        title: 'Subset (strict)'
    },
    {
        id: '\\supset',
        label: '\\supset',
        type: 'write',
        val: '\\supset',
        shortcut: ['toggle', 'ssp'],
        title: 'Superset (strict)'
    },
    {
        id: '\\not\\subset',
        label: '\\not\\subset',
        type: 'write',
        val: '\\not\\subset',
        shortcut: ['toggle', 'snb'],
        title: 'Not subset (strict)'
    },
    {
        id: '\\not\\supset',
        label: '\\not\\supset',
        type: 'write',
        val: '\\not\\supset',
        shortcut: ['toggle', 'snp'],
        title: 'Not superset (strict)'
    },
    {
        id: '\\not\\subseteq',
        label: '\\not\\subseteq',
        type: 'write',
        val: '\\not\\subseteq',
        shortcut: ['toggle', 'nsb'],
        title: 'Not subset'
    },
    {
        id: '\\not\\supseteq',
        label: '\\not\\supseteq',
        type: 'write',
        val: '\\not\\supseteq',
        shortcut: ['toggle', 'nsp'],
        title: 'Not superset'
    },
    {
        id: '\\not\\ni',
        label: '\\not\\ni',
        type: 'write',
        val: '\\not\\ni',
        shortcut: ['toggle', 'ncs'],
        title: 'Does not contain'
    },
    {
        id: '\\backslash',
        label: '\\backslash',
        type: 'write',
        val: '\\backslash',
        shortcut: ['toggle', 'bsh'],
        title: 'Backslash'
    },
    {
        id: '\\slash',
        label: '/',
        type: 'write',
        val: '\\slash',
        title: 'Forward slash'
    },
    {
        id: '!',
        label: '!',
        type: 'write',
        val: '!',
        shortcut: ['!'],
        title: 'Factorial'
    },
    {
        id: '\\emptyset',
        label: '\\emptyset',
        type: 'write',
        val: '\\emptyset',
        shortcut: [],
        title: ''
    },

    {
        id: '\\angle',
        label: '\\angle',
        type: 'write',
        val: '\\angle',
        shortcut: ['toggle', 'ang'],
        title: 'Angle'
    },
    {
        id: '\\measuredangle',
        label: '\\measuredangle',
        type: 'write',
        val: '\\measuredangle',
        shortcut: ['toggle', 'mang'],
        title: 'Measure of angle'
    },
    {
        id: '\\parallel',
        label: '\\parallel',
        type: 'write',
        val: '\\parallel',
        shortcut: ['toggle', 'pa'],
        title: 'Parallel to'
    },
    {
        id: '\\nparallel',
        label: '\\nparallel',
        type: 'write',
        val: '\\nparallel',
        shortcut: ['toggle', 'npa'],
        title: 'Not parallel to'
    },
    {
        id: '\\sim',
        label: '\\sim',
        type: 'write',
        val: '\\sim',
        shortcut: ['toggle', 'sm'],
        title: 'Similar to'
    },
    {
        id: '\\cong',
        label: '\\cong',
        type: 'write',
        val: '\\cong',
        shortcut: ['toggle', 'cg'],
        title: 'Congruent to'
    },
    {
        id: '\\degree',
        label: '\\degree',
        type: 'write',
        val: '\\degree',
        shortcut: ['toggle', 'dg'],
        title: 'Degree symbol'
    },

    {
        id: '\\triangle',
        label: '\\triangle',
        type: 'write',
        val: '\\triangle',
        shortcut: ['toggle', 'tri'],
        title: 'Triangle'
    },
    {
        id: '\\circledot',
        label: '\\circledot',
        type: 'write',
        val: '\\circledot',
        shortcut: ['toggle', 'cir'],
        title: 'Circle'
    },
    {
        id: '\\parallelogram',
        label: '\\parallelogram',
        type: 'cmd',
        val: '\\parallelogram',
        shortcut: ['toggle', 'par'],
        title: 'Parallelogram'
    },
    {
        id: '\\leftarrow',
        label: '\\leftarrow',
        type: 'write',
        val: '\\leftarrow',
        shortcut: ['toggle', 'la'],
        title: 'Leftwards arrow'
    },
    {
        id: '\\rightarrow',
        label: '\\rightarrow',
        type: 'write',
        val: '\\rightarrow',
        shortcut: ['toggle', 'ra'],
        title: 'Rightwards arrow'
    },
    {
        id: '\\leftrightarrow',
        label: '\\leftrightarrow',
        type: 'write',
        val: '\\leftrightarrow',
        shortcut: ['toggle', 'lr'],
        title: 'Left/right arrow'
    },
    {
        id: '\\longleftrightarrow',
        label: '\\longleftrightarrow',
        type: 'write',
        val: '\\longleftrightarrow',
        shortcut: ['toggle', 'llr'],
        title: 'Long left/right arrow'
    },
    {
        id: '\\overrightarrow',
        label: '\\overrightarrow{}',
        type: 'cmd',
        val: '\\overrightarrow',
        shortcut: ['toggle', 'ry'],
        title: 'Ray'
    },
    {
        id: '\\rightdoublearrow',
        label: '\\Rightarrow',
        type: 'write',
        val: '\\Rightarrow',
        shortcut: ['toggle', 'rda'],
        title: 'Implies equivalence',
        name: 'rightdoublearrow'
    }, {
        id: '\\leftrightdoublearrow',
        label: '\\Leftrightarrow',
        type: 'write',
        val: '\\Leftrightarrow',
        shortcut: ['toggle', 'lrda'],
        title: 'Material equivalence',
        name: 'leftrightdoublearrow'
    },
    {
        id: '\\overleftarrow',
        label: '\\overleftarrow{}',
        type: 'cmd',
        val: '\\overleftarrow',
        shortcut: ['toggle', 'ry'],
        title: 'Left ray'
    },
    {
        id: '\\overleftrightarrow',
        label: '\\overleftrightarrow{}',
        type: 'cmd',
        val: '\\overleftrightarrow',
        shortcut: ['toggle', 'li'],
        title: 'Line'
    },
    {
        id: '\\overline',
        label: '\\overline{}',
        type: 'cmd',
        val: '\\overline',
        shortcut: ['toggle', 'li'],
        title: 'Line segment'
    },
    {
        id: '\\dot',
        label: '\\dot{}',
        type: 'cmd',
        val: '\\dot',
        shortcut: [],
        title: 'Recurring Decimal'
    },
    {
        id: '\\longdiv',
        label: '\\longdiv{}',
        type: 'cmd',
        val: '\\longdiv',
        shortcut: ['toggle', 'ld'],
        title: 'Long division'
    },
    {
        id: '\\overset{}^{H}',
        label: '\\overset{}^{H}',
        type: 'write',
        val: '\\overset{}{} ',
        shortcut: ['toggle', 'ox'],
        title: 'Oxidation',
        label_latex: true,
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Up'
            }
        ]
    },

    {
        id: '\\therefore',
        label: '\\therefore',
        type: 'write',
        val: '\\therefore',
        shortcut: ['toggle', 'tf'],
        title: 'Therefore'
    },
    {
        id: '\\infty',
        label: '\\infinity',
        type: 'write',
        val: '\\infinity',
        shortcut: ['toggle', 'ift'],
        title: 'Infinity'
    },
    {
        id: '\\square',
        label: '\\square',
        type: 'write',
        val: '\\square',
        shortcut: ['toggle', 'sqr'],
        title: 'Square'
    },

    {
        id: '\\matrix',
        label: '☷',
        type: 'cmd',
        val: '\\matrix',
        shortcut: ['toggle', 'mx'],
        title: 'Matrix'
    },
    {
        id: '\\pmatrix',
        label: '(☷)',
        type: 'cmd',
        val: '\\pmatrix',
        shortcut: ['toggle', 'px'],
        title: 'Matrix bounded by parentheses'
    },
    {
        id: '\\bmatrix',
        label: '\\begin{bmatrix}&\\\\&\\end{bmatrix}',
        type: 'cmd',
        val: '\\bmatrix',
        shortcut: ['toggle', 'bx'],
        title: '2 x 2 Matrix bounded by brackets',
        label_latex: true
    },
    {
        id: '\\threebmatrix',
        label: '\\begin{bmatrix}&&\\\\&&\\\\&&\\end{bmatrix}',
        type: 'write',
        val: '\\begin{bmatrix}&&\\\\&&\\\\&&\\end{bmatrix}',
        shortcut: [],
        title: '3 x 3 Matrix bounded by brackets',
        label_latex: true,
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Left Left Left Up Up'
            }
        ]
    },
    {
        id: '\\singlebmatrix',
        label: '\\begin{bmatrix}\\end{bmatrix}',
        type: 'write',
        val: '\\begin{bmatrix}\\end{bmatrix}',
        shortcut: [],
        title: 'Single Matrix bounded by brackets',
        label_latex: true,
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Left'
            }
        ]
    },
    {
        id: '\\Bmatrix',
        label: '{☷}',
        type: 'cmd',
        val: '\\Bmatrix',
        shortcut: ['toggle', 'bbx'],
        title: 'Matrix bounded by braces'
    },
    {
        id: '\\vmatrix',
        label: '|☷|',
        type: 'cmd',
        val: '\\vmatrix',
        shortcut: ['toggle', 'vx'],
        title: 'Matrix bounded by vertical lines'
    },
    {
        id: '\\Vmatrix',
        label: '‖☷‖',
        type: 'cmd',
        val: '\\Vmatrix',
        shortcut: ['toggle', 'vvx'],
        title: 'Matrix bounded by double vertical lines'
    },

    {
        id: '\\ldots',
        label: '\\ldots',
        type: 'write',
        val: '\\ldots',
        shortcut: ['toggle', 'ld'],
        title: 'Horizontal dots (baseline)'
    },
    {
        id: '\\cdots',
        label: '\\cdots',
        type: 'write',
        val: '\\cdots',
        shortcut: ['toggle', 'cd'],
        title: 'Horizontal dots (centered)'
    },
    {
        id: '\\ddots',
        label: '\\ddots',
        type: 'write',
        val: '\\ddots',
        shortcut: ['toggle', 'dd'],
        title: 'Diagonal dots'
    },
    {
        id: '\\vdots',
        label: '\\vdots',
        type: 'write',
        val: '\\vdots',
        shortcut: ['toggle', 'vd'],
        title: 'Vertical dots'
    },

    {
        id: '\\cdot',
        label: '\\cdot',
        type: 'write',
        val: '\\cdot',
        shortcut: [],
        title: 'Dot multiplier'
    },
    {
        id: '\\cdotp',
        label: '\\cdotp',
        type: 'write',
        val: '\\cdotp',
        shortcut: [],
        title: 'Center dot (punctuation)'
    },

    {
        id: '\\response',
        label: '□',
        type: 'write',
        val: '\\response',
        shortcut: ['toggle', 'rs'],
        title: 'Editable {{response}} area'
    },

    {
        id: '║',
        label: '\\addmatrixcol',
        type: 'softkey',
        val: 'insertColumn',
        shortcut: ['toggle', 'space'],
        title: 'Insert column',
        label_latex: true
    },
    {
        id: '═',
        label: '\\addmatrixrow',
        type: 'softkey',
        val: 'insertRow',
        shortcut: ['toggle', 'enter'],
        title: 'Insert row'
    },
    {
        id: '\\left\\{\\begin{array}{l}\\end{array}\\right.',
        label: '\\left\\{\\begin{array}{l}\\end{array}\\right.',
        label_latex: true,
        type: 'write',
        val: '\\left\\{\\begin{array}{l}\\end{array}\\right.',
        shortcut: ['toggle', 'ine'],
        title: 'System of equations/inequalities',
        name: 'inequalities',
        style: 'lrn-btn-array'
    },
    {
        id: 'g',
        label: 'g',
        type: 'write',
        val: '\\text{g}',
        shortcut: ['g'],
        title: 'Gram'
    },
    {
        id: 'cg',
        label: 'cg',
        type: 'write',
        val: '\\text{cg}',
        shortcut: ['cg'],
        title: 'Centigram'
    },
    {
        id: 'kg',
        label: 'kg',
        type: 'write',
        val: '\\text{kg}',
        shortcut: ['kg'],
        title: 'Kilogram'
    },
    {
        id: 'mg',
        label: 'mg',
        type: 'write',
        val: '\\text{mg}',
        shortcut: ['mg'],
        title: 'Milligram'
    },
    {
        id: 'ng',
        label: 'ng',
        type: 'write',
        val: '\\text{ng}',
        shortcut: ['ng'],
        title: 'Nanogram'
    },
    {
        id: 'm',
        label: 'm',
        type: 'write',
        val: '\\text{m}',
        shortcut: ['m'],
        title: 'Meter'
    },
    {
        id: 'cm',
        label: 'cm',
        type: 'write',
        val: '\\text{cm}',
        shortcut: ['cm'],
        title: 'Centimeter'
    },
    {
        id: 'km',
        label: 'km',
        type: 'write',
        val: '\\text{km}',
        shortcut: ['km'],
        title: 'Kilometer'
    },
    {
        id: 'mm',
        label: 'mm',
        type: 'write',
        val: '\\text{mm}',
        shortcut: ['mm'],
        title: 'Millimeter'
    },
    {
        id: 'nm',
        label: 'nm',
        type: 'write',
        val: '\\text{nm}',
        shortcut: ['nm'],
        title: 'Nanometer'
    },
    {
        id: 's',
        label: 's',
        type: 'write',
        val: '\\text{s}',
        shortcut: ['s'],
        title: 'Second'
    },
    {
        id: 'cs',
        label: 'cs',
        type: 'write',
        val: '\\text{cs}',
        shortcut: ['cs'],
        title: 'Centisecond'
    },
    {
        id: 'ks',
        label: 'ks',
        type: 'write',
        val: '\\text{ks}',
        shortcut: ['ks'],
        title: 'Kilosecond'
    },
    {
        id: 'ms',
        label: 'ms',
        type: 'write',
        val: '\\text{ms}',
        shortcut: ['ms'],
        title: 'Millisecond'
    },
    {
        id: 'ns',
        label: 'ns',
        type: 'write',
        val: '\\text{ns}',
        shortcut: ['ns'],
        title: 'Nanosecond'
    },
    {
        id: 'L',
        label: 'L',
        type: 'write',
        val: '\\text{L}',
        shortcut: ['L'],
        title: 'Liter'
    },
    {
        id: 'mL',
        label: 'mL',
        type: 'write',
        val: '\\text{mL}',
        shortcut: ['mL'],
        title: 'Millitliter'
    },
    {
        id: 'µg',
        label: 'µg',
        type: 'write',
        val: '\\text{µg}',
        shortcut: [],
        title: 'Microgram'
    },

    {
        id: 'in',
        label: 'in',
        type: 'write',
        val: '\\text{in}',
        shortcut: ['in'],
        title: 'Inch'
    },
    {
        id: 'ft',
        label: 'ft',
        type: 'write',
        val: '\\text{ft}',
        shortcut: ['ft'],
        title: 'Foot'
    },
    {
        id: 'mi',
        label: 'mi',
        type: 'write',
        val: '\\text{mi}',
        shortcut: ['mi'],
        title: 'Mile'
    },
    {
        id: 'fl',
        label: 'fl oz',
        type: 'write',
        val: '\\text{fl oz}',
        shortcut: ['fl'],
        title: 'Fluid Ounce'
    },
    {
        id: 'cup',
        label: 'cup',
        type: 'write',
        val: '\\text{cup}',
        shortcut: ['cup'],
        title: 'Cup'
    },
    {
        id: 'pt',
        label: 'pt',
        type: 'write',
        val: '\\text{pt}',
        shortcut: ['pt'],
        title: 'Pint'
    },
    {
        id: 'qt',
        label: 'qt',
        type: 'write',
        val: '\\text{qt}',
        shortcut: ['qt'],
        title: 'Quart'
    },
    {
        id: 'gal',
        label: 'gal',
        type: 'write',
        val: '\\text{gal}',
        shortcut: ['gal'],
        title: 'Gallon'
    },
    {
        id: 'oz',
        label: 'oz',
        type: 'write',
        val: '\\text{oz}',
        shortcut: ['oz'],
        title: 'Ounce'
    },
    {
        id: 'lb',
        label: 'lb',
        type: 'write',
        val: '\\text{lb}',
        shortcut: ['lb'],
        title: 'Pound'
    },

    {
        id: 'mug',
        label: 'µg',
        type: 'write',
        val: '\\mug',
        shortcut: ['mug'],
        title: 'Microgram'
    },
    {
        id: 'mus',
        label: 'µs',
        type: 'write',
        val: '\\mus',
        shortcut: ['mus'],
        title: 'Microsecond'
    },
    {
        id: 'mum',
        label: 'µm',
        type: 'write',
        val: '\\mum',
        shortcut: ['mum'],
        title: 'Micrometer'
    },
    {
        id: 'muL',
        label: 'µL',
        type: 'write',
        val: '\\muL',
        shortcut: ['muL'],
        title: 'Microlitre'
    },

    // CA: box instead of x symbols
    {
        id: 'box_^',
        label: '\\lrnexponent{}{}',
        type: 'cmd',
        val: '\\lrnexponent',
        shortcut: ['^'],
        title: 'Exponent',
        label_latex: true
    },
    {
        id: 'box_^2',
        label: '\\lrnexponent{}{2}',
        type: 'cmd',
        val: '\\lrnsquaredexponent',
        shortcut: ['toggle', 'pt'],
        title: 'Square',
        label_latex: true
    },
    {
        id: 'box__',
        label: '\\lrnsubscript{}{}',
        type: 'cmd',
        val: '\\lrnsubscript',
        shortcut: ['_'],
        title: 'Subscript',
        label_latex: true
    },
    {
        id: 'box_\\frac',
        label: '\\frac{\\square}{}',
        type: 'cmd',
        val: '/',
        shortcut: ['/'],
        title: 'Fraction'
    },
    {
        id: 'box_x\\frac{}{}',
        label: '\\square\\frac{}{}',
        type: 'write',
        val: '\\frac{}{}',
        shortcut: ['toggle', 'mf'],
        title: 'Fraction',
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Left'
            },
            {
                type: 'keystroke',
                val: 'Up'
            }
        ]
    }, // Move cursor back and up after adding the fraction, to focus the numerator.

    {
        id: 'mol',
        label: 'mol',
        type: 'write',
        val: '\\text{mol}',
        shortcut: ['mol'],
        title: 'Mole'
    },
    {
        id: '\\atomic',
        label: '_{}^{}\\text{H}',
        type: 'write',
        val: '_{}^{}',
        shortcut: [],
        title: 'Atomic symbol',
        label_latex: true,
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Up'
            }
        ]
    },
    {
        id: '\\polyatomic',
        label: '\\text{H}_{}{}^{}',
        type: 'write',
        val: '_{}{}^{}',
        shortcut: [],
        title: 'Polyatomic ion',
        label_latex: true,
        extra_commands: [
            {
                type: 'keystroke',
                val: 'Up'
            }
        ]
    },
    {
        id: 'chem^',
        label: '\\text{H}^{}',
        type: 'cmd',
        val: '^',
        shortcut: [],
        title: 'Superscript',
        label_latex: true
    },
    {
        id: 'chem_',
        label: '\\text{H}_{}',
        type: 'cmd',
        val: '_',
        shortcut: [],
        title: 'Subscript',
        label_latex: true
    },
    {
        id: '\\text{g}\\ \\text{mol}^{-1}',
        label: '\\text{g}\\ \\text{mol}^{-1}',
        type: 'write',
        val: '\\text{g}\\ \\text{mol}^{-1}',
        shortcut: ['gpm'],
        title: 'Molar mass'
    },

    {
        id: '\\rightleftharpoons',
        label: '\\rightleftharpoons',
        type: 'write',
        val: '\\rightleftharpoons',
        shortcut: ['toggle', 'rlh'],
        title: 'Right / left harpoons'
    },
    {
        id: '\\leftrightharpoons',
        label: '\\leftrightharpoons',
        type: 'write',
        val: '\\leftrightharpoons',
        shortcut: ['toggle', 'lrh'],
        title: 'Left / right harpoons'
    },
    {
        id: '\\ce{\\bond{-}}',
        label: '\\ce{\\bond{-}}',
        type: 'write',
        val: '\\ce{\\bond{-}}',
        shortcut: ['toggle', 'sib'],
        title: 'Single bond'
    },
    {
        id: '\\ce{\\bond{=}}',
        label: '\\ce{\\bond{=}}',
        type: 'write',
        val: '\\ce{\\bond{=}}',
        shortcut: ['toggle', 'dob'],
        title: 'Double bond'
    },
    {
        id: '\\ce{\\bond{#}}',
        label: '\\ce{\\bond{#}}',
        type: 'write',
        val: '\\ce{\\bond{#}}',
        shortcut: ['toggle', 'trb'],
        title: 'Triple bond'
    },
    {
        id: '\\ce{\\bond{...}}',
        label: '\\ce{\\bond{...}}',
        type: 'write',
        val: '\\ce{\\bond{...}}',
        shortcut: ['toggle', 'tdb'],
        title: 'Three dot bond'
    },
    {
        id: '\\ce{\\bond{....}}',
        label: '\\ce{\\bond{....}}',
        type: 'write',
        val: '\\ce{\\bond{....}}',
        shortcut: ['toggle', 'fdb'],
        title: 'Four dot bond'
    },
    {
        id: '\\ce{\\bond{->}}',
        label: '\\ce{\\bond{->}}',
        type: 'write',
        val: '\\ce{\\bond{->}}',
        shortcut: ['toggle', 'rgb'],
        title: 'Right arrow bond'
    },
    {
        id: '\\ce{\\bond{<-}}',
        label: '\\ce{\\bond{<-}}',
        type: 'write',
        val: '\\ce{\\bond{<-}}',
        shortcut: ['toggle', 'lfb'],
        title: 'Left arrow bond'
    },
    {
        id: '\\xrightarrow',
        label: '\\xrightarrow[y]{x}',
        type: 'write',
        val: '\\xrightarrow[]{}',
        shortcut: ['toggle', 'xra'],
        title: 'Arrow with superscript and subscript'
    },
    {
        id: '\\lfloor',
        label: '\\lfloor',
        type: 'write',
        val: '\\lfloor',
        title: 'Left floor'
    },
    {
        id: '\\rfloor',
        label: '\\rfloor',
        type: 'write',
        val: '\\rfloor',
        title: 'Right floor'
    },
    {
        id: '\\lceil',
        label: '\\lceil',
        type: 'write',
        val: '\\lceil',
        title: 'Left ceiling'
    },
    {
        id: '\\rceil',
        label: '\\rceil',
        type: 'write',
        val: '\\rceil',
        title: 'Right ceiling'
    },
    {
        id: '\\uparrow',
        label: '\\uparrow',
        type: 'write',
        val: '\\uparrow',
        title: 'Up arrow'
    },
    {
        id: '\\equiv',
        label: '\\equiv',
        type: 'write',
        val: '\\equiv',
        title: 'Equivalence'
    },
    {
        id: '\\and',
        label: '\\and',
        type: 'write',
        val: '\\and',
        title: 'And'
    },
    {
        id: '\\not',
        label: '\\not',
        type: 'write',
        val: '\\not',
        title: 'Not'
    },
    {
        id: '\\or',
        label: '\\or',
        type: 'write',
        val: '\\or',
        title: 'Or'
    },
    {
        id: '\\exist',
        label: '\\exist',
        type: 'write',
        val: '\\exist',
        title: 'Exist'
    },
    {
        id: '\\exists',
        label: '\\exists',
        type: 'write',
        val: '\\exists',
        title: 'Exists'
    },
    {
        id: '\\forall',
        label: '\\forall',
        type: 'write',
        val: '\\forall',
        title: 'Forall'
    },
    {
        id: '\\oplus',
        label: '\\oplus',
        type: 'write',
        val: '\\oplus',
        title: 'Circled plus'
    },

    {
        id: 'a_lowercase',
        label: 'a',
        type: 'write',
        val: 'a',
        shortcut: ['a'],
        title: 'a',
        label_latex: true
    },
    {
        id: 'b_lowercase',
        label: 'b',
        type: 'write',
        val: 'b',
        shortcut: ['b'],
        title: 'b',
        label_latex: true
    },
    {
        id: 'c_lowercase',
        label: 'c',
        type: 'write',
        val: 'c',
        shortcut: ['c'],
        title: 'c',
        label_latex: true
    },
    {
        id: 'd_lowercase',
        label: 'd',
        type: 'write',
        val: 'd',
        shortcut: ['d'],
        title: 'd',
        label_latex: true
    },
    {
        id: 'e_lowercase',
        label: 'e',
        type: 'write',
        val: 'e',
        shortcut: ['e'],
        title: 'e',
        label_latex: true
    },
    {
        id: 'f_lowercase',
        label: 'f',
        type: 'write',
        val: 'f',
        shortcut: ['f'],
        title: 'f',
        label_latex: true
    },
    {
        id: 'g_lowercase',
        label: 'g',
        type: 'write',
        val: 'g',
        shortcut: ['g'],
        title: 'g',
        label_latex: true
    },
    {
        id: 'h_lowercase',
        label: 'h',
        type: 'write',
        val: 'h',
        shortcut: ['h'],
        title: 'h',
        label_latex: true
    },
    {
        id: 'i_lowercase',
        label: 'i',
        type: 'write',
        val: 'i',
        shortcut: ['i'],
        title: 'i',
        label_latex: true
    },
    {
        id: 'j_lowercase',
        label: 'j',
        type: 'write',
        val: 'j',
        shortcut: ['j'],
        title: 'j',
        label_latex: true
    },
    {
        id: 'k_lowercase',
        label: 'k',
        type: 'write',
        val: 'k',
        shortcut: ['k'],
        title: 'k',
        label_latex: true
    },
    {
        id: 'l_lowercase',
        label: 'l',
        type: 'write',
        val: 'l',
        shortcut: ['l'],
        title: 'l',
        label_latex: true
    },
    {
        id: 'm_lowercase',
        label: 'm',
        type: 'write',
        val: 'm',
        shortcut: ['m'],
        title: 'm',
        label_latex: true
    },
    {
        id: 'n_lowercase',
        label: 'n',
        type: 'write',
        val: 'n',
        shortcut: ['n'],
        title: 'n',
        label_latex: true
    },
    {
        id: 'o_lowercase',
        label: 'o',
        type: 'write',
        val: 'o',
        shortcut: ['o'],
        title: 'o',
        label_latex: true
    },
    {
        id: 'p_lowercase',
        label: 'p',
        type: 'write',
        val: 'p',
        shortcut: ['p'],
        title: 'p',
        label_latex: true
    },
    {
        id: 'q_lowercase',
        label: 'q',
        type: 'write',
        val: 'q',
        shortcut: ['q'],
        title: 'q',
        label_latex: true
    },
    {
        id: 'r_lowercase',
        label: 'r',
        type: 'write',
        val: 'r',
        shortcut: ['r'],
        title: 'r',
        label_latex: true
    },
    {
        id: 's_lowercase',
        label: 's',
        type: 'write',
        val: 's',
        shortcut: ['s'],
        title: 's',
        label_latex: true
    },
    {
        id: 't_lowercase',
        label: 't',
        type: 'write',
        val: 't',
        shortcut: ['t'],
        title: 't',
        label_latex: true
    },
    {
        id: 'u_lowercase',
        label: 'u',
        type: 'write',
        val: 'u',
        shortcut: ['u'],
        title: 'u',
        label_latex: true
    },
    {
        id: 'v_lowercase',
        label: 'v',
        type: 'write',
        val: 'v',
        shortcut: ['v'],
        title: 'v',
        label_latex: true
    },
    {
        id: 'w_lowercase',
        label: 'w',
        type: 'write',
        val: 'w',
        shortcut: ['w'],
        title: 'w',
        label_latex: true
    },
    {
        id: 'x_lowercase',
        label: 'x',
        type: 'write',
        val: 'x',
        shortcut: ['x'],
        title: 'x',
        label_latex: true
    },
    {
        id: 'y_lowercase',
        label: 'y',
        type: 'write',
        val: 'y',
        shortcut: ['y'],
        title: 'y',
        label_latex: true
    },
    {
        id: 'z_lowercase',
        label: 'z',
        type: 'write',
        val: 'z',
        shortcut: ['z'],
        title: 'z',
        label_latex: true
    },
    {
        id: 'A_uppercase',
        label: 'A',
        type: 'write',
        val: 'A',
        shortcut: ['A'],
        title: 'A',
        label_latex: true
    },
    {
        id: 'B_uppercase',
        label: 'B',
        type: 'write',
        val: 'B',
        shortcut: ['B'],
        title: 'B',
        label_latex: true
    },
    {
        id: 'C_uppercase',
        label: 'C',
        type: 'write',
        val: 'C',
        shortcut: ['C'],
        title: 'C',
        label_latex: true
    },
    {
        id: 'D_uppercase',
        label: 'D',
        type: 'write',
        val: 'D',
        shortcut: ['D'],
        title: 'D',
        label_latex: true
    },
    {
        id: 'E_uppercase',
        label: 'E',
        type: 'write',
        val: 'E',
        shortcut: ['E'],
        title: 'E',
        label_latex: true
    },
    {
        id: 'F_uppercase',
        label: 'F',
        type: 'write',
        val: 'F',
        shortcut: ['F'],
        title: 'F',
        label_latex: true
    },
    {
        id: 'G_uppercase',
        label: 'G',
        type: 'write',
        val: 'G',
        shortcut: ['G'],
        title: 'G',
        label_latex: true
    },
    {
        id: 'H_uppercase',
        label: 'H',
        type: 'write',
        val: 'H',
        shortcut: ['H'],
        title: 'H',
        label_latex: true
    },
    {
        id: 'I_uppercase',
        label: 'I',
        type: 'write',
        val: 'I',
        shortcut: ['I'],
        title: 'I',
        label_latex: true
    },
    {
        id: 'J_uppercase',
        label: 'J',
        type: 'write',
        val: 'J',
        shortcut: ['J'],
        title: 'J',
        label_latex: true
    },
    {
        id: 'K_uppercase',
        label: 'K',
        type: 'write',
        val: 'K',
        shortcut: ['K'],
        title: 'K',
        label_latex: true
    },
    {
        id: 'L_uppercase',
        label: 'L',
        type: 'write',
        val: 'L',
        shortcut: ['L'],
        title: 'L',
        label_latex: true
    },
    {
        id: 'M_uppercase',
        label: 'M',
        type: 'write',
        val: 'M',
        shortcut: ['M'],
        title: 'M',
        label_latex: true
    },
    {
        id: 'N_uppercase',
        label: 'N',
        type: 'write',
        val: 'N',
        shortcut: ['N'],
        title: 'N',
        label_latex: true
    },
    {
        id: 'O_uppercase',
        label: 'O',
        type: 'write',
        val: 'O',
        shortcut: ['O'],
        title: 'O',
        label_latex: true
    },
    {
        id: 'P_uppercase',
        label: 'P',
        type: 'write',
        val: 'P',
        shortcut: ['P'],
        title: 'P',
        label_latex: true
    },
    {
        id: 'Q_uppercase',
        label: 'Q',
        type: 'write',
        val: 'Q',
        shortcut: ['Q'],
        title: 'Q',
        label_latex: true
    },
    {
        id: 'R_uppercase',
        label: 'R',
        type: 'write',
        val: 'R',
        shortcut: ['R'],
        title: 'R',
        label_latex: true
    },
    {
        id: 'S_uppercase',
        label: 'S',
        type: 'write',
        val: 'S',
        shortcut: ['S'],
        title: 'S',
        label_latex: true
    },
    {
        id: 'T_uppercase',
        label: 'T',
        type: 'write',
        val: 'T',
        shortcut: ['T'],
        title: 'T',
        label_latex: true
    },
    {
        id: 'U_uppercase',
        label: 'U',
        type: 'write',
        val: 'U',
        shortcut: ['U'],
        title: 'U',
        label_latex: true
    },
    {
        id: 'V_uppercase',
        label: 'V',
        type: 'write',
        val: 'V',
        shortcut: ['V'],
        title: 'V',
        label_latex: true
    },
    {
        id: 'W_uppercase',
        label: 'W',
        type: 'write',
        val: 'W',
        shortcut: ['W'],
        title: 'W',
        label_latex: true
    },
    {
        id: 'X_uppercase',
        label: 'X',
        type: 'write',
        val: 'X',
        shortcut: ['X'],
        title: 'X',
        label_latex: true
    },
    {
        id: 'Y_uppercase',
        label: 'Y',
        type: 'write',
        val: 'Y',
        shortcut: ['Y'],
        title: 'Y',
        label_latex: true
    },
    {
        id: 'Z_uppercase',
        label: 'Z',
        type: 'write',
        val: 'Z',
        shortcut: ['Z'],
        title: 'Z',
        label_latex: true
    },

    {
        id: '7',
        label: '7',
        type: 'write',
        val: '7',
        shortcut: ['7'],
        title: 'Seven',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: '8',
        label: '8',
        type: 'write',
        val: '8',
        shortcut: ['8'],
        title: 'Eight',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: '9',
        label: '9',
        type: 'write',
        val: '9',
        shortcut: ['9'],
        title: 'Nine',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: '÷',
        label: '÷',
        type: 'write',
        val: '÷',
        shortcut: ['÷'],
        title: 'Divided by',
        style: 'lrn-btn-grid-operator',
        numberpad_symbol: true
    },

    {
        id: '4',
        label: '4',
        type: 'write',
        val: '4',
        shortcut: ['4'],
        title: 'Four',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: '5',
        label: '5',
        type: 'write',
        val: '5',
        shortcut: ['5'],
        title: 'Five',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: '6',
        label: '6',
        type: 'write',
        val: '6',
        shortcut: ['6'],
        title: 'Six',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: 'multiply',
        label: '×',
        type: 'write',
        val: '×',
        shortcut: ['×'],
        title: 'Multiplied by',
        style: 'lrn-btn-grid-operator',
        numberpad_symbol: true
    },

    {
        id: '1',
        label: '1',
        type: 'write',
        val: '1',
        shortcut: ['1'],
        title: 'One',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: '2',
        label: '2',
        type: 'write',
        val: '2',
        shortcut: ['2'],
        title: 'Two',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: '3',
        label: '3',
        type: 'write',
        val: '3',
        shortcut: ['3'],
        title: 'Three',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: 'minus',
        label: '-',
        type: 'write',
        val: '-',
        shortcut: ['-'],
        title: 'Minus',
        style: 'lrn-btn-grid-operator',
        numberpad_symbol: true
    },

    {
        id: '0',
        label: '0',
        type: 'write',
        val: '0',
        shortcut: ['0'],
        title: 'Zero',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: 'decimal',
        label: '.',
        type: 'write',
        val: '.',
        shortcut: ['.'],
        title: 'Decimal',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: 'comma',
        label: ',',
        type: 'write',
        val: ',',
        shortcut: [','],
        title: 'Comma',
        style: 'lrn-btn-grid-num',
        numberpad_symbol: true
    },
    {
        id: 'plus',
        label: '+',
        type: 'write',
        val: '+',
        shortcut: ['+'],
        title: 'Plus',
        style: 'lrn-btn-grid-operator',
        numberpad_symbol: true
    },

    {
        id: 'left',
        label: '<',
        type: 'keystroke',
        val: 'Left',
        shortcut: [],
        title: 'Left',
        style: 'lrn-btn-grid-dir',
        numberpad_symbol: true,
        key_style: 'lrn_arrow_left'
    },
    {
        id: 'right',
        label: '>',
        type: 'keystroke',
        val: 'Right',
        shortcut: [],
        title: 'Right',
        style: 'lrn-btn-grid-dir',
        numberpad_symbol: true,
        key_style: 'lrn_arrow_right'
    },
    {
        id: 'backspace',
        label: 'Backspace',
        type: 'keystroke',
        val: 'Backspace',
        shortcut: [],
        title: 'Backspace',
        style: 'lrn-btn-grid-dir',
        numberpad_symbol: true,
        key_style: 'lrn_backspace'
    },
    {
        id: '=',
        label: '=',
        type: 'write',
        val: '=',
        shortcut: ['='],
        title: 'Equals',
        style: 'lrn-btn-grid-operator',
        numberpad_symbol: true
    }
];

var defaultInputUiSymbols = {
    qwerty: {
        title: 'Keyboard',
        label: '&#9000;',
        render_latex: false
    },
    basic: {
        title: 'Basic',
        label: '\\text{Basic}',
        value: [
            'x',
            'y',
            '^2',
            '\\sqrt',
            '\\frac',
            'x\\frac{}{}',
            '^',
            '_',
            '<',
            '>',
            '\\pm',
            '\\$',
            '%',
            '\\degree',
            ':',
            '\\left(\\right)',
            '\\abs',
            '\\pi',
            '\\infty'
        ]
    },
    basic_junior: {
        title: 'Basic Junior',
        label: '=',
        value: ['<', '>', '', '', '\\frac', 'x\\frac{}{}']
    },
    algebra: {
        title: 'Algebra',
        label: 'x',
        value: [
            'x',
            'y',
            '^2',
            '\\sqrt',
            '\\frac',
            'x\\frac{}{}',
            '^',
            '\\sqrt[n]{}',
            '<',
            '>',
            '\\pm',
            '\\abs',
            '\\pi',
            '\\infty',
            '\\left(\\right)',
            '\\left[\\right]'
        ]
    },
    comparison: {
        title: 'Comparison',
        label: '<',
        value: ['\\ne', '\\approx', '', '', '<', '>', '', '', '\\le', '\\ge']
    },
    geometry: {
        title: 'Geometry',
        label: '\\angle',
        value: [
            '\\perp',
            '\\parallel',
            '\\nparallel',
            '\\underset{\\sim}{\\mathbf{}}',
            '\\angle',
            '\\measuredangle',
            '\\sim',
            '\\cong',
            '\\triangle',
            '\\circledot',
            '\\parallelogram',
            '',
            '\\degree',
            '\'',
            '"',
            '\\pi',
            '\\overline',
            '\\overrightarrow',
            '\\overleftrightarrow',
            '\\square'
        ]
    },
    matrices: {
        title: 'Matrices',
        label: '\\begin{bmatrix}&\\\\&\\end{bmatrix}',
        value: [
            '\\ldots',
            '\\singlebmatrix',
            '║',
            '═',
            '\\ddots',
            '\\bmatrix',
            '',
            '',
            '\\vdots',
            '\\threebmatrix',
            '',
            '',
            '^',
            '',
            '',
            '',
            '_'
        ]
    },
    trigonometry: {
        title: 'Trigonometry',
        label: '\\sin',
        value: [
            '\\sin',
            '\\sec',
            '\\sin^{-1}',
            '\\sec^{-1}',
            '\\cos',
            '\\csc',
            '\\cos^{-1}',
            '\\csc^{-1}',
            '\\tan',
            '\\cot',
            '\\tan^{-1}',
            '\\cot^{-1}'
        ]
    },
    sets: {
        title: 'Sets',
        label: '\\intersection',
        value: [
            '\\subset',
            '\\supset',
            '\\subseteq',
            '\\supseteq',
            '\\in',
            '\\notin',
            '\\ni',
            '\\not\\subset',
            '\\cup',
            '\\cap',
            '\\emptyset',
            '',
            ',',
            ':',
            '!',
            '\\backslash',
            '\\left(\\right)',
            '\\left\\{\\right\\}',
            '\\left[\\right)',
            '\\left(\\right]'
        ]
    },
    units_si: {
        title: 'Units (SI)',
        label: '\\text{kg}',
        value: ['g', 'kg', 'mg', 'µg', 'm', 'km', 'cm', 'mm', 'L', 'mL', '', '', 's', 'ms']
    },
    units_us: {
        title: 'Units (US Customary)',
        label: '\\text{lb}',
        value: ['oz', 'lb', '', '', 'in', 'ft', 'mi', '', 'fl', 'pt', 'gal']
    },
    greek: {
        title: 'Greek letters',
        label: '\\alpha',
        value: [
            '\\alpha',
            '\\gamma',
            '\\delta',
            '\\pi',
            '\\theta',
            '\\sigma',
            '\\Delta',
            '\\Pi',
            '\\Theta',
            '\\Sigma',
            '\\lambda',
            '\\phi',
            '\\tau',
            '\\varepsilon',
            '\\beta'
        ]
    },
    chemistry: {
        title: 'Chemistry',
        label: '\\text{Chem}',
        value: [
            'chem^',
            'chem_',
            '\\atomic',
            '\\polyatomic',
            '\\rightarrow',
            '\\leftarrow',
            '\\rightleftharpoons',
            '\\longleftrightarrow',
            '\\xrightarrow',
            'mol',
            '\'',
            '\\overset{}^{H}',
            '\\text{g}\\ \\text{mol}^{-1}'
        ]
    },
    grouping: {
        title: 'Grouping Symbols',
        label: '\\left(\\right)',
        value: ['\\left(\\right)', '\\left[\\right]', '\\left\\{\\right\\}']
    },
    calculus: {
        title: 'Calculus',
        label: '\\Delta',
        value: [
            'd',
            'f',
            '\\int',
            '\\Delta',
            '\\prime',
            '\\frac',
            '\\left(\\right)',
            '\\lim',
            '\\int_{}^{}'
        ]
    },
    misc: {
        title: 'Miscellaneous',
        label: '\\text{Misc}',
        value: ['a', 'b', '\\propto', 'abc', '\\mid', '\\cdot', '\\longdiv', '\\mathbb{R}']
    },
    discrete: {
        title: 'Discrete',
        label: '\\text{Discrete}',
        value: [
            '\\lfloor',
            '\\rfloor',
            '\\lceil',
            '\\rceil',
            '\\uparrow',
            '\\equiv',
            '\\and',
            '\\or',
            '\\not',
            '\\exist',
            '\\forall',
            '\\oplus'
        ]
    },

    // DEPRECATED
    // THIS GROUP IS RENAMED TO BASIC, AND SHOULD BE REMOVED,
    // KEPT ONLY BECAUSE OF BACKWARDS COMPATIBILITY
    general: {
        title: 'General',
        label: 'x',
        value: [
            'x',
            'y',
            '^2',
            '^',
            '_',
            '\\pm',
            '\\frac',
            'x\\frac{}{}',
            '\\sqrt',
            '\\sqrt[3]{}',
            '\\sqrt[n]{}',
            '%',
            '\\abs',
            '\\therefore',
            '\\infty',
            ':'
        ]
    }
};

function getKeypadSymbols(curatedSymbols) {
    var keypadSymbols = [];

    _.each(curatedSymbols, function (symbol) {
        if (!_.has(symbol, 'numberpad_symbol')) {
            keypadSymbols.push(symbol);
        }
    });
    return keypadSymbols;
}

function getNumberpadSymbols(curatedSymbols) {
    var numberpadSymbols = [];

    _.each(curatedSymbols, function (symbol) {
        if (_.has(symbol, 'numberpad_symbol') || _.has(symbol, 'numberpad_and_keypad')) {
            numberpadSymbols.push(symbol);
        }
    });

    return numberpadSymbols;
}

export default {
    supportedSymbols: getKeypadSymbols(curatedSymbols),
    defaultSymbolGroups: defaultInputUiSymbols,
    numberPadSymbols: getNumberpadSymbols(curatedSymbols)
};
