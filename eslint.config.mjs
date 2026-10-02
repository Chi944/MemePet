import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    // Playwright reports contain generated third-party trace-viewer bundles.
    // Test source in e2e/ remains linted.
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);
