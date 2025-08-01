/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MSAL_CLIENT_ID: string;
  readonly VITE_MSAL_AUTHORITY: string;
  readonly VITE_MSAL_KNOWN_AUTHORITIES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
