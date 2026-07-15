"use strict";

const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: ["_site/**", "_site 2/**", "node_modules/**", "assets/_generated/**"],
  },
  js.configs.recommended,
  {
    files: ["assets/js/**/*.js", "src/admin/**/*.js", "admin/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: { ...globals.browser },
    },
  },
  {
    files: [
      "tools/**/*.js",
      "src/_data/**/*.js",
      "src/_includes/**/*.js",
      ".eleventy.js",
      "eslint.config.js",
    ],
    ignores: ["tools/visual-cms/web/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
  },
  {
    // Puppeteer scripts: the file runs under Node, but page.evaluate()
    // callbacks execute inside a real browser context, so both global
    // sets are legitimately in scope in the same file.
    files: ["tools/check-accessibility.js", "tools/capture-references.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ["tools/visual-cms/web/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: { ...globals.browser },
    },
  },
];
