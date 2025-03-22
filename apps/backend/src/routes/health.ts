import { Hono } from 'hono';

// Health check route
export const health = new Hono();

health.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
