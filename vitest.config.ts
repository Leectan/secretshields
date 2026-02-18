import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    include: ["test/unit/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      vscode: resolve(__dirname, "test/mocks/vscode.ts"),
    },
  },
});
