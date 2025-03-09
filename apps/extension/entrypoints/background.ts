import { defineBackground } from "wxt/sandbox";
import browser from "webextension-polyfill";
import { CaptureMessage } from "./shared/types";
import {
  captureVisibleTab,
  cropScreenshot,
  openScreenshotInNewTab,
} from "./shared/services/screenshot.service";

console.log("[Mekane-Background] Background script loaded");

// Function to handle messages
const messageHandler = async (
  message: any,
  sender: browser.Runtime.MessageSender
): Promise<boolean> => {
  console.log("[Mekane-Background] Received message:", {
    type: message?.type,
    area: message?.area,
    sender: {
      id: sender.id,
      tabId: sender.tab?.id,
      url: sender.tab?.url,
    },
  });

  if (!message || typeof message !== "object") {
    console.error("[Mekane-Background] Invalid message format");
    return false;
  }

  try {
    // Handle screenshot capture request
    if (message.type === "CAPTURE_SCREENSHOT") {
      console.log("[Mekane-Background] Processing screenshot capture request");

      // Ensure we have a valid sender tab
      if (!sender.tab?.id) {
        console.error("[Mekane-Background] No sender tab ID");
        return false;
      }

      const captureMessage = message as CaptureMessage;
      console.log("[Mekane-Background] Capture area:", captureMessage.area);

      try {
        // Capture the screenshot
        console.log("[Mekane-Background] Capturing full screenshot");
        const fullScreenshot = await captureVisibleTab();
        console.log(
          "[Mekane-Background] Full screenshot captured, length:",
          fullScreenshot.length
        );

        // Crop to selection
        console.log("[Mekane-Background] Cropping screenshot");
        const croppedScreenshot = await cropScreenshot(
          fullScreenshot,
          captureMessage.area
        );
        console.log(
          "[Mekane-Background] Screenshot cropped, length:",
          croppedScreenshot.length
        );

        // Open in new tab
        console.log("[Mekane-Background] Opening screenshot in new tab");
        await openScreenshotInNewTab(croppedScreenshot);
        console.log("[Mekane-Background] Screenshot opened in new tab");

        return true;
      } catch (error) {
        console.error(
          "[Mekane-Background] Error in screenshot process:",
          error
        );
        if (error instanceof Error) {
          console.error("[Mekane-Background] Error details:", {
            message: error.message,
            stack: error.stack,
          });
        }
        return false;
      }
    }

    console.log("[Mekane-Background] Unknown message type:", message.type);
    return false;
  } catch (error) {
    console.error("[Mekane-Background] Error processing message:", error);
    if (error instanceof Error) {
      console.error("[Mekane-Background] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
};

// Register message handler
browser.runtime.onMessage.addListener(messageHandler);

// Export the background script
export default defineBackground({
  main() {
    console.log("[Mekane-Background] Background script initialized");

    // Listen for browser action click
    browser.action.onClicked.addListener(async (tab: browser.Tabs.Tab) => {
      if (!tab.id) return;

      try {
        // Send message to content script to start selection process
        await browser.tabs.sendMessage(tab.id, { action: "START_SELECTION" });
      } catch (error) {
        console.error("[Mekane-Background] Error starting selection:", error);
      }
    });

    console.log("[Mekane-Background] Event listeners registered");
  },
});
