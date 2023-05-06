// src/index.ts
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
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
      traverse(ast, {
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
      const output = generate(ast);
      return output;
    }
  };
};
var src_default = viteSloppyMode;
export {
  src_default as default
};
