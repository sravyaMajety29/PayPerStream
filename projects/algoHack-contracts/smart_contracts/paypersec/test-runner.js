#!/usr/bin/env node

/**
 * Simple test runner for tapToStream smart contract
 *
 * Prerequisites:
 * 1. Make sure you have AlgoKit LocalNet running: `algokit localnet start`
 * 2. Make sure you have DEPLOYER environment set up in .env
 *
 * Usage:
 * npm run test-contract
 * or
 * node test-runner.js
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Starting tapToStream Contract Tests...\n");

try {
  // Check if LocalNet is running
  console.log("🔍 Checking LocalNet status...");

  try {
    execSync("curl -s http://localhost:4001/health", { stdio: "ignore" });
    console.log("✅ LocalNet is running\n");
  } catch (error) {
    console.log("❌ LocalNet is not running. Please start it with: algokit localnet start");
    process.exit(1);
  }

  // Run the test
  console.log("🧪 Running contract tests...\n");

  const testPath = path.join(__dirname, "contract.spec.ts");
  const command = `npx ts-node "${testPath}"`;

  execSync(command, {
    stdio: "inherit",
    cwd: __dirname,
  });

  console.log("\n🎉 All tests completed successfully!");
} catch (error) {
  console.error("\n❌ Tests failed:", error.message);
  process.exit(1);
}
