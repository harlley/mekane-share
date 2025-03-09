import { defineBackground } from "wxt/sandbox";
import browser from "webextension-polyfill";
import { CaptureMessage } from "./shared/types";
import {
  captureVisibleTab,
  cropScreenshot,
  openScreenshotInNewTab,
} from "./content/services/capture.service";
import { CaptureError } from "./shared/errors/screenshot.errors";

export default defineBackground({
  main() {
    // Function to handle messages
    const messageHandler = async (message: unknown): Promise<boolean> => {
      if (!message || typeof message !== "object") {
        throw new CaptureError("Invalid message format");
      }

      // Handle screenshot capture request
      if (
        "type" in message &&
        message.type === "CAPTURE_SCREENSHOT" &&
        "area" in message
      ) {
        const captureMessage = message as CaptureMessage;

        try {
          // Capture the screenshot
          const fullScreenshot = await captureVisibleTab();

          // Crop to selection
          const croppedScreenshot = await cropScreenshot(
            fullScreenshot,
            captureMessage.area
          );

          // Open in new tab
          await openScreenshotInNewTab(croppedScreenshot);

          return true;
        } catch (error) {
          throw new CaptureError("Screenshot capture failed", error);
        }
      }

      throw new CaptureError("Unknown message type");
    };

    // Register message handler
    browser.runtime.onMessage.addListener(messageHandler);

    // Listen for browser action click
    browser.action.onClicked.addListener(async (tab: browser.Tabs.Tab) => {
      if (!tab.id) return;

      try {
        await browser.tabs.sendMessage(tab.id, { action: "START_SELECTION" });
      } catch (error) {
        console.error("Failed to start selection:", error);
      }
    });
  },
});
