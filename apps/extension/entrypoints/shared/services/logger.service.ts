const DEBUG = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG) {
      console.log('[Mekane-Screenshot]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (DEBUG) {
      console.error('[Mekane-Screenshot]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) {
      console.warn('[Mekane-Screenshot]', ...args);
    }
  },
};
