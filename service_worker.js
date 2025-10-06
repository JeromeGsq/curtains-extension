// Store curtain state per tab
const tabStates = new Map();

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setState') {
    const tabId = sender.tab?.id;
    if (tabId) {
      tabStates.set(tabId, message.state);

      // Mute or unmute the tab based on the message
      if (message.mute !== undefined) {
        chrome.tabs.update(tabId, { muted: message.mute });
      }

      sendResponse({ success: true });
    }
  } else if (message.action === 'getState') {
    // Handle both content script (sender.tab.id) and popup (message.tabId) requests
    const tabId = sender.tab?.id || message.tabId;
    if (tabId) {
      const state = tabStates.get(tabId);
      sendResponse({ state: state !== undefined ? state : false }); // default to false (curtain hidden, website visible)
    } else {
      sendResponse({ state: false });
    }
  }
  return true; // Keep message channel open for async response
});

// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-curtain') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleCurtain' });
      }
    });
  }
});

// Clean up state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
});
