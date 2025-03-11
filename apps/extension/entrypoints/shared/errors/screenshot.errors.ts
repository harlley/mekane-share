export class ScreenshotError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ScreenshotError';
  }
}

export class CaptureError extends ScreenshotError {
  constructor(message: string, details?: unknown) {
    super(message, 'CAPTURE_ERROR', details);
    this.name = 'CaptureError';
  }
}

export class CropError extends ScreenshotError {
  constructor(message: string, details?: unknown) {
    super(message, 'CROP_ERROR', details);
    this.name = 'CropError';
  }
}

export class TabError extends ScreenshotError {
  constructor(message: string, details?: unknown) {
    super(message, 'TAB_ERROR', details);
    this.name = 'TabError';
  }
}
