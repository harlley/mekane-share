import { defineContentScript } from 'wxt/sandbox';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { SelectionOverlay } from './content/components/SelectionOverlay';
import { SelectionArea, CaptureMessage } from './shared/types';
import browser from 'webextension-polyfill';
import { logger } from './shared/services/logger';
import {
  getServerBaseUrl,
  updateServerBaseUrl,
} from './shared/services/settings';

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

const fabStyles = `
.mekane-fab-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 2147483649;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  border-radius: 28px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mekane-fab-container.collapsed {
  width: 56px;
  overflow: hidden;
}

.mekane-fab-container.expanded {
  width: auto;
  min-width: 320px;
  padding-left: 12px;
}

.mekane-fab-toggle {
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.mekane-fab-toggle:hover {
  background: #2980b9;
}

.mekane-fab-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
  opacity: 0;
  width: 0;
  transition: all 0.3s ease;
}

.expanded .mekane-fab-content {
  opacity: 1;
  width: auto;
}

.mekane-fab-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  padding: 8px;
  min-width: 200px;
  outline: none;
}

.mekane-fab-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.mekane-fab-capture {
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.mekane-fab-capture:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
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
    injectFAB();
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

function injectFAB() {
  if (document.getElementById('mekane-fab-container')) return;
  const fabContainer = document.createElement('div');
  fabContainer.id = 'mekane-fab-container';
  document.body.appendChild(fabContainer);
  const shadow = fabContainer.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = fabStyles;
  shadow.appendChild(style);
  const reactDiv = document.createElement('div');
  shadow.appendChild(reactDiv);
  ReactDOM.createRoot(reactDiv).render(<InlineFAB />);
}

const InlineFAB: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [serverBaseUrl, setServerBaseUrl] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const url = await getServerBaseUrl();
      setServerBaseUrl(url);
    };
    loadSettings();
  }, []);

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setServerBaseUrl(newUrl);
    await updateServerBaseUrl(newUrl);
  };

  const handleCaptureClick = async () => {
    try {
      injectSelectionOverlay();
      setExpanded(false);
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error in FAB:', error.message);
      }
    }
  };

  return (
    <div
      className={`mekane-fab-container ${expanded ? 'expanded' : 'collapsed'}`}
    >
      <button
        className="mekane-fab-toggle"
        title={expanded ? 'Collapse' : 'Open Mekane Share'}
        onClick={() => setExpanded(!expanded)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {expanded ? (
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          ) : (
            <path
              d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
              fill="currentColor"
            />
          )}
        </svg>
      </button>
      <div className="mekane-fab-content">
        <input
          type="text"
          value={serverBaseUrl}
          onChange={handleUrlChange}
          placeholder="http://localhost:8787"
          className="mekane-fab-input"
        />
        <button className="mekane-fab-capture" onClick={handleCaptureClick}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.8 12 8.8C10.2327 8.8 8.8 10.2327 8.8 12C8.8 13.7673 10.2327 15.2 12 15.2Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 3C8.73478 3 8.48043 3.10536 8.29289 3.29289L7 4.58579C6.81246 4.77332 6.55811 4.87868 6.29289 4.87868H5C3.89543 4.87868 3 5.77411 3 6.87868V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6.87868C21 5.77411 20.1046 4.87868 19 4.87868H17.7071C17.4419 4.87868 17.1875 4.77332 17 4.58579L15.7071 3.29289C15.5196 3.10536 15.2652 3 15 3H9ZM12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
