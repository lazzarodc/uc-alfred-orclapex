import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@raycast/api": path.resolve(__dirname, "test/raycast-api.mock.tsx") },
  },
  esbuild: { jsx: "automatic" },
});
