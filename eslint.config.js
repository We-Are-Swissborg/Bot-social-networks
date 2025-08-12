import js from "@eslint/js";
import globals from "globals";
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  {
    files: [
      "**/*.{js,mjs,cjs}"
    ],
    plugins: {
      js,
      import: importPlugin,
    },
    extends: [
      "js/recommended",
    ],
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      "import/named": "error",
      "import/no-unresolved": "error",
      "no-unused-vars": "warn",
      "no-undef": "error",
      "prefer-const": "warn",
    }
  },
]);
