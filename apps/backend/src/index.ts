import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { R2Bucket } from '@cloudflare/workers-types';
import { health } from './routes/health';
import { upload } from './routes/upload';
import { logger } from './services/logger';

// Environment types for the application
interface Env {
  SCREENSHOTS_BUCKET: R2Bucket;
  PUBLIC_URL?: string;
}

// Create the main app
const app = new Hono<{ Bindings: Env }>();

// Apply global middleware
app.use('*', honoLogger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: '*', // Allow all origins for testing
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
  })
);

// Register routes
app.route('/health', health);
app.route('/upload', upload);

// Add a root route handler for direct image access
app.get('/:id', async (c) => {
  const id = c.req.param('id');

  if (!id) {
    return c.json(
      {
        error: 'Screenshot ID is required',
        code: 'MISSING_ID',
      },
      400
    );
  }

  // Initialize storage service with the R2 bucket
  const { SCREENSHOTS_BUCKET } = c.env;

  if (!SCREENSHOTS_BUCKET) {
    return c.json(
      {
        error: 'Storage bucket is not properly configured',
        code: 'STORAGE_ERROR',
      },
      500
    );
  }

  // Create the storage service
  const StorageService = (await import('./services/storage')).StorageService;
  const storageService = new StorageService(
    SCREENSHOTS_BUCKET,
    c.env.PUBLIC_URL
  );

  try {
    // Get screenshot from R2
    const screenshot = await storageService.getScreenshot(id);

    if (!screenshot) {
      return c.json(
        {
          error: 'Screenshot not found',
          code: 'NOT_FOUND',
        },
        404
      );
    }

    // Set the content type header
    if (screenshot.httpMetadata?.contentType) {
      c.header('Content-Type', screenshot.httpMetadata.contentType);
    } else {
      c.header('Content-Type', 'image/png');
    }

    // Return the image directly
    return c.body(screenshot.body);
  } catch (error) {
    logger.error('Error retrieving screenshot:', error);
    return c.json(
      {
        error: 'Failed to retrieve screenshot',
        code: 'RETRIEVAL_ERROR',
      },
      500
    );
  }
});

// Not found handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Endpoint not found',
      code: 'NOT_FOUND',
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  logger.error('Unhandled error:', err);

  return c.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: err.message,
    },
    500
  );
});

export default app;
