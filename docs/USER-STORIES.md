# User Stories - Mekane Share Extension

## US-001: Screenshot Capture with Area Selection

**As a** extension user  
**I want** to be able to select a specific area of the webpage to capture  
**So that** I can share only the relevant part of the content

### Acceptance Criteria:
1. When I click the extension icon in Chrome, a dark overlay should appear covering the entire current page
2. I should be able to select a rectangular area of the page that will be visible (without the dark overlay)
3. The selected area should be adjustable through resizing
4. After confirming the selection, a screenshot of the chosen area should be generated
5. The screenshot should be displayed in a new browser tab
6. There should be an option to cancel the selection and remove the overlay

### User Flow:
1. User navigates to a webpage
2. User clicks on the extension icon in the Chrome toolbar
3. A dark overlay appears over the entire page
4. User clicks and drags to select the desired area
5. The selected area appears without the overlay (clear)
6. User confirms the selection
7. Screenshot of the selected area is captured
8. A new tab is opened showing the captured screenshot

### Technical Notes:
- Implement in the content script for DOM manipulation
- Use chrome.tabs.captureVisibleTab API for the capture
- Consider performance for large pages
