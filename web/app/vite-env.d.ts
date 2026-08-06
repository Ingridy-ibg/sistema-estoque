/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API. Definida em .env / .env.production, lida em tempo de build. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
