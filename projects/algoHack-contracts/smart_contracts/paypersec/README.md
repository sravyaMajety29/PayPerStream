# tapToStream Smart Contract Testing

## Prerequisites

Before running the tests, make sure you have:

1. **AlgoKit LocalNet running**:

   ```bash
   algokit localnet start
   ```

2. **Environment variables set up** in `.env`:

   ```bash
   # Make sure you have DEPLOYER account configured
   DEPLOYER_MNEMONIC="your deployer mnemonic here"
   ```

3. **Dependencies installed**:
   ```bash
   npm install
   ```

## Running Tests

### Install Vitest dependencies:

```bash
npm install vitest @vitest/ui --save-dev
```

### Run all tests:

```bash
npm test
```

### Run tests with UI:

```bash
npm run test:ui
```

### Run tests once (no watch mode):

```bash
npm run test:run
```

### Run specific contract tests:

```bash
npm run test-contract
```

### Watch mode (re-runs tests when files change):

```bash
npm run test:watch
```

## Test Structure

The tests cover:

### ✅ Contract Initialization

- Stream initialization with title, duration, and price
- Payment recipient updates
- Access control verification

### ✅ Streaming Flow

- User starts streaming with correct payment
- Payment validation (rejects insufficient payments)
- Continue streaming functionality
- Stop streaming with refunds

### ✅ Access Control

- Only owner can update payment recipient
- Only owner can emergency stop
- Non-owners are properly rejected

### ✅ Edge Cases

- Streaming when contract is inactive
- Multiple users streaming simultaneously
- Proper state management

## Test Output

The tests will show:

- Contract deployment details (App ID, Address)
- Transaction IDs for each operation
- Stream info and user streaming data
- Success/failure status for each test case

## Troubleshooting

1. **LocalNet not running**: Make sure `algokit localnet start` is running
2. **DEPLOYER account not found**: Check your `.env` file has the correct mnemonic
3. **Tests timeout**: Increase timeout in `vitest.config.ts` if needed
4. **Port conflicts**: Make sure ports 4001, 4002, 8980 are available

## Understanding the Smart Contract

The tapToStream contract implements:

- **10-second interval payments** for streaming content
- **Pay-per-second pricing** with prepaid intervals
- **Automatic refunds** when users stop streaming
- **Owner controls** for emergency stops and payment recipient updates
- **Multi-user support** with isolated user states

Each test demonstrates these features in action, helping you understand how to integrate the contract into your frontend application.
