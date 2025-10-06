(function() {
  'use strict';

  let curtainState = null; // null = unknown, true = shown, false = hidden

  // Create curtain overlay
  function createCurtain() {
    if (document.getElementById('curtain-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'curtain-overlay';
    overlay.innerHTML = `
      <div id="curtain-message">Curtain closed</div>
      <button id="curtain-reveal-btn">Reveal Page</button>
    `;
    document.documentElement.appendChild(overlay);

    document.getElementById('curtain-reveal-btn').addEventListener('click', () => {
      hideCurtain();
    });
  }

  // Create floating hide button
  function createHideButton() {
    if (document.getElementById('curtain-hide-btn')) return;

    const hideBtn = document.createElement('button');
    hideBtn.id = 'curtain-hide-btn';
    hideBtn.textContent = 'Hide Page';
    hideBtn.className = 'hidden';
    document.documentElement.appendChild(hideBtn);

    hideBtn.addEventListener('click', () => {
      showCurtain();
    });
  }

  // Show curtain
  function showCurtain() {
    curtainState = true;
    const overlay = document.getElementById('curtain-overlay');
    const hideBtn = document.getElementById('curtain-hide-btn');

    if (overlay) overlay.classList.remove('hidden');
    if (hideBtn) hideBtn.classList.add('hidden');

    // Save state
    chrome.runtime.sendMessage({ action: 'setState', tabId: 'current', state: true });
  }

  // Hide curtain
  function hideCurtain() {
    curtainState = false;
    const overlay = document.getElementById('curtain-overlay');
    const hideBtn = document.getElementById('curtain-hide-btn');

    if (overlay) overlay.classList.add('hidden');
    if (hideBtn) hideBtn.classList.remove('hidden');

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
    createHideButton();

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
