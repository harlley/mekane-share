import { defineContentScript } from "wxt/sandbox";
import React from "react";
import ReactDOM from "react-dom/client";
import { SelectionOverlay } from "./content/components/SelectionOverlay";
import { SelectionArea, CaptureMessage } from "./shared/types";
import browser from "webextension-polyfill";

// CSS styles for the selection overlay
const selectionOverlayCSS = `
.selection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483647; /* Maximum z-index */
  cursor: crosshair;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.selection-area {
  position: absolute;
  background-color: transparent;
  border: 2px dashed #333;
  box-sizing: border-box;
  pointer-events: none;
}

.selection-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 2147483648;
}

.selection-controls button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.selection-controls button:hover {
  background-color: #2980b9;
}

.selection-controls button:last-child {
  background-color: #e74c3c;
}

.selection-controls button:last-child:hover {
  background-color: #c0392b;
}

.instructions {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  z-index: 2147483648;
}
`;

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Listen for messages from popup
    browser.runtime.onMessage.addListener(
      (message: unknown, sender: browser.Runtime.MessageSender) => {
        if (
          message &&
          typeof message === "object" &&
          "action" in message &&
          message.action === "START_SELECTION"
        ) {
          injectSelectionOverlay();
        }
        return true;
      }
    );
  },
});

// Keep track of the React root instance
let reactRoot: ReactDOM.Root | null = null;

/**
 * Injects the selection overlay into the page
 */
const injectSelectionOverlay = () => {
  console.log("[Mekane-Content] Injecting selection overlay");

  // Create a container for our React component
  const overlayContainer = document.createElement("div");
  overlayContainer.id = "mekane-selection-overlay-container";
  document.body.appendChild(overlayContainer);

  // Create a shadow root to isolate our styles
  const shadowRoot = overlayContainer.attachShadow({ mode: "open" });

  // Create a container inside shadow root
  const shadowContainer = document.createElement("div");
  shadowContainer.style.position = "relative";
  shadowContainer.style.zIndex = "2147483647";
  shadowRoot.appendChild(shadowContainer);

  // Add styles directly to shadow DOM
  const style = document.createElement("style");
  style.textContent = `
    ${selectionOverlayCSS}
    .selection-controls {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 2147483648;
    }
    
    .selection-controls button {
      all: initial;
      font-family: system-ui, -apple-system, sans-serif;
      display: inline-block;
      padding: 8px 16px;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
      pointer-events: auto;
      user-select: none;
      z-index: 2147483648;
    }
    
    .selection-controls .capture-button {
      background-color: #3498db;
    }
    
    .selection-controls .capture-button:hover {
      background-color: #2980b9;
    }
    
    .selection-controls .cancel-button {
      background-color: #e74c3c;
    }
    
    .selection-controls .cancel-button:hover {
      background-color: #c0392b;
    }
  `;
  shadowRoot.appendChild(style);

  // Mount React component and store the root instance
  reactRoot = ReactDOM.createRoot(shadowContainer);
  reactRoot.render(
    <React.StrictMode>
      <SelectionOverlay
        onSelectionComplete={handleSelectionComplete}
        onCancel={removeOverlay}
      />
    </React.StrictMode>
  );

  console.log("[Mekane-Content] Selection overlay injected");
};

/**
 * Handles the completed selection
 */
const handleSelectionComplete = (area: SelectionArea) => {
  console.log("[Mekane-Content] Starting screenshot capture");
  console.log("[Mekane-Content] Area to capture:", area);

  // Send message to background script to capture screenshot
  const message: CaptureMessage = {
    type: "CAPTURE_SCREENSHOT",
    area,
  };

  console.log(
    "[Mekane-Content] Sending message to background script:",
    message
  );

  // Don't remove the overlay immediately - wait for the response
  browser.runtime
    .sendMessage(message)
    .then((response) => {
      console.log("[Mekane-Content] Background script response:", response);
      if (response === true) {
        console.log("[Mekane-Content] Screenshot captured successfully");
        // Only remove overlay after successful capture
        removeOverlay();
      } else {
        console.error("[Mekane-Content] Screenshot capture failed:", response);
        // Show the overlay again in case of failure
        const overlayContainer = document.getElementById(
          "mekane-selection-overlay-container"
        );
        if (overlayContainer?.shadowRoot) {
          const overlay =
            overlayContainer.shadowRoot.querySelector(".selection-overlay");
          if (overlay instanceof HTMLElement) {
            overlay.style.visibility = "visible";
          }
        }
        // Keep the overlay visible for a moment to show the error state
        setTimeout(() => {
          console.error(
            "[Mekane-Content] Removing overlay after capture failure"
          );
          removeOverlay();
        }, 1000);
      }
    })
    .catch((error) => {
      console.error("[Mekane-Content] Error sending capture message:", error);
      // Try to get more details about the error
      console.error("[Mekane-Content] Error details:", {
        message: error.message,
        stack: error.stack,
        runtime: browser.runtime.lastError,
      });
      // Show the overlay again in case of error
      const overlayContainer = document.getElementById(
        "mekane-selection-overlay-container"
      );
      if (overlayContainer?.shadowRoot) {
        const overlay =
          overlayContainer.shadowRoot.querySelector(".selection-overlay");
        if (overlay instanceof HTMLElement) {
          overlay.style.visibility = "visible";
        }
      }
      // Keep the overlay visible for a moment to show the error state
      setTimeout(() => {
        console.error("[Mekane-Content] Removing overlay after capture error");
        removeOverlay();
      }, 1000);
    });
};

/**
 * Removes the selection overlay from the page
 */
const removeOverlay = () => {
  console.log("[Mekane-Content] removeOverlay called");
  console.log("[Mekane-Content] Current reactRoot:", !!reactRoot);
  console.log(
    "[Mekane-Content] Document body children:",
    document.body.children.length
  );

  try {
    // First, try to unmount React
    if (reactRoot) {
      console.log("[Mekane-Content] Unmounting React root");
      try {
        reactRoot.unmount();
        console.log("[Mekane-Content] React root unmount successful");
      } catch (unmountError) {
        console.error(
          "[Mekane-Content] Error unmounting React root:",
          unmountError
        );
      }
      reactRoot = null;
    } else {
      console.log("[Mekane-Content] No React root to unmount");
    }

    // Then find and remove the container
    const overlayContainer = document.getElementById(
      "mekane-selection-overlay-container"
    );
    console.log(
      "[Mekane-Content] Found overlay container:",
      !!overlayContainer
    );

    if (overlayContainer) {
      try {
        // Remove all event listeners
        const shadowRoot = overlayContainer.shadowRoot;
        if (shadowRoot) {
          console.log("[Mekane-Content] Found shadow root");
          const container = shadowRoot.firstElementChild;
          if (container) {
            console.log("[Mekane-Content] Found container in shadow root");
            const clone = container.cloneNode(true);
            container.parentNode?.replaceChild(clone, container);
            console.log("[Mekane-Content] Replaced container with clone");
          }
        }

        // Remove the container itself
        document.body.removeChild(overlayContainer);
        console.log("[Mekane-Content] Container removed from document body");
      } catch (removeError) {
        console.error(
          "[Mekane-Content] Error removing container:",
          removeError
        );
      }
    }

    // Force cleanup of any remaining overlay elements
    const remainingOverlays = document.querySelectorAll(
      '[id="mekane-selection-overlay-container"]'
    );
    console.log(
      "[Mekane-Content] Found remaining overlays:",
      remainingOverlays.length
    );
    remainingOverlays.forEach((overlay) => {
      try {
        document.body.removeChild(overlay);
        console.log("[Mekane-Content] Removed remaining overlay");
      } catch (error) {
        console.error(
          "[Mekane-Content] Error removing remaining overlay:",
          error
        );
      }
    });
  } catch (error) {
    console.error("[Mekane-Content] Fatal error in removeOverlay:", error);
  }

  // Final verification
  const finalCheck = document.getElementById(
    "mekane-selection-overlay-container"
  );
  console.log("[Mekane-Content] Final check - overlay exists:", !!finalCheck);
};
