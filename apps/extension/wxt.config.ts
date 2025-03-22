import { defineConfig } from 'wxt';

// Default to localhost for development if not specified
const DEFAULT_SERVER_URL =
  process.env.WXT_SERVER_URL || 'http://localhost:8787';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: () => ({
    name: 'Mekane Share',
    description: 'Screenshot sharing extension',
    permissions: [
      'activeTab',
      'tabs',
      'scripting',
      'desktopCapture',
      'notifications',
      'clipboardWrite',
      'storage',
    ],
    host_permissions: ['<all_urls>', `${DEFAULT_SERVER_URL}/*`],
    background: {
      service_worker: './entrypoints/background.ts',
      type: 'module',
    },
  }),
  vite: () => ({
    define: {
      'import.meta.env.SERVER_URL': JSON.stringify(DEFAULT_SERVER_URL),
    },
  }),
});
