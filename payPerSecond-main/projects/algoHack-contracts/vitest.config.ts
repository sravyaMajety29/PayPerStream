import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    timeout: 60000, // 60 seconds for blockchain operations
    testTimeout: 60000,
    hookTimeout: 60000,
    teardownTimeout: 60000,
    pool: "forks", // Run tests in separate processes for isolation
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork to avoid conflicts with LocalNet
      },
    },
    reporters: ["verbose"],
    outputFile: {
      json: "./test-results.json",
    },
  },
  esbuild: {
    target: "node18",
  },
  resolve: {
    alias: {
      "@": "./smart_contracts",
    },
  },
});
