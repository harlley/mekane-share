/**
 * Converts a data URL to a Blob
 */
export const dataURLtoBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

/**
 * Converts a Blob to a data URL
 */
export const blobToDataURL = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

/**
 * Creates a canvas in the service worker context
 */
export const createOffscreenCanvas = (
  width: number,
  height: number
): OffscreenCanvas => {
  return new OffscreenCanvas(width, height);
};
