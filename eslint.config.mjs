import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import pluginSecurity from "eslint-plugin-security";
import pluginUnsanitized from "eslint-plugin-no-unsanitized"; // ✅ add this

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      js,
      security: pluginSecurity,
      unsanitized: pluginUnsanitized,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginSecurity.configs.recommended.rules, // ✅ security rules here
      "unsanitized/property": "warn", // Add unsanitized rules manually (no presets provided)
      "unsanitized/method": "warn",
    },
  },
  {
    files: ["tests/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.mocha, // Apply mocha globals only to tests
      },
    },
  },
]);
