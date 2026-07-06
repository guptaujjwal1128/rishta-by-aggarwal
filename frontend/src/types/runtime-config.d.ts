export {};

declare global {
  interface Window {
    __APP_CONFIG__?: {
      VITE_API_URL?: string;
      VITE_GOOGLE_CLIENT_ID?: string;
    };
  }
}
