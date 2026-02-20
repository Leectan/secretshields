import { defineConfig } from "@vscode/test-cli";

export default defineConfig([
  {
    label: "integration",
    files: "test/integration/**/*.test.js",
    version: "stable",
    mocha: {
      timeout: 60000,
    },
    launchArgs: ["--disable-extensions"],
  },
]);
