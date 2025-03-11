import React from 'react';
import browser from 'webextension-polyfill';
import './App.css';
import { logger } from '../shared/services/logger.service';

const App: React.FC = () => {
  const handleCaptureClick = async () => {
    // Close the popup
    window.close();

    try {
      // Send message to background script to start the capture process
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs[0];

      if (activeTab.id) {
        await browser.tabs.sendMessage(activeTab.id, {
          action: 'START_SELECTION',
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error in popup:', error.message);
      }
    }
  };

  logger.log('Popup loaded');

  return (
    <div className="app-container">
      <header>
        <h1>Mekane Share</h1>
        <p>Capture and share screenshots</p>
      </header>

      <main>
        <button className="capture-button" onClick={handleCaptureClick}>
          Capture Screenshot
        </button>

        <div className="instruction">
          <p>Click the button above to select an area to capture</p>
        </div>
      </main>

      <footer>
        <p>Mekane Share v1.0</p>
      </footer>
    </div>
  );
};

export default App;
