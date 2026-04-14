import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Catching real bugs
      "no-unused-vars": "warn",        // Warn about variables not being used
      "no-undef": "error",             // Error if using a variable that doesn't exist
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Being "Friendly" for the team
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' for now so Keke doesn't get stuck
      "react/react-in-jsx-scope": "off",          // Not needed in modern React/Vite
      "prefer-const": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  }
);