import React from "react";
import {
  SupportedWallet,
  WalletId,
  WalletManager,
  WalletProvider as UseWalletProvider,
  useWallet as useWalletHook,
} from "@txnlab/use-wallet-react";

// Simple Algorand configuration for demo
const algodConfig = {
  server: import.meta.env.VITE_ALGOD_SERVER || "http://localhost",
  port: Number(import.meta.env.VITE_ALGOD_PORT) || 4001, // Algod port for transactions and account data
  token: import.meta.env.VITE_ALGOD_TOKEN || "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  network: import.meta.env.VITE_ALGOD_NETWORK || "localnet",
};

const kmdConfig = {
  server: import.meta.env.VITE_KMD_SERVER || "http://localhost",
  port: Number(import.meta.env.VITE_KMD_PORT) || 4002, // KMD port for wallet management
  token: import.meta.env.VITE_KMD_TOKEN || "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

const supportedWallets: SupportedWallet[] = [
  { id: WalletId.LUTE },
  {
    id: WalletId.KMD,
    options: {
      baseServer: kmdConfig.server,
      token: kmdConfig.token,
      port: String(kmdConfig.port),
    },
  },
  { id: WalletId.PERA },
];

const walletManager = new WalletManager({
  wallets: supportedWallets,
  defaultNetwork: algodConfig.network,
  networks: {
    [algodConfig.network]: {
      algod: {
        baseServer: algodConfig.server,
        port: algodConfig.port,
        token: algodConfig.token,
      },
    },
  },
  options: {
    resetNetwork: true,
  },
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <UseWalletProvider manager={walletManager}>{children}</UseWalletProvider>;
}

export function useWallet() {
  return useWalletHook();
}
