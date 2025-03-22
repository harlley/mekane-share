// Shared types and utilities will be exported from here
export type SharedConfig = {
  version: string;
};

// Upload Request interface
export interface UploadMetadata {
  timestamp?: number;
  source?: string;
  retention?: number; // Retention period in days, defaults to 7
  [key: string]: unknown; // Allow additional custom metadata
}

// Upload Response interface
export interface UploadResponse {
  success: boolean;
  url: string;
  id: string;
  expiresAt: string; // ISO date string
}

// Error types
export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

// Validation types
export enum FileValidationError {
  INVALID_FORMAT = 'INVALID_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  MISSING_FILE = 'MISSING_FILE',
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max file size
export const ALLOWED_MIME_TYPES = ['image/png']; // Only PNG files allowed
export const DEFAULT_RETENTION_DAYS = 7; // Default 7 days retention
