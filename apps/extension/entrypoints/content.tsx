import { defineContentScript } from 'wxt/sandbox';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SelectionOverlay } from './content/components/SelectionOverlay';
import { SelectionArea, CaptureMessage } from './shared/types';
import browser from 'webextension-polyfill';
import { logger } from './shared/services/logger';

// CSS styles
const overlayStyles = `
.selection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483647;
  cursor: crosshair;
  user-select: none;
}

.overlay-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.selection-area {
  position: absolute;
  background-color: transparent;
  border: 2px dashed #333;
  box-sizing: border-box;
  pointer-events: none;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.selection-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2147483648;
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

const buttonStyles = `
.selection-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2147483648;
}

.control-button {
  all: initial;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 4px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;
}

.control-button:hover {
  background: #2a2a2a;
}

.control-button svg {
  width: 20px;
  height: 20px;
}

.control-button span {
  user-select: none;
}
`;

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener(
      (message: unknown, _sender: browser.Runtime.MessageSender) => {
        if (
          message &&
          typeof message === 'object' &&
          'action' in message &&
          message.action === 'START_SELECTION'
        ) {
          injectSelectionOverlay();
        }
        return true;
      }
    );
    logger.log('Content script loaded');
  },
});

// Keep track of the React root instance
let reactRoot: ReactDOM.Root | null = null;

/**
 * Injects the selection overlay into the page
 */
const injectSelectionOverlay = () => {
  // Create a container for our React component
  const overlayContainer = document.createElement('div');
  overlayContainer.id = 'mekane-selection-overlay-container';
  document.body.appendChild(overlayContainer);

  // Create a shadow root to isolate our styles
  const shadowRoot = overlayContainer.attachShadow({ mode: 'open' });

  // Add styles to shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    ${overlayStyles}
    ${buttonStyles}
  `;
  shadowRoot.appendChild(style);

  // Create a container inside shadow root
  const shadowContainer = document.createElement('div');
  shadowContainer.style.position = 'relative';
  shadowContainer.style.zIndex = '2147483647';
  shadowRoot.appendChild(shadowContainer);

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
};

/**
 * Handles the completed selection
 */
const handleSelectionComplete = (area: SelectionArea) => {
  // Send message to background script to capture screenshot
  const message: CaptureMessage = {
    type: 'CAPTURE_SCREENSHOT',
    area,
  };

  // Don't remove the overlay immediately - wait for the response
  browser.runtime
    .sendMessage(message)
    .then((response) => {
      if (response === true) {
        removeOverlay();
      } else {
        // Show the overlay again in case of failure
        const overlayContainer = document.getElementById(
          'mekane-selection-overlay-container'
        );
        if (overlayContainer?.shadowRoot) {
          const overlay =
            overlayContainer.shadowRoot.querySelector('.selection-overlay');
          if (overlay instanceof HTMLElement) {
            overlay.style.visibility = 'visible';
          }
        }
        // Keep the overlay visible for a moment to show the error state
        setTimeout(removeOverlay, 1000);
      }
    })
    .catch((error) => {
      // Show the overlay again in case of error
      const overlayContainer = document.getElementById(
        'mekane-selection-overlay-container'
      );
      if (overlayContainer?.shadowRoot) {
        const overlay =
          overlayContainer.shadowRoot.querySelector('.selection-overlay');
        if (overlay instanceof HTMLElement) {
          overlay.style.visibility = 'visible';
        }
      }
      // Keep the overlay visible for a moment to show the error state
      setTimeout(removeOverlay, 1000);
      if (error instanceof Error) {
        logger.error('Error in content script:', error.message);
      }
    });
};

/**
 * Removes the selection overlay from the page
 */
const removeOverlay = () => {
  try {
    // First, try to unmount React
    if (reactRoot) {
      reactRoot.unmount();
      reactRoot = null;
    }

    // Then find and remove the container
    const overlayContainer = document.getElementById(
      'mekane-selection-overlay-container'
    );

    if (overlayContainer) {
      // Remove all event listeners
      const shadowRoot = overlayContainer.shadowRoot;
      if (shadowRoot) {
        const container = shadowRoot.firstElementChild;
        if (container) {
          const clone = container.cloneNode(true);
          container.parentNode?.replaceChild(clone, container);
        }
      }

      // Remove the container itself
      document.body.removeChild(overlayContainer);
    }

    // Force cleanup of any remaining overlay elements
    const remainingOverlays = document.querySelectorAll(
      '[id="mekane-selection-overlay-container"]'
    );
    remainingOverlays.forEach((overlay) => {
      document.body.removeChild(overlay);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error removing overlay:', error.message);
    }
  }
};
