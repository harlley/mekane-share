import browser from 'webextension-polyfill';
import { SelectionArea } from '../../shared/types';
import { CaptureError, CropError } from '../../shared/errors/screenshot.errors';
import { getActiveTab, executeInTab, getDevicePixelRatio } from './tab.service';
import {
  blobToDataURL,
  createOffscreenCanvas,
  dataURLtoBlob,
} from './image.service';
import { CaptureOptions } from '../../shared/types/screenshot.types';

export const captureVisibleTab = async (
  options: CaptureOptions = { format: 'png' }
): Promise<string> => {
  try {
    const tab = await getActiveTab();

    if (!tab.id) {
      throw new CaptureError('No active tab ID found');
    }

    // Hide the selection area before capture
    await executeInTab(tab.id, () => {
      const overlayContainer = document.getElementById(
        'mekane-selection-overlay-container'
      );
      if (overlayContainer?.shadowRoot) {
        const selectionArea =
          overlayContainer.shadowRoot.querySelector('.selection-area');
        if (selectionArea instanceof HTMLElement) {
          selectionArea.style.display = 'none';
        }
      }
    });

    // Wait for UI updates
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture the screenshot
    const dataUrl = await browser.tabs.captureVisibleTab(undefined, options);

    // Show the selection area again
    if (!tab.id) {
      throw new CaptureError('No active tab ID found');
    }

    await executeInTab(tab.id, () => {
      const overlayContainer = document.getElementById(
        'mekane-selection-overlay-container'
      );
      if (overlayContainer?.shadowRoot) {
        const selectionArea =
          overlayContainer.shadowRoot.querySelector('.selection-area');
        if (selectionArea instanceof HTMLElement) {
          selectionArea.style.display = '';
        }
      }
    });

    return dataUrl;
  } catch (error) {
    throw new CaptureError('Failed to capture screenshot', error);
  }
};

export const cropScreenshot = async (
  screenshotUrl: string,
  area: SelectionArea
): Promise<string> => {
  try {
    // Get the device pixel ratio
    const dpr = await getDevicePixelRatio();

    // Convert data URL to blob
    const blob = await dataURLtoBlob(screenshotUrl);

    // Create ImageBitmap from blob
    const imageBitmap = await createImageBitmap(blob);

    // Calculate dimensions accounting for device pixel ratio
    const left = Math.round(area.x * dpr);
    const top = Math.round(area.y * dpr);
    const width = Math.round(area.width * dpr);
    const height = Math.round(area.height * dpr);

    // Create canvas with the target dimensions (using non-scaled dimensions)
    const canvas = createOffscreenCanvas(area.width, area.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new CropError('Could not get canvas context');
    }

    // Draw the cropped area
    ctx.drawImage(
      imageBitmap,
      left,
      top,
      width,
      height,
      0,
      0,
      area.width,
      area.height
    );

    // Convert canvas to blob
    const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });

    // Convert blob to data URL
    return await blobToDataURL(croppedBlob);
  } catch (error) {
    throw new CropError('Failed to crop screenshot', error);
  }
};

export const openScreenshotInNewTab = async (
  dataUrl: string
): Promise<void> => {
  try {
    await browser.tabs.create({ url: dataUrl });
  } catch (error) {
    throw new CaptureError('Failed to open screenshot in new tab', error);
  }
};
