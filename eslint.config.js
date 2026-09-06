// Lints the inline <script> blocks inside index.html and get-price.html.
import html from "eslint-plugin-html";
import globals from "globals";

export default [
  {
    files: ["*.html"],
    plugins: { html },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: globals.browser,
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",
      "no-redeclare": "error",
      eqeqeq: "warn",
    },
  },
];
