// Detect platform for keyboard shortcut display
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const shortcutText = isMac ? 'Command+Shift+H' : 'Ctrl+Shift+H';
document.getElementById('shortcut').textContent = shortcutText;

// Get current tab state and update UI
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.runtime.sendMessage({ action: 'getState', tabId: tabs[0].id }, (response) => {
      const statusEl = document.getElementById('status');
      const isBlocked = response && response.state === true;

      if (isBlocked) {
        statusEl.textContent = '🚫 This page is blocked';
        statusEl.className = 'status blocked';
      } else {
        statusEl.textContent = '✓ This page is visible';
        statusEl.className = 'status visible';
      }
    });
  }
});

// Toggle button handler
document.getElementById('toggleBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleCurtain' }, () => {
        // Close popup after toggling
        window.close();
      });
    }
  });
});
