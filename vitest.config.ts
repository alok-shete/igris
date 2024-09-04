import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./test/utils/setup.ts",
    silent: true,
    coverage: {
      include: ["src"],
    },
  },
});
