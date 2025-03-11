import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Mekane Share',
    description: 'Take and share screenshot of selected areas',
    permissions: ['activeTab', 'tabs', 'scripting', 'desktopCapture'],
    host_permissions: ['<all_urls>'],
    background: {
      service_worker: 'background.ts',
      type: 'module',
    },
  },
  modules: ['@wxt-dev/module-react'],
});
