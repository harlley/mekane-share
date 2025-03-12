import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* eslint-disable no-console */
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../.output/chrome-mv3');
    const userDataDir = path.join(__dirname, '../.test-user-data');

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    try {
      // Tenta obter o ID da extensão através do service worker
      let serviceWorker;
      const workers = context.serviceWorkers();

      if (workers.length > 0) {
        serviceWorker = workers[0];
      } else {
        // Se não encontrar, espera pelo service worker
        serviceWorker = await context.waitForEvent('serviceworker', {
          timeout: 30000,
        });
      }

      if (!serviceWorker) {
        throw new Error('Service worker not found');
      }

      const extensionId = serviceWorker.url().split('/')[2];
      console.log('Found extension ID:', extensionId);

      await use(extensionId);
    } catch (error) {
      console.error('Error getting extension ID:', error);
      throw error;
    }
  },
});
