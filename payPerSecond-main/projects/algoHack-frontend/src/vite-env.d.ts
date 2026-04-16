/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Algod Configuration
  readonly VITE_ALGOD_SERVER?: string;
  readonly VITE_ALGOD_PORT?: string;
  readonly VITE_ALGOD_TOKEN?: string;
  readonly VITE_ALGOD_NETWORK?: string;

  // KMD Configuration
  readonly VITE_KMD_SERVER?: string;
  readonly VITE_KMD_PORT?: string;
  readonly VITE_KMD_TOKEN?: string;
  readonly VITE_KMD_WALLET?: string;
  readonly VITE_KMD_PASSWORD?: string;

  // App IDs
  readonly VITE_APP_ID?: string;
  readonly VITE_STREAM_APP_ID?: string;

  // Indexer Configuration (optional)
  readonly VITE_INDEXER_SERVER?: string;
  readonly VITE_INDEXER_PORT?: string;
  readonly VITE_INDEXER_TOKEN?: string;

  // Environment
  readonly VITE_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
