import { defineConfig } from 'wxt';

// Default to localhost for development if not specified
const DEFAULT_SERVER_URL =
  process.env.WXT_SERVER_URL || 'http://localhost:8787';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: () => ({
    name: 'Mekane Share',
    description: 'Screenshot sharing extension',
    manifest_version: 3,
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
      service_worker: 'background.js',
      type: 'module',
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content-scripts/content.js'],
        run_at: 'document_idle',
      },
    ],
  }),
  vite: () => ({
    define: {
      'import.meta.env.SERVER_URL': JSON.stringify(DEFAULT_SERVER_URL),
    },
  }),
});
