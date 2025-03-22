import { Hono } from 'hono';
import { zValidator as _zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { R2Bucket } from '@cloudflare/workers-types';
import { StorageService } from '../services/storage';
import { logger } from '../services/logger';
import {
  UploadMetadata,
  UploadResponse,
  FileValidationError,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from '@mekane-share/shared';

// Define environment and variables types
interface Env {
  SCREENSHOTS_BUCKET: R2Bucket;
  PUBLIC_URL?: string;
}

interface Variables {
  storageService: StorageService;
}

// Upload route with typed environment and variables
export const upload = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to initialize the storage service with R2 bucket
upload.use('*', async (c, next) => {
  // Initialize the storage service with the R2 bucket from bindings
  const { SCREENSHOTS_BUCKET } = c.env;

  // Check if the bucket is available
  if (!SCREENSHOTS_BUCKET) {
    return c.json(
      {
        error: 'Storage bucket is not properly configured',
        code: 'STORAGE_ERROR',
      },
      500
    );
  }

  // Add the storage service to the context
  c.set(
    'storageService',
    new StorageService(SCREENSHOTS_BUCKET, c.env.PUBLIC_URL)
  );

  await next();
});

// Metadata validation schema
const metadataSchema = z
  .object({
    timestamp: z.number().optional(),
    source: z.string().optional(),
    retention: z.number().min(1).max(30).optional(), // Between 1 and 30 days
  })
  .passthrough(); // Allow additional properties

// Handle screenshot uploads
upload.post('/', async (c) => {
  try {
    // Get storage service from context
    const storageService = c.get('storageService');

    // Get form data with the screenshot
    const formData = await c.req.formData();
    const screenshot = formData.get('screenshot');
    const metadataField = formData.get('metadata');

    // Log received data
    logger.info('Received upload request:');
    logger.info('- Screenshot present:', !!screenshot);
    logger.info('- Metadata present:', !!metadataField);

    // Validate screenshot is present
    if (!screenshot) {
      return c.json(
        {
          error: 'Screenshot is required',
          code: FileValidationError.MISSING_FILE,
        },
        400
      );
    }

    // Check if screenshot is a valid file or blob
    // We can't directly use instanceof in Workers runtime, so check for size property
    if (typeof screenshot === 'string' || !('size' in screenshot)) {
      return c.json(
        {
          error: 'Screenshot must be a file',
          code: FileValidationError.MISSING_FILE,
        },
        400
      );
    }

    // Basic file validation
    if (screenshot.size > MAX_FILE_SIZE) {
      return c.json(
        {
          error: `Screenshot size exceeds maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
          code: FileValidationError.FILE_TOO_LARGE,
        },
        400
      );
    }

    if (
      'type' in screenshot &&
      screenshot.type &&
      !ALLOWED_MIME_TYPES.includes(screenshot.type)
    ) {
      return c.json(
        {
          error: `Invalid file format. Only ${ALLOWED_MIME_TYPES.join(', ')} are supported`,
          code: FileValidationError.INVALID_FORMAT,
        },
        400
      );
    }

    // Parse metadata if present
    let metadata: UploadMetadata = {};
    if (metadataField && typeof metadataField === 'string') {
      try {
        const parsedMetadata = JSON.parse(metadataField);

        // Validate metadata
        const validationResult = metadataSchema.safeParse(parsedMetadata);
        if (validationResult.success) {
          metadata = validationResult.data;
          logger.info('- Parsed metadata:', metadata);
        } else {
          logger.warn('Metadata validation failed:', validationResult.error);
          // Continue with empty metadata
        }
      } catch (error) {
        logger.error('Error parsing metadata:', error);
        // Continue with empty metadata
      }
    }

    // Save the screenshot to R2
    const result = await storageService.saveScreenshot(
      screenshot as Blob,
      metadata
    );

    // Create response
    const response: UploadResponse = {
      success: true,
      url: result.url,
      id: result.id,
      expiresAt: result.expiresAt.toISOString(),
    };

    return c.json(response, 201);
  } catch (error) {
    logger.error('Upload error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === FileValidationError.FILE_TOO_LARGE) {
        return c.json(
          {
            error: `Screenshot size exceeds maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
            code: FileValidationError.FILE_TOO_LARGE,
          },
          400
        );
      }

      if (error.message === FileValidationError.INVALID_FORMAT) {
        return c.json(
          {
            error: `Invalid file format. Only ${ALLOWED_MIME_TYPES.join(', ')} are supported`,
            code: FileValidationError.INVALID_FORMAT,
          },
          400
        );
      }
    }

    // Generic error
    return c.json(
      {
        error: 'Failed to process upload',
        code: 'UPLOAD_ERROR',
      },
      500
    );
  }
});

// Add a GET endpoint to retrieve screenshots by ID
upload.get('/:id', async (c) => {
  try {
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

    // Get storage service
    const storageService = c.get('storageService');

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
