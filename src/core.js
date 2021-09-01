/*
 * Copyright 2021 ARTCOMPILER INC. All Rights Reserved.
 *
 */
import {version} from "./version.js";
import {every, forEach, keys, indexOf} from "./backward.js";
import {Assert, assert, message} from "./assert.js";
import {Ast} from "./ast.js";
import {Parser} from "@artcompiler/parselatex";
import {rules} from "./rules.js";

(function (ast) {

  let messages = Assert.messages;

  function newNode(op, args) {
    return {
      op: op,
      args: args
    };
  }

  function binaryNode(op, args, flatten) {
    if (args.length < 2) {
      return args[0];
    }
    var aa = [];
    forEach(args, function(n) {
      if (flatten && n.op === op) {
        aa = aa.concat(n.args);
      } else {
        aa.push(n);
      }
    });
    return newNode(op, aa);
  }

  // The outer Visitor function provides a global scope for all visitors,
  // as well as dispatching to methods within a visitor.
  function Visitor(ast) {
    function visit(options, node, visit, resume) {
      assert(node.op && node.args, "Visitor.visit() op=" + node.op + " args = " + node.args);
      switch (node.op) {
      case Parser.NUM:
        node = visit.numeric(node, resume);
        break;
      case Parser.ADD:
      case Parser.SUB:
      case Parser.PM:
      case Parser.BACKSLASH: // set operator
      case Parser.DIV:
      case Parser.FRAC:
      case Parser.LOG:
      case Parser.COLON:
      case Parser.FUNC:
      case Parser.TYPE:
        if (node.args.length === 1) {
          node = visit.unary(node, resume);
        } else {
          node = visit.binary(node, resume);
        }
        break;
      case Parser.MUL:
      case Parser.TIMES:
      case Parser.COEFF:
      case Parser.CDOT:
        node = visit.multiplicative(node, resume);
        break;
      case Parser.POW:
        node = visit.exponential(node, resume);
        break;
      case Parser.VAR:
        node = visit.variable(node, resume);
        break;
      case Parser.SQRT:
      case Parser.SIN:
      case Parser.COS:
      case Parser.TAN:
      case Parser.SEC:
      case Parser.CSC:
      case Parser.COT:
      case Parser.ARCSIN:
      case Parser.ARCCOS:
      case Parser.ARCTAN:
      case Parser.ARCSEC:
      case Parser.ARCCSC:
      case Parser.ARCCOT:
      case Parser.SINH:
      case Parser.COSH:
      case Parser.TANH:
      case Parser.ARCSINH:
      case Parser.ARCCOSH:
      case Parser.ARCTANH:
      case Parser.ARCSECH:
      case Parser.ARCCSCH:
      case Parser.ARCCOTH:
      case Parser.SECH:
      case Parser.CSCH:
      case Parser.COTH:
      case Parser.PERCENT:
      case Parser.M:
      case Parser.ABS:
      case Parser.FACT:
      case Parser.FORALL:
      case Parser.EXISTS:
      case Parser.IN:
      case Parser.SUM:
      case Parser.LIM:
      case Parser.EXP:
      case Parser.TO:
      case Parser.DERIV:
      case Parser.INTEGRAL:
      case Parser.PROD:
      case Parser.CUP:
      case Parser.BIGCUP:
      case Parser.CAP:
      case Parser.BIGCAP:
      case Parser.PIPE:
      case Parser.ION:
      case Parser.POW:
      case Parser.SUBSCRIPT:
      case Parser.OVERLINE:
      case Parser.OVERSET:
      case Parser.UNDERSET:
      case Parser.MATHBF:
      case Parser.TEXT:
      case Parser.NONE:
      case Parser.DEGREE:
      case Parser.DOT:
      case Parser.MATHFIELD:
      case Parser.SET:
      case Parser.NOT:
      case Parser.OPERATORNAME:
        node = visit.unary(node, resume);
        break;
      case Parser.COMMA:
      case Parser.MATRIX:
      case Parser.VEC:
      case Parser.ROW:
      case Parser.COL:
      case Parser.LIST:
      case Parser.ANGLEBRACKET:
        node = visit.comma(node, resume);
        break;
      case Parser.EQL:
      case Parser.LT:
      case Parser.LE:
      case Parser.GT:
      case Parser.GE:
      case Parser.NE:
      case Parser.NGTR:
      case Parser.NLESS:
      case Parser.NI:
      case Parser.SUBSETEQ:
      case Parser.SUPSETEQ:
      case Parser.SUBSET:
      case Parser.SUPSET:
      case Parser.NNI:
      case Parser.NSUBSETEQ:
      case Parser.NSUPSETEQ:
      case Parser.NSUBSET:
      case Parser.NSUPSET:
      case Parser.APPROX:
      case Parser.IMPLIES:
      case Parser.PERP:
      case Parser.PROPTO:
      case Parser.PARALLEL:
      case Parser.NPARALLEL:
      case Parser.SIM:
      case Parser.CONG:
      case Parser.CAPRIGHTARROW:
      case Parser.RIGHTARROW:
      case Parser.LEFTARROW:
      case Parser.LONGRIGHTARROW:
      case Parser.LONGLEFTARROW:
      case Parser.OVERRIGHTARROW:
      case Parser.OVERLEFTARROW:
      case Parser.CAPLEFTRIGHTARROW:
      case Parser.LEFTRIGHTARROW:
      case Parser.LONGLEFTRIGHTARROW:
      case Parser.OVERLEFTRIGHTARROW:
        node = visit.equals(node, resume);
        break;
      case Parser.PAREN:
      case Parser.BRACKET:
      case Parser.BRACE:
      case Parser.INTERVAL:
      case Parser.INTERVALOPEN:
      case Parser.INTERVALLEFTOPEN:
      case Parser.INTERVALRIGHTOPEN:
        node = visit.paren(node);
        break;
      default:
        if (visit.name !== "normalizeLiteral" &&
            visit.name !== "sort") {
          node = newNode(Parser.VAR, ["INTERNAL ERROR Should not get here. Unhandled node operator " + node.op]);
          console.trace(JSON.stringify(node, null, 2));
        }
        break;
      }
      return node;
    }
    function lookup(options, word) {
      if (!word) {
        return "";
      }
      let words = Parser.option(options, "words");
      let val;
      if (words) {
        val = words[word];
      }
      if (!val) {
        val = word;
        if (val.charAt(0) === "\\") {
          val = val.substring(1);
        }
      }
      return val;
    }
    function normalizeFormatObject(fmt) {
      // Normalize the fmt object to an array of objects
      var list = [];
      switch (fmt.op) {
      case Parser.VAR:
        list.push({
          code: fmt.args[0]
        });
        break;
      case Parser.MUL:
        var code = "";
        var length = undefined;  // undefined and zero have different meanings.
        forEach(fmt.args, function (f) {
          if (f.op === Parser.VAR) {
            code += f.args[0];
          } else if (f.op === Parser.NUM) {
            length = +f.args[0];
          }
        });
        list.push({
          code: code,
          length: length
        });
        break;
      case Parser.COMMA:
        forEach(fmt.args, function (f) {
          list = list.concat(normalizeFormatObject(f));
        });
        break;
      }
      return list;
    }
    function parseFormatPattern(pattern) {
      // Normalize the fmt object to an array of objects
      let [name, arg] = pattern.split("[");
      return {
        name: name,
        arg: arg && arg.substring(0, arg.indexOf("]")) || undefined,
      }
    }
    function checkNumberType(fmt, node) {
      var fmtList = normalizeFormatObject(fmt);
      return fmtList.some(function (f) {
        var code = f.code;
        var length = f.length;
        switch (code) {
        case "integer":
          if (node.numberFormat === "integer") {
            if (length === undefined || length === node.args[0].length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "decimal":
          if (node.numberFormat === "decimal" &&
              node.isRepeating) {
            if (length === undefined) {
              return true;
            } else {
              // Repeating is infinite.
              return false;
            }
          }
          if (node.numberFormat === "decimal") {
            if (length === undefined ||
                length === 0 && indexOf(node.args[0], ".") === -1 ||
                length === node.args[0].substring(indexOf(node.args[0], ".") + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "repeatingDecimal":
          if (node.numberFormat === "decimal" &&
              node.isRepeating) {
            assert(!length, "The repeatingDecimal pattern does not take a length");
            return true;
          }
          return false;
        case "number":
          if (node.numberFormat === "decimal" &&
              node.isRepeating) {
            if (length === undefined) {
              return true;
            } else {
              // Repeating is infinite.
              return false;
            }
          }
          if (node.numberFormat === "integer" ||
              node.numberFormat === "decimal") {
            var brk = indexOf(node.args[0], ".");
            if (length === undefined ||
                length === 0 && brk === -1 ||
                brk >= 0 && length === node.args[0].substring(brk + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "scientific":
          if (node.isScientific) {
            var coeff = node.args[0].args[0];
            if (length === undefined ||
                length === 0 && indexOf(coeff, ".") === -1 ||
                length === coeff.substring(indexOf(coeff, ".") + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "fraction":
          if (node.isFraction ||
              node.isMixedNumber) {
            return true;
          }
          break;
        case "simpleFraction":
        case "nonMixedFraction": // deprecated
          if (node.isFraction) {
            return true;
          }
          break;
        case "mixedFraction":  // deprecated
        case "mixedNumber":
          if (node.isMixedNumber) {
            return true;
          }
          break;
        case "fractionOrDecimal":
          if (node.isFraction ||
              node.isMixedNumber ||
              node.numberFormat === "decimal") {
            return true;
          }
          break;
        default:
          assert(false, message(2015, [code]));
          break;
        }
      });
    }
    function checkMatrixType(fmt, node) {
      var fmtList = normalizeFormatObject(fmt);
      return fmtList.some(function (f) {
        var code = f.code;
        var length = f.length;
        switch (code) {
        case "simpleSmallRowMatrix":
        case "smallRowMatrix":
          return node.op === Parser.MATRIX && node.m === 1 && node.n < 4;
        case "simpleSmallColumnMatrix":
        case "smallColumnMatrix":
          return node.op === Parser.MATRIX && node.m < 4 && node.n === 1;
        case "simpleSmallMatrix":
        case "smallMatrix":
          return node.op === Parser.MATRIX && node.m < 4 && node.n < 4;
        case "matrix":
          return node.op === Parser.MATRIX;
        case "row":
          return node.op === Parser.ROW;
        case "column":
          return node.op === Parser.COL;
        default:
          return false;
        }
      });
    }
    function checkPolynomialType(pattern, node) {
      var fmt = parseFormatPattern(pattern);
      var name = fmt.name;
      var arg = fmt.arg;
      switch (name) {
      case "polynomial":
        if (arg) {
          if (arg.indexOf(">") === 0) {
            let n = parseInt(arg.substring(1));
            return node.isPolynomial > n;
          } else {
            let n = parseInt(arg);
            return node.isPolynomial > n;
          }
        }
        return node.isPolynomial;
      default:
        return false;
      }
    }
    function isSimpleExpression(node) {
      if (node.op === Parser.NUM ||
          node.op === Parser.VAR ||
          typeof node === "string") {
        return true;
      }
      return false;
    }
    function hasSimpleExpressions(node) {
      assert(node.op === Parser.MATRIX || node.op === Parser.ROW || node.op === Parser.COL);
      return every(node.args, n => {
        if (n.op === Parser.MATRIX || n.op === Parser.ROW || n.op === Parser.COL) {
          return hasSimpleExpressions(n);
        }
        return isSimpleExpression(n);
      });
    }
    function matchType(options, pattern, node) {
      if (pattern.op === Parser.TYPE &&
          pattern.args[0].op === Parser.VAR) {
        let name = pattern.args[0].args[0];
        name = name.indexOf("[") > 0 && name.slice(0, name.indexOf("[")) || name;
        switch (name) {
        case "number":
        case "integer":
        case "decimal":
        case "scientific":
        case "fraction":
        case "simpleFraction":
        case "mixedFraction":  // deprecated
        case "mixedNumber":
        case "fractionOrDecimal":
        case "repeatingDecimal":
          return checkNumberType(pattern.args[0], node);
        case "variable":
          return node.op === Parser.VAR;
        case "simpleSmallRowMatrix":
        case "simpleSmallColumnMatrix":
        case "simpleSmallMatrix":
          return checkMatrixType(pattern.args[0], node) && hasSimpleExpressions(node);
        case "smallRowMatrix":
        case "smallColumnMatrix":
        case "smallMatrix":
        case "matrix":
        case "row":
        case "column":
          return checkMatrixType(pattern.args[0], node);
        case "polynomial":
          return checkPolynomialType(pattern.args[0].args[0], node);
        default:
          let types = Parser.option(options, "types");
          let type = types[name];
          if (type) {
            assert(type instanceof Array);
            return type.some(function (pattern) {
              // FIXME pre-compile types.
              let matches = match(options, [Parser.create(options, pattern)], node);
              return matches.length > 0;
            });
          }
        }
        return false;
      } else if (pattern.op === Parser.COLON &&
          pattern.args[0].op === Parser.VAR && pattern.args[0].args[0] === "?") {
        // This is a legacy case that can be removed when all content is updated.
        assert(pattern.args[1].op === Parser.VAR);
        switch (pattern.args[1].args[0]) {
        case "N":
          return node.op === Parser.NUM;
        case "V":
          return node.op === Parser.VAR;
        default:
        }
        return false;
      }
      return (
        pattern.op === Parser.VAR && pattern.args[0] === "?" ||
        pattern.op === Parser.MATRIX && node.op === Parser.MATRIX
      );
    }

    // ["? + ?", "? - ?"], "1 + 2"
    function match(options, patterns, node) {
      if (patterns.size === 0 || node === undefined) {
        return false;
      }
      let matches = patterns.filter(function (pattern) {
        if (pattern.op === undefined || node.op === undefined) {
          return false;
        }
        if (ast.intern(pattern) === ast.intern(node) ||
            matchType(options, pattern, node)) {
          return true;
        }
        if (pattern.op === node.op) {
          if (pattern.args.length === node.args.length) {
            // Same number of args, so see if each matches.
            return pattern.args.every(function (arg, i) {
              if (pattern.op === Parser.VAR) {
                if (arg === node.args[i]) {
                  return true;
                }
                return false;
              }
              let result = match(options, [arg], node.args[i]);
              return result.length === 1;
            });
          } else if (pattern.args.length < node.args.length) {
            // Different number of args, then see if there is a wildcard match.
            let nargs = node.args.slice(1);
            if (pattern.args.length === 2) {
              // Binary node pattern
              let result = (
                match(options, [pattern.args[0]], node.args[0]).length > 0 &&
                match(options, [pattern.args[1]], newNode(node.op, nargs)).length > 0
                  // Match rest of the node against the second pattern argument.
              );
              return result;
            }
          }
        }
        return false;
      });
      // if (matches.length > 0) {
      //   console.log("match() node: " + JSON.stringify(node, null, 2));
      //   console.log("match() matches: " + JSON.stringify(matches, null, 2));
      // }
      return matches;
    }
    function expandBinary(str, args) {
      let t = str;
      forEach(args, function (arg, i) {
        str = str.replace(new RegExp("%" + (i + 1), "g"), arg.args[0]);
      });
      if (args.length > 2) {
        return expandBinary(t, [newNode(Parser.VAR, [str])].concat(args.slice(2)));
      }
      return str;
    }
    function expand(template, args, env) {
      env = env || {};
      // Use first matched template for now.
      let str = template.str;
      if (str && args) {
        let count = str.split("%").length - 1;
        if (str.indexOf("%%") >= 0) {
          str = str.replace(new RegExp("%%", "g"), args[0].args[0]);
        }
        if (str.indexOf("%*") >= 0) {
          let s = "";
          forEach(args, function (arg, i) {
            if (s !== "") {
              s += " ";
            }
            // Replicate template for each argument.
            if (i === args.length - 1) {
              // If this is the last element in the sequence, lop off the
              // trailing separator. Times two because what comes before the
              // "%*", if anything, is a bracket so need to include the close
              // bracket.
              str = str.slice(0, 2 * str.indexOf("%*") + "%*".length);
            }
            s += str.replace("%*", arg.args[0]).replace("%M", arg.m).replace("%N", arg.n);
          });
          str = s;  // Overwrite str.
        }
        if (str.indexOf("%IP") >= 0) {
          str = str.replace(new RegExp("%IP", "g"), env.ip);
        }
        if (str.indexOf("%FP0") >= 0) {
          str = str.replace(new RegExp("%FP0", "g"), env.fp);
        }
        if (str.indexOf("%FP") >= 0) {
          str = str.replace(new RegExp("%FP", "g"), env.fp.split("").join(" "));
        }
        if (str.indexOf("%M") >= 0) {
          assert(env.m);
          str = str.replace(new RegExp("%M", "g"), env.m);
        }
        if (str.indexOf("%N") >= 0) {
          assert(env.n);
          str = str.replace(new RegExp("%N", "g"), env.n);
        }
        if (template.isBinary && args.length > 2) {
          str = expandBinary(str, args);
        } else {
          args.forEach(function (arg, i) {
            str = str.replace(new RegExp("%" + (i + 1), "g"), !arg ? '' : arg.args[0]);
          });
        }
        return {
          op: Parser.VAR,
          args: [str],
        };
      }
      return args[0];
    }
    function isEmpty(node) {
      return node.op === Parser.VAR && node.args.length === 1 && node.args[0] === "";
    }

    function getPrec(op) {
      switch (op) {
      case Parser.OR:
        return 1;
      case Parser.AND:
        return 2;
      case Parser.EQ:
      case Parser.NE:
        return 3;
      case Parser.LT:
      case Parser.GT:
      case Parser.LE:
      case Parser.GE:
      case Parser.NGTR:
      case Parser.NLESS:
      case Parser.NI:
      case Parser.SUBSETEQ:
      case Parser.SUPSETEQ:
      case Parser.SUBSET:
      case Parser.SUPSET:
      case Parser.NNI:
      case Parser.NSUBSETEQ:
      case Parser.NSUPSETEQ:
      case Parser.NSUBSET:
      case Parser.NSUPSET:
        return 4;
      case Parser.ADD:
      case Parser.SUB:
      case Parser.PM:
        return 5;
      case Parser.MUL:
      case Parser.FRAC:
      case Parser.DIV:
      case Parser.MOD:
      case Parser.COLON:
        return 6;
      case Parser.POW:
      case Parser.LOG:
      default:
        return 7;
      }
      assert(false, "ERROR missing precedence for " + op);
    }

    function isLowerPrecedence(n0, n1) {
      // Is n1 lower precedence than n0?
      let p0 = getPrec(n0.op);
      let p1 = getPrec(n1.op);
      return p1 < p0;
    }

    function normalizeLiteral(options, root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = ast.intern(root);
      // if (root.normalizeLiteralNid === nid) {
      //   return root;
      // }
      var node = visit(options, root, {
        numeric: function (node) {
          return node;
        },
        binary: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(options, n));
          });
          node.args = args;
          return node;
        },
        multiplicative: function (node) {
          var args = [];
          var flatten = true;
          forEach(node.args, function (n) {
            if ((n.isPolynomialTerm || n.isImplicit) && args.length > 0) {
              args.push(binaryNode(Parser.MUL, [args.pop(), normalizeLiteral(options, n)], flatten));
            } else {
              args.push(normalizeLiteral(options, n));
            }
          });
          // Only have explicit mul left, so convert to times.
          var op = node.op === Parser.MUL ? Parser.TIMES : node.op;
          var n = binaryNode(op, args, true);
          n.isScientific = node.isScientific;
          n.isMixedNumber = node.isMixedNumber;
          n.isBinomial = node.isBinomial;
          n.isPolynomial = node.isPolynomial;
          n.isPolynomialTerm = node.isPolynomialTerm;
          return n;
        },
        unary: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(options, n));
          });
          let n = newNode(node.op, args);
          n.isPolynomial = node.isPolynomial;
          return n;
        },
        exponential: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(options, n));
          });
          node.args = args;
          return node;
        },
        variable: function(node) {
          return node;
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(options, n));
          });
          let op = node.op === Parser.LIST && Parser.COMMA || node.op;  // Normalize LIST.
          return newNode(op, args);
        },
        paren: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(options, n));
          });
          node.args = args;
          return node;
        },
        equals: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(options, n));
          });
          if (Parser.option(options, "ignoreOrder") &&
              (node.op === Parser.GT ||
               node.op === Parser.GE)) {
            // Swap adjacent elements and reverse the operator.
            assert(args.length === 2, "Internal error: comparisons have only two operands");
            var t = args[0];
            args[0] = args[1];
            args[1] = t;
            node.op = node.op === Parser.GT ? Parser.LT : Parser.LE;
            node.args = args;
          } else {
            node.args = args;
          }
          return node;
        }
      });
      // // If the node has changed, normalizeLiteral again
      // while (nid !== ast.intern(node)) {
      //   nid = ast.intern(node);
      //   node = normalizeLiteral(options, node);
      // }
      // node.normalizeLiteralNid = nid;
      // node.normalizeLiteralNid = ast.intern(node);
      return node;
    }

    function matchedTemplate(options, rules, matches, arity) {
      let templates = [];
      matches.forEach(function (m) {
        templates = templates.concat(rules[JSON.stringify(m)]);
      });
      let matchedTemplates = [];
      templates.forEach(function (template) {
        if((!template.context ||
            Parser.option(options, "NoParens") && template.context.indexOf("NoParens") > -1 ||
            Parser.option(options, "EndRoot") && template.context.indexOf("EndRoot") > -1) &&
           arity >= paramCount(template)) {  // Some args might be elided.
          matchedTemplates.push(template);
        }
      });
      if (matchedTemplates.length === 0) {
        // Make one up.
        matchedTemplates.push({str: ""});
      }
      // Use first match.
      return matchedTemplates[0];
      function paramCount(template) {
        // Parse out the number of params in the template.
        assert(typeof template.str === "string");
        let a = template.str.split("%");
        let nn = a.filter(n => {
          return !isNaN(+n[0]);
        });
        return nn.length === 0 ? 0 : +nn.sort()[nn.length-1][0];
      }
    }
    function getNodeArgsForTemplate(node, template) {
      // Parse out the number of params in the template.
      assert(typeof template.str === "string");
      let str = template.str;
      if (str.indexOf("%%") >= 0) {
        return [node];
      }
      // let a = str.split("%");  // ["..", "1..", "2.."]
      // let nn = a.filter(n => {
      //   // Include '%1', %M, %N
      //   return !isNaN(+n[0]) || n[0] === "M" || n[0] === "N";
      // });
      return node.args;
    }
    function translate(options, root, rules) {
      // Translate math from LaTeX to English.
      // rules = {ptrn: tmpl, ...};
      let globalRules;
      if (rules instanceof Array) {
        if (rules.length === 1) {
          rules = rules[0];
        } else {
          rules = mergeMaps(rules[1], rules[0]);
        }
      }
      globalRules = rules;
      let keys = Object.keys(rules);
      // FIXME when IE supports Map, this can be removed.
      let patterns = [];
      keys.forEach(k => {
        patterns.push(JSON.parse(k));
      });
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(options, root, {
        name: "translate",
        numeric: function(node) {
          let args = [{
            op: Parser.VAR,
            args: [lookup(options, node.args[0])]
          }];
          let env = {};
          if (node.numberFormat === "decimal") {
            let parts = node.args[0].split(".");
            env.ip = parts[0];
            env.fp = parts[1] || "0";  // 7.
          }
          let matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          let template = matchedTemplate(options, rules, matches, 1);
          return expand(template, args, env);
        },
        binary: function(node) {
          let matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          let template = matchedTemplate(options, rules, matches, node.args.length);
          let argRules = getRulesForArgs(template);
          let nodeArgs = getNodeArgsForTemplate(node, template);
          let args = [];
          forEach(nodeArgs, function (n, i) {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          template.isBinary = true;
          return expand(template, args);
        },
        multiplicative: function(node) {
          let matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          let template = matchedTemplate(options, rules, matches, node.args.length);
          let argRules = getRulesForArgs(template, rules);
          let nodeArgs = getNodeArgsForTemplate(node, template);
          let args = [];
          forEach(nodeArgs, function (n, i) {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          template.isBinary = true;
          return expand(template, args);
        },
        unary: function(node) {
          let matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          let template = matchedTemplate(options, rules, matches, node.args.length);
          let argRules = getRulesForArgs(template, rules);
          let nodeArgs = getNodeArgsForTemplate(node, template);
          let args = [];
          forEach(nodeArgs, function (n, i) {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          return expand(template, args);
        },
        exponential: function(node) {
          let matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          let template = matchedTemplate(options, rules, matches, node.args.length);
          let argRules = getRulesForArgs(template, rules);
          let nodeArgs = getNodeArgsForTemplate(node, template);
          let args = [];
          forEach(nodeArgs, function (n, i) {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          return expand(template, args);
        },
        variable: function(node) {
          // let str = "";
          // forEach(node.args, function (n, i) {
          //   // This is a little bit of a hack to handle how subscripts are encoded
          //   // as compound variables.
          //   if (i > 0) {
          //     str += " sub ";
          //     let v = translate(options, n, rules);
          //     str += v.args[0];
          //     str += " baseline ";
          //   } else {
          //     str += lookup(options, n);
          //   }
          // });
          // let matches = match(options, patterns, node);
          // let args = [newNode(Parser.VAR, [str])];
          // if (matches.length === 0) {
          //   return args[0];
          // }
          // // Use first match for now.
          // let template = matchedTemplate(options, rules, matches, 1);
          // return expand(template, args);
          let matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          let template = matchedTemplate(options, rules, matches, node.args.length);
          let argRules = getRulesForArgs(template, rules);
          let nodeArgs = getNodeArgsForTemplate(node, template);
          let args = [];
          args.push(newNode(Parser.VAR, [lookup(options, nodeArgs.shift())]));
          forEach(nodeArgs, function (n, i) {
            // Now translate the subscripts.
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          return expand(template, args);
        },
        comma: function(node) {
          if (node.op === Parser.MATRIX || node.op === Parser.ROW || node.op === Parser.COL) {
            let env = {};
            if (node.op === Parser.MATRIX) {
              assert(node.args[0].op === Parser.ROW);
              assert(node.args[0].args[0].op === Parser.COL);
              node.m = env.m = node.args[0].args.length;
              node.n = env.n = node.args[0].args[0].args.length;
              forEach(node.args, (n, i) => {
                // matrix dimensions
                n.m = i + 1;
              });
            } else if (node.op === Parser.ROW) {
              forEach(node.args, (n, i) => {
                n.m = i + 1;
                n.n = undefined;
              });
            } else {
              forEach(node.args, (n, i) => {
                n.m = node.m;
                n.n = i + 1;
              });
            }
            let matches = match(options, patterns, node);
            if (matches.length === 0) {
              return node;
            }
            // Use first match for now.
            let template = matchedTemplate(options, rules, matches, node.args.length);
            let args = [];
            let argRules = getRulesForArgs(template, rules);
            let nodeArgs = getNodeArgsForTemplate(node, template);
            forEach(nodeArgs, function (n, i) {
              args = args.concat(translate(options, n, [globalRules, argRules]));
              args[i].m = n.m;
              args[i].n = n.n;
            });
            return expand(template, args, env);
          } else {
            let matches = match(options, patterns, node);
            if (matches.length === 0) {
              return node;
            }
            // Use first match for now.
            let template = matchedTemplate(options, rules, matches, node.args.length);
            let argRules = getRulesForArgs(template, rules);
            let nodeArgs = getNodeArgsForTemplate(node, template);
            let args = [];
            forEach(nodeArgs, function (n, i) {
              args = args.concat(translate(options, n, [globalRules, argRules]));
            });
            template.isBinary = true;
            return expand(template, args);
          }
        },
        equals: function(node) {
          let matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          let template = matchedTemplate(options, rules, matches, node.args.length);
          let argRules = getRulesForArgs(template, rules);
          let nodeArgs = getNodeArgsForTemplate(node, template);
          let args = [];
          forEach(nodeArgs, function (n, i) {
            args = args.concat(translate(options, n, [globalRules, argRules]));
          });
          template.isBinary = true;
          return expand(template, args, node);
        },
        paren: function(node) {
          let matches = match(options, patterns, node);
          if (matches.length === 0) {
            return node;
          }
          // Use first match for now.
          let template = matchedTemplate(options, rules, matches, 1);
          let argRules = getRulesForArgs(template, rules);
          let nodeArgs = getNodeArgsForTemplate(node, template);
          let args = [];
          forEach(nodeArgs, function (n) {
            args.push(translate(options, n, [globalRules, argRules]));
          });
          return expand(template, args);
        }
      });
    }

    this.normalizeLiteral = normalizeLiteral;
    this.translate = translate;
  }

  function normalizeLiteral(options, node) {
    let visitor = new Visitor(ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.normalizeLiteral(options, node);
    Assert.setLocation(prevLocation);
    return result;
  }

  function dumpRules(rules) {
    let str = "";
    for (var [key, val] of rules) {
      str += JSON.stringify(key, null, 2) + " --> " + JSON.stringify(val, null, 2) + "\n";
    }
    return str;
  }

  function getRulesForArgs(template, rules) {
    // Use first match for now.
    return template.rules;
  }

  function mergeMaps(m1, m2) {
    let map = {};
    if (m1) {
      let keys = Object.keys(m1);
      keys.forEach(k => {
        map[k] = m1[k];
      });
    }
    let keys = Object.keys(m2);
    keys.forEach(k => {
      if (!map[k]) {
        map[k] = m2[k];
      }
    });
    return map;
  }
  function compileTemplate(options, template) {
    let compiledTemplate;
    if (template instanceof Array) {
      compiledTemplate = [];
      template.forEach(function (t) {
        compiledTemplate = compiledTemplate.concat(compileTemplate(options, t));
      });
    } else {
      if (typeof template === "string") {
        // "%1"
        compiledTemplate = [{
          str: template,
        }];
      } else {
        // {"%1": {"?": "%1"}}
        // [cntx1 "%1", cntx2 {"%1": {?: "%1"}}] --> [{context: "cntx1", str: "%1"},...]
        let context = "", str, rules;
        if (template.options) {
          context += template.options.EndRoot ? " EndRoot" : "";
          context += template.options.NoParens ? " NoParens" : "";
          str = template.value;
        } else {
          str = Object.keys(template)[0];
          assert(str !== "options");
          rules = compileRules(options, template[str]);
        }
        compiledTemplate = [{
          context: context,
          str: str,
          rules: rules,
        }];
      }
    }
    return compiledTemplate;
  }
  function compileRules(options, rules) {
    // { "ast as string": template, ... }
    let keys = Object.keys(rules);
    let compiledRules = {};
    keys.forEach(function (key) {
      let pattern = JSON.stringify(Parser.create(options, key));  // Parse and normalize.
      let template = compileTemplate(options, rules[key]);
      if (!compiledRules[pattern]) {
        compiledRules[pattern] = template;
      }
    });
    return compiledRules;
  }
  function translate(options, node, rules) {
    let visitor = new Visitor(ast);
    let compiledRules = compileRules(options, rules);
    return visitor.translate(options, node, compiledRules);
  }
  function trim(str) {
    let i = 0;
    let out = "";
    for (; i < str.length; i++) {
      switch (str.charAt(i)) {
      case " ":
      case "\t":
      case "\n":
        if (out.length === 0 || out.charAt(out.length-1) === " ") {
          // Erase space at beginning and after other space.
          continue;
        }
        out += " ";
        break;
      default:
        out += str.charAt(i);
        break;
      }
    }
    while (out.charAt(out.length - 1) === " ") {
      // Trim off trailing whitespace.
      out = out.substring(0, out.length - 1);
    }
    while (out.lastIndexOf("baseline") !== -1 && out.lastIndexOf(" baseline") === out.length - " baseline".length) {
      // Trim off trailing modifiers
      out = out.substring(0, out.length - " baseline".length);
    }
    return out;
  }
  Parser.fn.translate = function (n1, options) {
    let rules = Parser.option(options, "rules");
    let n = translate(options, n1, rules);
    if (!n || n.op !== Parser.VAR) {
      n = newNode(Parser.VAR, [""]);
    }
    return trim(n.args[0]);
  }

  let option = Parser.option = function option(options, p, v) {
    assert(options);
    let opt = options && options[p];
    if (v !== undefined) {
      // Set the option value.
      Parser.options = options = options ? options : {};
      options[p] = v;
    }
    if (opt === undefined) {
      switch (p) {
      case "field":
        opt = "integer";
        break;
      case "decimalPlaces":
        opt = 10;
        break;
      case "toleranceAbsolute":
      case "tolerancePercent":
      case "toleranceRange":
      case "setThousandsSeparator":
      case "setDecimalSeparator":
      case "dontExpandPowers":
      case "dontFactorDenominators":
      case "dontFactorTerms":
      case "dontConvertDecimalToFraction":
      case "strict":
      case "antiderivative":
        opt = undefined;
        break;
      case "types":
        opt = {};
        break;
      default:
        opt = false;
        break;
      }
    }
    // Return the original or default option.
    return opt;
  }

  let RUN_SELF_TESTS = false;
  if (RUN_SELF_TESTS) {
    let env = {
    };

    trace("\nMath Parser self testing");
    (function () {
    })();
  }
})(new Ast);
export let Core = (function () {
  Assert.reserveCodeRange(3000, 3999, "core");
  let messages = Assert.messages;
  let message = Assert.message;
  let assert = Assert.assert;
  messages[3001] = "No Math Core spec provided.";
  messages[3002] = "No Math Core solution provided.";
  messages[3003] = "No Math Core spec value provided.";
  messages[3004] = "Invalid Math Core spec method '%1'.";
  messages[3005] = "Operation taking too long.";
  messages[3006] = "Invalid option name '%1'.";
  messages[3007] = "Invalid option value '%2' for option '%1'.";
  messages[3008] = "Internal error: %1";

  let u = 1;
  let k = 1000;
  let c = Math.pow(10, -2);
  let m = Math.pow(10, -3);
  let mu = Math.pow(10, -6); // micro, \\mu
  let n = Math.pow(10, -9);
  let env = {
    "matrix": {},
    "pmatrix": {},
    "bmatrix": {},
    "Bmatrix": {},
    "vmatrix": {},
    "Vmatrix": {},
    "array": {},
    "\\alpha": { type: "var" },
    "\\beta": { type: "var" },
    "\\gamma": { type: "var" },
    "\\delta": { type: "var" },
    "\\epsilon": { type: "var" },
    "\\zeta": { type: "var" },
    "\\eta": { type: "var" },
    "\\theta": { type: "var" },
    "\\iota": { type: "var" },
    "\\kappa": { type: "var" },
    "\\lambda": { type: "var" },
    "\\mu": { type: "const", value: mu },
    "\\nu": { type: "var" },
    "\\xi": { type: "var" },
    "\\pi": { type: "const", value: Math.PI },
    "\\rho": { type: "var" },
    "\\sigma": { type: "var" },
    "\\tau": { type: "var" },
    "\\upsilon": { type: "var" },
    "\\phi": { type: "var" },
    "\\chi": { type: "var" },
    "\\psi": { type: "var" },
    "\\omega": { type: "var" },
    "\\sin": { type: "var" },
    "\\cos": { type: "var" },
    "\\tan": { type: "var" },
    "\\sec": { type: "var" },
    "\\csc": { type: "var" },
    "\\cot": { type: "var" },
    "\\arcsin": { type: "var" },
    "\\arccos": { type: "var" },
    "\\arctan": { type: "var" },
    "\\arcsec": { type: "var" },
    "\\arccsc": { type: "var" },
    "\\arccot": { type: "var" },
    "\\sinh": { type: "var" },
    "\\cosh": { type: "var" },
    "\\tanh": { type: "var" },
    "\\sech": { type: "var" },
    "\\csch": { type: "var" },
    "\\coth": { type: "var" },
    "\\log": { type: "var" },
    "\\ln": { type: "var" },
    "\\lg": { type: "var" },
  };

  function validateOption(p, v) {
    switch (p) {
    case "field":
      switch (v) {
      case void 0: // undefined means use default
      case "integer":
      case "real":
      case "complex":
        break;
      default:
        assert(false, message(3007, [p, v]));
        break;
      }
      break;
    case "decimalPlaces":
      if (v === void 0 || +v >= 0 && +v <= 20) {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "toleranceAbsolute":
      if (v === undefined || +v >= 0 ||
          typeof v === "string") {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "tolerancePercent":
      if (v === undefined || +v >= 0) {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "toleranceRange":
      if (v === undefined ||
          v instanceof Array && v.length === 2) {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "antiderivative":
      if (typeof v === "undefined" ||
          typeof v === "string") {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "NoParens":
    case "EndRoot":
    case "allowDecimal":
    case "allowInterval":
    case "dontExpandPowers":
    case "dontFactorDenominators":
    case "dontFactorTerms":
    case "dontConvertDecimalToFraction":
    case "dontSimplifyImaginary":
    case "ignoreOrder":
    case "inverseResult":
    case "requireThousandsSeparator":
    case "ignoreText":
    case "ignoreTrailingZeros":
    case "allowThousandsSeparator":
    case "compareSides":
    case "ignoreCoefficientOne":
    case "strict":
    case "integrationConstant":
    case "absoluteValue":
    case "parsingIntegralExpr":
      if (typeof v === "undefined" || typeof v === "boolean") {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "setThousandsSeparator":
      if (typeof v === "undefined" ||
          typeof v === "string" && v.length === 1 ||
          v instanceof Array) {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "setDecimalSeparator":
      if (typeof v === "undefined" ||
          typeof v === "string" && v.length === 1 ||
          v instanceof Array && v.length > 0 && v[0].length === 1) {
        break;
      }
      assert(false, message(3007, [p, JSON.stringify(v)]));
      break;
    case "words":
    case "rules":
    case "types":
    case "data":
      if (typeof v === "undefined" ||
          typeof v === "object") {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    default:
      assert(false, message(3006, [p]));
      break;
    }
    // If we get this far, all is well.
    return;
  }
  function validateOptions(options) {
    if (options) {
      forEach(Object.keys(options), function (option) {
        validateOption(option, options[option]);
      });
    }
  }
  function translate(options, solution, resume) {
    if (!options) {
      options = {};
    }
    if (!options.rules) {
      // Use the default rules in rules.js.
      options.words = rules.words;
      options.rules = rules.rules;
      options.types = rules.types;
    }
    let spec = {
      method: "translate",
      options: options
    };
    options.allowInterval = true;
    let evaluator = makeEvaluator(spec, resume);
    evaluator.evaluate(solution, (err, val) => {
      resume(err, val);
    });
  }
  function makeEvaluator(spec, resume) {
    let valueNode;
    let method = spec.method;
    let value = spec.value;
    let options = Parser.options = spec.options;
    let pendingError;
    try {
      Assert.setLocation("spec");
      validateOptions(options);
      Parser.pushEnv(env);
      valueNode = value != undefined ? Parser.create(options, value, "spec") : undefined;
      Parser.popEnv();
    } catch (e) {
      console.log("ERROR makeEvaluator() " + e.stack);
      pendingError = e;
      resume([{
        result: null,
        errorCode: parseErrorCode(message),
        message: parseMessage(message),
        stack: e.stack,
        location: e.location,
        model: null,  // Unused, for now.
        toString: function () {
          return this.errorCode + ": (" + this.location + ") " + this.message + "\n" + this.stack;
        },
      }], "");  // If error, empty string.
    }
    let evaluate = function evaluate(solution, resume) {
      try {
        if (pendingError) {
          throw pendingError;
        }
        Assert.setLocation("user");
        assert(solution != undefined, message(3002));
        Parser.pushEnv(env);
        let solutionNode = Parser.create(options, solution, "user");
        assert(solutionNode, message(3008, ["invalid input"]));
        Assert.setLocation("spec");
        let result;
        switch (method) {
        case "translate":
          result = solutionNode.translate(options);
          break;
        default:
          assert(false, message(3004, [method]));
          break;
        }
        Parser.popEnv();
        resume([], result);
      } catch (e) {
        console.log("ERROR evaluate() " + e.stack);
        let message = e.message;
        resume([{
          result: null,
          errorCode: parseErrorCode(message),
          message: parseMessage(message),
          stack: e.stack,
          location: e.location,
          model: null,  // Unused, for now.
          toString: function () {
            return this.errorCode + ": (" + this.location + ") " + this.message + "\n" + this.stack;
          },
        }], "");  // If error, empty string.
        return;
      }
    };
    return {
      evaluate: evaluate,
      model: valueNode,
    };
    function parseErrorCode(e) {
      let code = +e.slice(0, indexOf(e, ":"));
      if (!isNaN(code)) {
        return code;
      }
      return 0;
    }
    function parseMessage(e) {
      let code = parseErrorCode(e);
      if (code) {
        return e.slice(indexOf(e, ":")+2);
      }
      return e;
    }
  }

  // Exports
  return {
    translate: translate,
  };
})();

if (typeof window !== "undefined") {
  // Make a browser hook.
  window.Core = Core;
}
