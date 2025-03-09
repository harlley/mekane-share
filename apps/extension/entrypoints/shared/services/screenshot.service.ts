import { SelectionArea } from "../types";
import browser from "webextension-polyfill";

/**
 * Captures a screenshot of the visible tab
 * @returns Promise with screenshot as data URL
 */
export const captureVisibleTab = async (): Promise<string> => {
  try {
    console.log("[Mekane-Screenshot] Starting capture");

    // First get the current active tab
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    console.log("[Mekane-Screenshot] Found active tab:", tabs[0]?.id);

    if (!tabs[0]?.id) {
      throw new Error("No active tab found");
    }

    // Hide the selection area before capture
    const [hideResult] = await browser.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const overlayContainer = document.getElementById(
          "mekane-selection-overlay-container"
        );
        if (overlayContainer?.shadowRoot) {
          const selectionArea =
            overlayContainer.shadowRoot.querySelector(".selection-area");
          if (selectionArea instanceof HTMLElement) {
            selectionArea.style.display = "none";
          }
        }
      },
    });

    // Wait for UI updates
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture the screenshot
    console.log("[Mekane-Screenshot] Capturing tab");
    const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
      format: "png",
    });

    // Show the selection area again
    await browser.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const overlayContainer = document.getElementById(
          "mekane-selection-overlay-container"
        );
        if (overlayContainer?.shadowRoot) {
          const selectionArea =
            overlayContainer.shadowRoot.querySelector(".selection-area");
          if (selectionArea instanceof HTMLElement) {
            selectionArea.style.display = "";
          }
        }
      },
    });

    console.log("[Mekane-Screenshot] Capture successful");
    return dataUrl;
  } catch (error) {
    console.error("[Mekane-Screenshot] Error capturing screenshot:", error);
    if (error instanceof Error) {
      console.error("[Mekane-Screenshot] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

/**
 * Converts a data URL to a Blob
 */
const dataURLtoBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

/**
 * Converts a Blob to a data URL
 */
const blobToDataURL = async (blob: Blob): Promise<string> => {
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
const createOffscreenCanvas = (
  width: number,
  height: number
): OffscreenCanvas => {
  return new OffscreenCanvas(width, height);
};

/**
 * Gets the device pixel ratio from the content script
 */
const getDevicePixelRatio = async (): Promise<number> => {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab.id) throw new Error("No active tab found");

    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return window.devicePixelRatio;
      },
    });

    const dpr = results[0]?.result;
    return typeof dpr === "number" ? dpr : 1;
  } catch (error) {
    console.warn(
      "[Mekane-Screenshot] Error getting device pixel ratio:",
      error
    );
    return 1;
  }
};

/**
 * Crops a screenshot to the selected area
 * @param screenshotUrl - Data URL of the full screenshot
 * @param area - Selected area to crop
 * @returns Promise with cropped screenshot as data URL
 */
export const cropScreenshot = async (
  screenshotUrl: string,
  area: SelectionArea
): Promise<string> => {
  console.log("[Mekane-Screenshot] Starting crop");
  console.log("[Mekane-Screenshot] Area:", area);

  try {
    // Get the device pixel ratio
    const dpr = await getDevicePixelRatio();
    console.log("[Mekane-Screenshot] Device pixel ratio:", dpr);

    // Convert data URL to blob
    const blob = await dataURLtoBlob(screenshotUrl);

    // Create ImageBitmap from blob
    const imageBitmap = await createImageBitmap(blob);
    console.log("[Mekane-Screenshot] Image loaded, dimensions:", {
      width: imageBitmap.width,
      height: imageBitmap.height,
      dpr,
    });

    // Calculate dimensions accounting for device pixel ratio
    const left = Math.round(area.x * dpr);
    const top = Math.round(area.y * dpr);
    const width = Math.round(area.width * dpr);
    const height = Math.round(area.height * dpr);

    console.log("[Mekane-Screenshot] Crop dimensions:", {
      left,
      top,
      width,
      height,
      originalArea: area,
    });

    // Create canvas with the target dimensions (using non-scaled dimensions)
    const canvas = createOffscreenCanvas(area.width, area.height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
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
    const croppedBlob = await canvas.convertToBlob({ type: "image/png" });

    // Convert blob to data URL
    const croppedDataUrl = await blobToDataURL(croppedBlob);

    console.log("[Mekane-Screenshot] Crop successful");
    return croppedDataUrl;
  } catch (error) {
    console.error("[Mekane-Screenshot] Error cropping screenshot:", error);
    if (error instanceof Error) {
      console.error("[Mekane-Screenshot] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

/**
 * Opens a new tab with the captured screenshot
 * @param dataUrl - Data URL of the screenshot
 */
export const openScreenshotInNewTab = async (
  dataUrl: string
): Promise<void> => {
  try {
    console.log("[Mekane-Screenshot] Opening screenshot in new tab");
    await browser.tabs.create({
      url: dataUrl,
    });
    console.log("[Mekane-Screenshot] Tab created successfully");
  } catch (error) {
    console.error("[Mekane-Screenshot] Error opening screenshot:", error);
    throw error;
  }
};
