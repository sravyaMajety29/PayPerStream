import algosdk from "algosdk";

export interface AlgoViteClientConfig {
  server: string;
  port: string;
  token: string;
  network: string;
}

export interface AlgoViteKMDConfig {
  server: string;
  port: string;
  token: string;
  wallet: string;
  password: string;
}

export function getAlgodConfigFromViteEnvironment(): AlgoViteClientConfig {
  return {
    server: import.meta.env.VITE_ALGOD_SERVER || "https://testnet-api.algonode.cloud",
    port: import.meta.env.VITE_ALGOD_PORT || "443",
    token: import.meta.env.VITE_ALGOD_TOKEN || "",
    network: import.meta.env.VITE_ALGOD_NETWORK || "localnet",
  };
}

export function getKmdConfigFromViteEnvironment(): AlgoViteKMDConfig {
  if (!import.meta.env.VITE_KMD_SERVER) {
    throw new Error("Attempt to get default kmd configuration without specifying VITE_KMD_SERVER in the environment variables");
  }

  return {
    server: import.meta.env.VITE_KMD_SERVER,
    port: import.meta.env.VITE_KMD_PORT || "4002",
    token: import.meta.env.VITE_KMD_TOKEN || "",
    wallet: import.meta.env.VITE_KMD_WALLET || "unencrypted-default-wallet",
    password: import.meta.env.VITE_KMD_PASSWORD || "",
  };
}

export function getAppIdFromViteEnvironment(): number {
  const appIdStr = import.meta.env.VITE_STREAM_APP_ID;
  if (!appIdStr) {
    throw new Error("Attempt to get app ID without specifying VITE_STREAM_APP_ID in the environment variables");
  }

  try {
    return parseInt(appIdStr, 10);
  } catch {
    throw new Error("VITE_STREAM_APP_ID must be a valid integer string");
  }
}

// Create algod client instance for blockchain queries
const algodConfig = getAlgodConfigFromViteEnvironment();
export const algodClient = new algosdk.Algodv2(algodConfig.token, algodConfig.server, algodConfig.port);

// Create KMD client instance for wallet management
const kmdConfig = getKmdConfigFromViteEnvironment();
export const kmdClient = new algosdk.Kmd(kmdConfig.token, kmdConfig.server, kmdConfig.port);
