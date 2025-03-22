import { R2Bucket, R2ObjectBody } from '@cloudflare/workers-types';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadMetadata,
  FileValidationError,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  DEFAULT_RETENTION_DAYS,
} from '@mekane-share/shared';
import { logger } from './logger';

/**
 * Service to handle storage operations with Cloudflare R2
 */
export class StorageService {
  private bucket: R2Bucket;
  private baseUrl: string;

  constructor(bucket: R2Bucket, baseUrl?: string) {
    this.bucket = bucket;

    // Use provided baseUrl or default to localhost
    // This baseUrl should come from the PUBLIC_URL environment variable
    this.baseUrl = baseUrl || 'http://localhost:8787';

    // Ensure no trailing slash
    if (this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }

    logger.log('Storage service initialized with base URL:', this.baseUrl);
  }

  /**
   * Validate the screenshot file
   */
  validateFile(file: File | Blob): void {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(FileValidationError.FILE_TOO_LARGE);
    }

    // Check file type
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(FileValidationError.INVALID_FORMAT);
    }
  }

  /**
   * Generate a unique ID for the screenshot
   */
  generateId(): string {
    return uuidv4();
  }

  /**
   * Save a screenshot to R2 storage
   */
  async saveScreenshot(
    screenshot: File | Blob,
    metadata: UploadMetadata = {}
  ): Promise<{ url: string; id: string; expiresAt: Date }> {
    try {
      // Validate the file
      this.validateFile(screenshot);

      // Generate a unique ID
      const id = this.generateId();
      logger.log(`Saving screenshot with ID: ${id}`);

      // Set expiration date
      const retentionDays = metadata.retention || DEFAULT_RETENTION_DAYS;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + retentionDays);

      // Prepare R2 object metadata
      const r2Metadata = {
        uploadedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        contentType: screenshot.type || 'image/png',
        ...metadata,
      };
      logger.log('R2 Metadata:', r2Metadata);

      // Convert screenshot to ArrayBuffer for R2 storage
      const buffer = await screenshot.arrayBuffer();
      logger.log(`Screenshot buffer size: ${buffer.byteLength} bytes`);

      // Log bucket info
      logger.log('Storing in R2 bucket (binding: SCREENSHOTS_BUCKET)');
      logger.log(`Storage path: screenshots/${id}.png`);

      // Upload to R2
      const putResult = await this.bucket.put(`screenshots/${id}.png`, buffer, {
        customMetadata: {
          // R2 custom metadata must be string values
          metadata: JSON.stringify(r2Metadata),
        },
        httpMetadata: {
          contentType: screenshot.type || 'image/png',
        },
      });

      logger.log('R2 put result:', putResult);

      // Verify the object was stored by attempting to get it
      const checkResult = await this.bucket.head(`screenshots/${id}.png`);
      logger.log(
        'Verification check result:',
        checkResult ? 'Object exists' : 'Object not found'
      );

      // Return the public URL and metadata
      const url = `${this.baseUrl}/${id}`;
      logger.log(`Generated URL: ${url}`);

      return {
        url,
        id,
        expiresAt,
      };
    } catch (error) {
      logger.error('Error saving screenshot to R2:', error);
      throw error;
    }
  }

  /**
   * Get a screenshot from R2 storage by ID
   */
  async getScreenshot(id: string): Promise<R2ObjectBody | null> {
    try {
      return await this.bucket.get(`screenshots/${id}.png`);
    } catch (error) {
      logger.error('Error retrieving screenshot from R2:', error);
      return null;
    }
  }

  /**
   * Delete a screenshot from R2 storage
   */
  async deleteScreenshot(id: string): Promise<boolean> {
    try {
      await this.bucket.delete(`screenshots/${id}.png`);
      return true;
    } catch (error) {
      logger.error('Error deleting screenshot from R2:', error);
      return false;
    }
  }
}
