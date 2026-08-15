import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Bundle dell'estensione (file generati, non formattati by hand)
    "extension/static/background.js",
    "extension/static/content.js",
    "extension/static/popup.js",
  ]),
]);

export default eslintConfig;
