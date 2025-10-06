// Store curtain state per domain (persisted in chrome.storage.local)
let blockedDomains = {};

// Load blocked domains from storage on startup
chrome.storage.local.get(['blockedDomains'], (result) => {
  blockedDomains = result.blockedDomains || {};
});

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

// Save blocked domains to persistent storage
function saveBlockedDomains() {
  chrome.storage.local.set({ blockedDomains });
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setState') {
    const url = sender.tab?.url || message.url;
    const tabId = sender.tab?.id;
    const domain = extractDomain(url);

    if (domain) {
      // Store state by domain
      blockedDomains[domain] = message.state;
      saveBlockedDomains();

      // Mute or unmute the current tab only
      if (tabId && message.mute !== undefined) {
        chrome.tabs.update(tabId, { muted: message.mute });
      }

      // Notify OTHER tabs with same domain to update their state (exclude sender)
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id !== tabId && tab.url && extractDomain(tab.url) === domain) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'updateState',
              state: message.state
            }).catch(() => {}); // Ignore errors for tabs that don't have content script
          }
        });
      });

      sendResponse({ success: true });
    }
  } else if (message.action === 'getState') {
    const url = sender.tab?.url || message.url;
    const domain = extractDomain(url);

    if (domain) {
      const state = blockedDomains[domain] || false;
      sendResponse({ state });
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
