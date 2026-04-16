import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals"; // Note: Make sure to 'npm install globals'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // --- GLOBAL SETTINGS ---
    files: ["**/*.{js,mjs,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // This enables 'require', 'process', and 'console'
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // General rules
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off", // Essential for Backend debugging
      
      // React specific
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",

      // TypeScript overrides for Backend
      "@typescript-eslint/no-require-imports": "off", // Stops the 'require' is forbidden error
      "@typescript-eslint/no-explicit-any": "off",    // Keeping it friendly for Keke
      "@typescript-eslint/no-unused-vars": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  }
);