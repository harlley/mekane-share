const DEBUG = process.env.NODE_ENV !== 'production';

export const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[Mekane-Backend]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    // eslint-disable-next-line no-console
    console.error('[Mekane-Backend]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('[Mekane-Backend]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.info('[Mekane-Backend]', ...args);
    }
  },
};
