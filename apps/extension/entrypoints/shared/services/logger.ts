const DEBUG = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[Mekane-Screenshot]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('[Mekane-Screenshot]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('[Mekane-Screenshot]', ...args);
    }
  },
};
