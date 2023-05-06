"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var parser = __toESM(require("@babel/parser"));
var import_traverse = __toESM(require("@babel/traverse"));
var import_generator = __toESM(require("@babel/generator"));
var t = __toESM(require("@babel/types"));
var viteSloppyMode = (params) => {
  const { include = /\.js?$/, exclude = [] } = params || {};
  const includeArr = [].concat(include);
  const excludeArr = [].concat(exclude);
  const checkFilePath = (filePath) => {
    return includeArr.some((reg) => reg.test(filePath)) && excludeArr.every((reg) => !reg.test(filePath));
  };
  const findInScope = (scope, name) => {
    let hasFound = false;
    const traverse2 = (innerScope) => {
      if (hasFound || !innerScope) {
        return;
      }
      hasFound = name in (innerScope.bindings || {});
      traverse2(innerScope.parent);
    };
    traverse2(scope);
    return hasFound;
  };
  return {
    name: "sloppy-mode",
    transform: async (code, id) => {
      let newCode = code;
      let sourcemap = null;
      if (!checkFilePath(id)) {
        return {
          code: newCode,
          map: sourcemap
        };
      }
      const ast = parser.parse(code, {
        sourceType: "module",
        sourceFilename: id
      });
      const names = /* @__PURE__ */ new Set();
      (0, import_traverse.default)(ast, {
        enter(path) {
          if (t.isAssignmentExpression(path.node)) {
            const name = path.node.left?.name || "";
            if (!name) {
              return;
            }
            const hasFound = findInScope(path.scope, name);
            if (!hasFound) {
              names.add(name);
            }
          }
        },
        exit(path) {
          if (t.isProgram(path.node)) {
            if (!names.size) {
              return;
            }
            const idx = path.node.body.findIndex((item) => !t.isImportDeclaration(item));
            const declarators = [...names].map((name) => t.variableDeclarator(t.identifier(name), null));
            const varibles = t.variableDeclaration("var", declarators);
            path.node.body.splice(idx, 0, varibles);
          }
        }
      });
      const output = (0, import_generator.default)(ast);
      return output;
    }
  };
};
var src_default = viteSloppyMode;
