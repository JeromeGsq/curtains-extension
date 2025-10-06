(function() {
  'use strict';

  let curtainState = null; // null = unknown, true = shown, false = hidden

  // Create curtain overlay (start hidden by default to prevent flash)
  function createCurtain() {
    if (document.getElementById('curtain-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'curtain-overlay';
    overlay.className = 'hidden'; // Start hidden to prevent flash
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
    toggleBtn.innerHTML = '<img src="' + chrome.runtime.getURL('icons/hidden-48.png') + '" alt="Toggle" />';
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
    if (toggleBtn) toggleBtn.innerHTML = '<img src="' + chrome.runtime.getURL('icons/visible-48.png') + '" alt="Toggle" />';

    // Disable scrolling
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Save state and request tab mute
    try {
      chrome.runtime.sendMessage({
        action: 'setState',
        url: window.location.href,
        state: true,
        mute: true
      });
    } catch (e) {
      console.log('Curtains: Extension context invalidated, please reload the page');
    }
  }

  // Hide curtain
  function hideCurtain(skipMessage) {
    curtainState = false;
    const overlay = document.getElementById('curtain-overlay');
    const toggleBtn = document.getElementById('curtain-toggle-btn');

    if (overlay) overlay.classList.add('hidden');
    if (toggleBtn) {
      try {
        toggleBtn.innerHTML = '<img src="' + chrome.runtime.getURL('icons/hidden-48.png') + '" alt="Toggle" />';
      } catch (e) {
        // Extension context invalidated - use fallback emoji
        toggleBtn.innerHTML = '👁️';
      }
    }

    // Re-enable scrolling
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    // Save state and request tab unmute (skip if called from error handler)
    if (!skipMessage) {
      try {
        chrome.runtime.sendMessage({
          action: 'setState',
          url: window.location.href,
          state: false,
          mute: false
        });
      } catch (e) {
        console.log('Curtains: Extension context invalidated, please reload the page');
      }
    }
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
    try {
      chrome.runtime.sendMessage({
        action: 'getState',
        url: window.location.href
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Curtains: Extension context invalidated, defaulting to visible');
          hideCurtain(true);
          return;
        }
        if (response && response.state !== undefined) {
          curtainState = response.state;
          if (curtainState) {
            showCurtain();
          } else {
            hideCurtain(true);
          }
        } else {
          // Default: hide curtain (show website)
          hideCurtain(true);
        }
      });
    } catch (e) {
      console.log('Curtains: Extension context invalidated, defaulting to visible');
      hideCurtain(true);
    }
  }

  // Listen for messages from service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleCurtain') {
      toggleCurtain();
      sendResponse({ success: true });
    } else if (message.action === 'updateState') {
      // Update curtain state when another tab with same domain toggles
      // DON'T send message back to avoid infinite loop
      curtainState = message.state;
      const overlay = document.getElementById('curtain-overlay');
      const toggleBtn = document.getElementById('curtain-toggle-btn');

      if (curtainState) {
        // Show curtain (without sending message)
        if (overlay) overlay.classList.remove('hidden');
        if (toggleBtn) {
          try {
            toggleBtn.innerHTML = '<img src="' + chrome.runtime.getURL('icons/visible-48.png') + '" alt="Toggle" />';
          } catch (e) {
            toggleBtn.innerHTML = '👁️';
          }
        }
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        // Hide curtain (without sending message)
        if (overlay) overlay.classList.add('hidden');
        if (toggleBtn) {
          try {
            toggleBtn.innerHTML = '<img src="' + chrome.runtime.getURL('icons/hidden-48.png') + '" alt="Toggle" />';
          } catch (e) {
            toggleBtn.innerHTML = '👁️';
          }
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
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
