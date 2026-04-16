import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // --- FRONTEND CONFIG (React + TS) ---
  {
    files: ["Frontend/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // --- BACKEND CONFIG (Node.js + Express) ---
  {
    files: ["Backend/**/*.js"],
    languageOptions: {
      sourceType: "commonjs", // Allows require()
      globals: {
        ...globals.node,      // Defines 'console', 'process', etc.
      },
    },
    rules: {
      "no-console": "off",    // Let's us use console.log on server
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  }
);