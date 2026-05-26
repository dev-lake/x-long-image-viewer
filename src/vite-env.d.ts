/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHROME_WEB_STORE_EXTENSION_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  var chrome:
    | {
        i18n?: {
          getUILanguage?: () => string;
        };
        storage?: {
          local?: {
            get?: (keys: string | string[] | Record<string, unknown> | null, callback: (items: Record<string, unknown>) => void) => void;
            set?: (items: Record<string, unknown>, callback?: () => void) => void;
          };
        };
      }
    | undefined;
}

export {};
