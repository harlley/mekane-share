import React, { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import './App.css';
import { logger } from '../shared/services/logger';
import {
  getServerBaseUrl,
  updateServerBaseUrl,
  resetSettings,
} from '../shared/services/settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'capture' | 'settings'>('capture');
  const [serverBaseUrl, setServerBaseUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    // Load settings when component mounts
    const loadSettings = async () => {
      const url = await getServerBaseUrl();
      setServerBaseUrl(url);
    };

    loadSettings();
  }, []);

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

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');

      await updateServerBaseUrl(serverBaseUrl);

      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings');
      logger.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');

      await resetSettings();
      const url = await getServerBaseUrl();
      setServerBaseUrl(url);

      setSaveMessage('Settings reset to default!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error resetting settings');
      logger.error('Error resetting settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  logger.log('Popup loaded');

  return (
    <div className="app-container">
      <header>
        <h1>Mekane Share</h1>
        <div className="tabs">
          <button
            className={activeTab === 'capture' ? 'active' : ''}
            onClick={() => setActiveTab('capture')}
          >
            Capture
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'capture' ? (
          <>
            <button className="capture-button" onClick={handleCaptureClick}>
              Capture Screenshot
            </button>

            <div className="instruction">
              <p>Click the button above to select an area to capture</p>
            </div>
          </>
        ) : (
          <div className="settings-container">
            <h2>Server Settings</h2>

            <div className="form-group">
              <label htmlFor="serverBaseUrl">Server URL:</label>
              <input
                type="text"
                id="serverBaseUrl"
                value={serverBaseUrl}
                onChange={(e) => setServerBaseUrl(e.target.value)}
                placeholder="https://your-server.com"
                className="server-url-input"
              />
              <p className="help-text">Base URL of your screenshot server</p>
            </div>

            <div className="button-row">
              <button
                className="save-button"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>

              <button
                className="reset-button"
                onClick={handleResetSettings}
                disabled={isSaving}
              >
                Reset to Default
              </button>
            </div>

            {saveMessage && <div className="save-message">{saveMessage}</div>}
          </div>
        )}
      </main>

      <footer>
        <p>Mekane Share v1.0</p>
      </footer>
    </div>
  );
};

export default App;
