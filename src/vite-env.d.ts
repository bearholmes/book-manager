/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOCAL_API_TOKEN?: string;
  readonly VITE_LOCAL_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
