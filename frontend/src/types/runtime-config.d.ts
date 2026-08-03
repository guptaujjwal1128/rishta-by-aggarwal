export {};

declare global {
  interface ViteTypeOptions {
    strictImportMetaEnv: unknown;
  }

  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_GOOGLE_CLIENT_ID?: string;
  }

  interface Window {
    __APP_CONFIG__?: {
      VITE_API_URL?: string;
      VITE_GOOGLE_CLIENT_ID?: string;
    };
  }
}
