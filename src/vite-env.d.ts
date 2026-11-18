/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Minimal types for Google Identity Services (only what we use).
interface Window {
  google?: {
    accounts: {
      id: {
        initialize(config: { client_id: string; callback: (response: { credential: string }) => void }): void;
        renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
      };
    };
  };
}
