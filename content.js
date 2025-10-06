(function() {
  'use strict';

  let curtainState = null; // null = unknown, true = shown, false = hidden

  // Create curtain overlay
  function createCurtain() {
    if (document.getElementById('curtain-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'curtain-overlay';
    overlay.innerHTML = `
      <div id="curtain-message">
        This site is blocked<br>so you can focus on your work
      </div>
    `;
    document.documentElement.appendChild(overlay);
  }

  // Create floating toggle button
  function createToggleButton() {
    if (document.getElementById('curtain-toggle-btn')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'curtain-toggle-btn';
    toggleBtn.innerHTML = '<img src="' + chrome.runtime.getURL('hidden-48.png') + '" alt="Toggle" />';
    document.documentElement.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
      toggleCurtain();
    });
  }

  // Show curtain
  function showCurtain() {
    curtainState = true;
    const overlay = document.getElementById('curtain-overlay');
    const toggleBtn = document.getElementById('curtain-toggle-btn');

    if (overlay) overlay.classList.remove('hidden');
    if (toggleBtn) toggleBtn.innerHTML = '<img src="' + chrome.runtime.getURL('visible-48.png') + '" alt="Toggle" />';

    // Save state
    chrome.runtime.sendMessage({ action: 'setState', tabId: 'current', state: true });
  }

  // Hide curtain
  function hideCurtain() {
    curtainState = false;
    const overlay = document.getElementById('curtain-overlay');
    const toggleBtn = document.getElementById('curtain-toggle-btn');

    if (overlay) overlay.classList.add('hidden');
    if (toggleBtn) toggleBtn.innerHTML = '<img src="' + chrome.runtime.getURL('hidden-48.png') + '" alt="Toggle" />';

    // Save state
    chrome.runtime.sendMessage({ action: 'setState', tabId: 'current', state: false });
  }

  // Toggle curtain
  function toggleCurtain() {
    if (curtainState === true) {
      hideCurtain();
    } else {
      showCurtain();
    }
  }

  // Initialize curtain based on saved state
  function initializeCurtain() {
    createCurtain();
    createToggleButton();

    // Request saved state from service worker
    chrome.runtime.sendMessage({ action: 'getState', tabId: 'current' }, (response) => {
      if (response && response.state !== undefined) {
        curtainState = response.state;
        if (curtainState) {
          showCurtain();
        } else {
          hideCurtain();
        }
      } else {
        // Default: hide curtain (show website)
        hideCurtain();
      }
    });
  }

  // Listen for toggle command from service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleCurtain') {
      toggleCurtain();
      sendResponse({ success: true });
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCurtain);
  } else {
    initializeCurtain();
  }
})();
