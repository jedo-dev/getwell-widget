import type React from 'react';

declare global {
  interface Window {
    process?: { env: Record<string, string> };
    React?: typeof React;
    ReactDOM?: {
      createRoot?: (...args: unknown[]) => unknown;
      render?: (...args: unknown[]) => unknown;
    };
  }
}

export {};
