(() => {
  let curtainState: boolean | null = null; // null = unknown, true = shown, false = hidden
  let shadowRoot: ShadowRoot | null = null;

  // Motivational phrases
  const motivationalPhrases = [
    'Take a deep breath — peace starts here.',
    "You're doing great. Keep going at your own pace.",
    'Silence is strength. Rest your mind for a moment.',
    'Small steps still move you forward.',
    "You've come farther than you think.",
    'Focus on what matters — let go of the noise.',
    'Progress, not perfection.',
    'You deserve a pause — breathe and reset.',
    'Calm is a superpower.',
    'Every moment is a chance to start fresh.',
    'Good things grow slowly.',
    'Your future self will thank you for taking this break.',
    'The best view comes after the hardest climb.',
    "Peace is not a place, it's a practice.",
    'You are enough, exactly as you are.',
    'Recharge, then return stronger.',
    'Be kind to yourself today.',
    'Focus is freedom — distractions can wait.',
    'You control the curtain. You control your time.',
  ];

  // CSS styles (embedded in Shadow DOM)
  const styles = `
    /* Curtain overlay */
    #curtain-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #2c2c2c;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    #curtain-overlay.hidden {
      display: none;
    }

    #curtain-content {
      text-align: center;
    }

    #curtain-message {
      font-size: 28px;
      color: #ffffff;
      text-align: center;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    #curtain-motivation {
      font-size: 16px;
      color: #a0a0a0;
      font-style: italic;
      text-align: center;
      margin-bottom: 30px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    #curtain-resume-btn {
      background: #e0e0e0;
      color: #1a1a1a;
      border: none;
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    #curtain-resume-btn:hover {
      background: #f5f5f5;
    }

    /* Docked toggle button */
    #curtain-toggle-btn {
      position: fixed;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border: none;
      padding: 12px 16px;
      cursor: pointer;
      z-index: 2147483648;
      transition: transform 0.3s ease, background 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
      border-top-right-radius: 8px;
      transform: translateX(-100%);
    }

    #curtain-toggle-btn:hover,
    #curtain-toggle-btn.visible {
      transform: translateX(0);
      background: rgba(0, 0, 0, 0.95);
    }

    #curtain-toggle-btn img {
      width: 20px;
      height: 20px;
      filter: invert(1);
    }

    /* Hover trigger area */
    #curtain-hover-trigger {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 100px;
      z-index: 2147483647;
      pointer-events: auto;
    }
  `;

  // Create curtain overlay (start hidden by default to prevent flash)
  function createCurtain(): void {
    if (document.getElementById('curtain-shadow-host')) return;

    // Create shadow host
    const shadowHost = document.createElement('div');
    shadowHost.id = 'curtain-shadow-host';
    shadowHost.style.cssText =
      'all: initial; position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647;';

    // Attach shadow DOM
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    // Add styles to shadow DOM
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    shadowRoot.appendChild(styleElement);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'curtain-overlay';
    overlay.className = 'hidden';
    overlay.style.pointerEvents = 'auto';

    const contentDiv = document.createElement('div');
    contentDiv.id = 'curtain-content';

    const messageDiv = document.createElement('div');
    messageDiv.id = 'curtain-message';
    messageDiv.textContent = 'This site is blocked';

    const lineBreak = document.createElement('br');
    messageDiv.appendChild(lineBreak);

    const secondLine = document.createTextNode('so you can focus on your work');
    messageDiv.appendChild(secondLine);

    // Random motivational phrase
    const motivationDiv = document.createElement('div');
    motivationDiv.id = 'curtain-motivation';
    const randomPhrase =
      motivationalPhrases[
        Math.floor(Math.random() * motivationalPhrases.length)
      ];
    motivationDiv.textContent = randomPhrase;

    const resumeBtn = document.createElement('button');
    resumeBtn.id = 'curtain-resume-btn';
    resumeBtn.textContent = 'Resume';
    resumeBtn.addEventListener('click', () => {
      toggleCurtain();
    });

    contentDiv.appendChild(messageDiv);
    contentDiv.appendChild(motivationDiv);
    contentDiv.appendChild(resumeBtn);
    overlay.appendChild(contentDiv);
    shadowRoot.appendChild(overlay);
    document.documentElement.appendChild(shadowHost);
  }

  // Helper to create image element for button
  function createButtonImage(iconPath: string): HTMLImageElement {
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL(iconPath);
    img.alt = 'Toggle';
    return img;
  }

  // Create docked toggle button with hover trigger
  function createToggleButton(): void {
    if (!shadowRoot || shadowRoot.getElementById('curtain-toggle-btn')) return;

    // Create hover trigger area
    const hoverTrigger = document.createElement('div');
    hoverTrigger.id = 'curtain-hover-trigger';

    // Create button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'curtain-toggle-btn';
    toggleBtn.appendChild(createButtonImage('icons/hidden-48.png'));

    // Add hover trigger functionality
    hoverTrigger.addEventListener('mouseenter', () => {
      toggleBtn.classList.add('visible');
    });

    hoverTrigger.addEventListener('mouseleave', () => {
      toggleBtn.classList.remove('visible');
    });

    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.classList.add('visible');
    });

    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.classList.remove('visible');
    });

    shadowRoot.appendChild(hoverTrigger);
    shadowRoot.appendChild(toggleBtn);

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

  // Update motivational phrase with a random one
  function updateMotivationalPhrase(): void {
    if (!shadowRoot) return;
    const motivationDiv = shadowRoot.getElementById('curtain-motivation');
    if (motivationDiv) {
      const randomPhrase =
        motivationalPhrases[
          Math.floor(Math.random() * motivationalPhrases.length)
        ];
      motivationDiv.textContent = randomPhrase;
    }
  }

  // Show curtain
  function showCurtain(): void {
    if (!shadowRoot) return;
    curtainState = true;
    const overlay = shadowRoot.getElementById('curtain-overlay');
    const toggleBtn = shadowRoot.getElementById('curtain-toggle-btn');

    // Update motivational phrase each time curtain is shown
    updateMotivationalPhrase();

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
        'Curtains: Extension context invalidated, please reload the page'
      );
    }
  }

  // Hide curtain
  function hideCurtain(skipMessage?: boolean): void {
    if (!shadowRoot) return;
    curtainState = false;
    const overlay = shadowRoot.getElementById('curtain-overlay');
    const toggleBtn = shadowRoot.getElementById('curtain-toggle-btn');

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
          'Curtains: Extension context invalidated, please reload the page'
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
              'Curtains: Extension context invalidated, defaulting to visible'
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
        }
      );
    } catch (_e) {
      console.log(
        'Curtains: Extension context invalidated, defaulting to visible'
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
      if (!shadowRoot) {
        sendResponse({ success: false });
        return;
      }
      curtainState = message.state;
      const overlay = shadowRoot.getElementById('curtain-overlay');
      const toggleBtn = shadowRoot.getElementById('curtain-toggle-btn');

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
    } else if (message.action === 'updateButtonPosition') {
      // Update button position
      if (!shadowRoot) {
        sendResponse({ success: false });
        return;
      }
      const toggleBtn = shadowRoot.getElementById('curtain-toggle-btn');
      if (toggleBtn) {
        toggleBtn.className = `position-${message.position}`;
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
