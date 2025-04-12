import React, { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import './App.css';
import { logger } from '../shared/services/logger';
import {
  getServerBaseUrl,
  updateServerBaseUrl,
} from '../shared/services/settings';

const App: React.FC = () => {
  const [serverBaseUrl, setServerBaseUrl] = useState<string>('');

  useEffect(() => {
    // Load settings when component mounts
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
    // Close the popup
    window.close();

    try {
      // Send message to background script to start the capture process
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const currentTab = tabs[0];

      if (currentTab.id) {
        await browser.tabs.sendMessage(currentTab.id, {
          action: 'START_SELECTION',
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error in popup:', error.message);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="input-group">
        <input
          type="text"
          value={serverBaseUrl}
          onChange={handleUrlChange}
          placeholder="http://localhost:8787"
          className="server-url-input"
        />
        <button className="capture-button" onClick={handleCaptureClick}>
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

export default App;
