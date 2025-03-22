import { defineBackground } from 'wxt/sandbox';
import browser from 'webextension-polyfill';
import { CaptureMessage } from './shared/types';
import { captureVisibleTab, cropScreenshot } from './shared/services/capture';
import { CaptureError } from './shared/errors/screenshot.errors';
import { logger } from './shared/services/logger';
import { getUploadUrl, getServerBaseUrl } from './shared/services/settings';

// Function to send screenshot to server
const sendScreenshotToServer = async (
  dataUrl: string
): Promise<{ success: boolean; url?: string }> => {
  try {
    // Get the configured upload URL
    const uploadUrl = await getUploadUrl();

    // Convert data URL to blob for sending
    const fetchResponse = await fetch(dataUrl);
    const blob = await fetchResponse.blob();

    // Log the size of the blob for debugging
    logger.log('Screenshot blob size:', Math.round(blob.size / 1024), 'KB');

    // Create FormData object
    const formData = new FormData();
    formData.append('screenshot', blob, 'screenshot.png');

    // Add some metadata for testing
    const metadata = {
      timestamp: Date.now(),
      source: 'mekane-share-extension',
    };
    formData.append('metadata', JSON.stringify(metadata));

    logger.log('Sending request to:', uploadUrl);

    // Send to server
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    // Log response status for debugging
    logger.log('Server response status:', response.status);

    // Try to read response text
    const responseText = await response.text();
    logger.log('Response text:', responseText);

    // Try to parse the response as JSON
    let responseData;
    try {
      if (responseText && responseText.trim().startsWith('{')) {
        responseData = JSON.parse(responseText);
        logger.log('Server response (parsed):', responseData);
      }
    } catch (parseError) {
      logger.error('Error parsing response JSON:', parseError);
    }

    // Open the URL directly from the response data or use a fallback
    const baseUrl = await getServerBaseUrl();
    const screenshotId = responseData?.id || 'captured-image';
    let resultUrl = responseData?.url || `${baseUrl}/${screenshotId}`;

    // Replace localhost with configured server URL if needed
    if (resultUrl.includes('localhost')) {
      // Extract just the ID part from the URL
      const urlParts = resultUrl.split('/');
      const id = urlParts[urlParts.length - 1];
      resultUrl = `${baseUrl}/${id}`;
      logger.log(
        'Replaced localhost URL with configured server URL:',
        resultUrl
      );
    }

    return {
      success: true,
      url: resultUrl,
    };
  } catch (error) {
    logger.error('Failed to send screenshot to server:', error);
    return { success: false };
  }
};

export default defineBackground({
  main() {
    logger.log('Background script loaded');

    // Function to handle messages
    const messageHandler = async (message: unknown): Promise<boolean> => {
      if (!message || typeof message !== 'object') {
        throw new CaptureError('Invalid message format');
      }

      // Handle screenshot capture request
      if (
        'type' in message &&
        message.type === 'CAPTURE_SCREENSHOT' &&
        'area' in message
      ) {
        const captureMessage = message as CaptureMessage;

        try {
          // Capture the screenshot with more detailed logging
          logger.log('Starting screenshot capture...');
          const fullScreenshot = await captureVisibleTab();
          logger.log('Full screenshot captured successfully');

          // Log area dimensions for debugging
          const area = captureMessage.area;
          logger.log('Cropping area:', {
            x: area.x,
            y: area.y,
            width: area.width,
            height: area.height,
          });

          // Crop to selection with more detailed error handling
          try {
            const croppedScreenshot = await cropScreenshot(
              fullScreenshot,
              captureMessage.area
            );
            logger.log('Screenshot cropped successfully');

            // Send to server
            const result = await sendScreenshotToServer(croppedScreenshot);

            // Log the response and open in new tab
            if (result && result.success) {
              logger.log('Server response:', result);
              logger.log('Response URL:', result.url);

              // Show notification with the URL
              browser.notifications.create({
                type: 'basic',
                iconUrl: browser.runtime.getURL('icon/48.png'),
                title: 'Screenshot Shared',
                message: 'Screenshot uploaded successfully!',
              });

              // Open the URL in a new tab
              if (result.url) {
                // The URL is already properly formatted by sendScreenshotToServer
                browser.tabs.create({ url: result.url });
              }
            } else {
              // Show error notification
              browser.notifications.create({
                type: 'basic',
                iconUrl: browser.runtime.getURL('icon/48.png'),
                title: 'Upload Failed',
                message: 'Failed to send screenshot to server.',
              });
            }

            return result.success;
          } catch (cropError) {
            logger.error('Error cropping screenshot:', cropError);
            // Instead of failing completely, let's try sending the full screenshot
            logger.log('Attempting to send full screenshot instead...');
            try {
              const result = await sendScreenshotToServer(fullScreenshot);
              if (result.success) {
                // Show notification for the fallback
                browser.notifications.create({
                  type: 'basic',
                  iconUrl: browser.runtime.getURL('icon/48.png'),
                  title: 'Screenshot Shared (Full Page)',
                  message: 'Full screenshot uploaded as fallback.',
                });

                // Open the URL in a new tab
                if (result.url) {
                  // The URL is already properly formatted by sendScreenshotToServer
                  browser.tabs.create({ url: result.url });
                }
                return true;
              }
            } catch (sendError) {
              logger.error('Failed to send full screenshot:', sendError);
            }
            return false;
          }
        } catch (error) {
          if (error instanceof CaptureError) {
            logger.error('Error capturing screenshot:', error.message);
            return false;
          }
          if (error instanceof Error) {
            logger.error('Error in background script:', error.message);
          }
          throw error;
        }
      }

      throw new CaptureError('Unknown message type');
    };

    // Register message handler
    browser.runtime.onMessage.addListener(messageHandler);

    // Listen for browser action click
    browser.action.onClicked.addListener(async (tab: browser.Tabs.Tab) => {
      if (!tab.id) return;

      try {
        await browser.tabs.sendMessage(tab.id, { action: 'START_SELECTION' });
      } catch (error) {
        logger.error('Failed to start selection:', error);
      }
    });
  },
});
