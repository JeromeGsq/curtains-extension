import './content.css';

(() => {
  let curtainState: boolean | null = null; // null = unknown, true = shown, false = hidden

  // Create curtain overlay (start hidden by default to prevent flash)
  function createCurtain(): void {
    if (document.getElementById('curtain-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'curtain-overlay';
    overlay.className = 'hidden'; // Start hidden to prevent flash

    const messageDiv = document.createElement('div');
    messageDiv.id = 'curtain-message';
    messageDiv.textContent = 'This site is blocked';

    const lineBreak = document.createElement('br');
    messageDiv.appendChild(lineBreak);

    const secondLine = document.createTextNode('so you can focus on your work');
    messageDiv.appendChild(secondLine);

    overlay.appendChild(messageDiv);
    document.documentElement.appendChild(overlay);
  }

  // Helper to create image element for button
  function createButtonImage(iconPath: string): HTMLImageElement {
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL(iconPath);
    img.alt = 'Toggle';
    return img;
  }

  // Create floating toggle button
  function createToggleButton(): void {
    if (document.getElementById('curtain-toggle-btn')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'curtain-toggle-btn';
    toggleBtn.appendChild(createButtonImage('icons/hidden-48.png'));
    document.documentElement.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
      toggleCurtain();
    });
  }

  // Update button icon
  function updateButtonIcon(button: HTMLElement, iconPath: string): void {
    button.textContent = ''; // Clear existing content
    try {
      button.appendChild(createButtonImage(iconPath));
    } catch (_e) {
      // Extension context invalidated - use fallback emoji
      button.textContent = '👁️';
    }
  }

  // Show curtain
  function showCurtain(): void {
    curtainState = true;
    const overlay = document.getElementById('curtain-overlay');
    const toggleBtn = document.getElementById('curtain-toggle-btn');

    if (overlay) overlay.classList.remove('hidden');
    if (toggleBtn) updateButtonIcon(toggleBtn, 'icons/visible-48.png');

    // Disable scrolling
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Save state and request tab mute
    try {
      chrome.runtime.sendMessage({
        action: 'setState',
        url: window.location.href,
        state: true,
        mute: true,
      });
    } catch (_e) {
      console.log(
        'Curtains: Extension context invalidated, please reload the page',
      );
    }
  }

  // Hide curtain
  function hideCurtain(skipMessage?: boolean): void {
    curtainState = false;
    const overlay = document.getElementById('curtain-overlay');
    const toggleBtn = document.getElementById('curtain-toggle-btn');

    if (overlay) overlay.classList.add('hidden');
    if (toggleBtn) updateButtonIcon(toggleBtn, 'icons/hidden-48.png');

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
          mute: false,
        });
      } catch (_e) {
        console.log(
          'Curtains: Extension context invalidated, please reload the page',
        );
      }
    }
  }

  // Toggle curtain
  function toggleCurtain(): void {
    if (curtainState === true) {
      hideCurtain();
    } else {
      showCurtain();
    }
  }

  // Initialize curtain based on saved state
  function initializeCurtain(): void {
    createCurtain();
    createToggleButton();

    // Request saved state from service worker
    try {
      chrome.runtime.sendMessage(
        {
          action: 'getState',
          url: window.location.href,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.log(
              'Curtains: Extension context invalidated, defaulting to visible',
            );
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
        },
      );
    } catch (_e) {
      console.log(
        'Curtains: Extension context invalidated, defaulting to visible',
      );
      hideCurtain(true);
    }
  }

  // Listen for messages from service worker
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
        if (toggleBtn) updateButtonIcon(toggleBtn, 'icons/visible-48.png');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        // Hide curtain (without sending message)
        if (overlay) overlay.classList.add('hidden');
        if (toggleBtn) updateButtonIcon(toggleBtn, 'icons/hidden-48.png');
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
