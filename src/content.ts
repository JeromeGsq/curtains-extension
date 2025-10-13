(() => {
  let curtainState: boolean | null = null; // null = unknown, true = shown, false = hidden
  let shadowRoot: ShadowRoot | null = null;
  let themePreference: 'light' | 'dark' | 'system' = 'system';
  let buttonPosition:
    | 'bottom-left'
    | 'bottom-right'
    | 'top-left'
    | 'top-right' = 'bottom-left';

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
    /* Base styles */
    #curtain-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
      text-align: center;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    #curtain-motivation {
      font-size: 16px;
      font-style: italic;
      text-align: center;
      margin-bottom: 30px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    #curtain-resume-btn {
      border: none;
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    /* Docked toggle button */
    #curtain-toggle-btn {
      position: fixed;
      color: white;
      border: none;
      padding: 12px 16px;
      cursor: pointer;
      z-index: 2147483648;
      transition: transform 0.3s ease, background 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Position: bottom-left (default) */
    #curtain-toggle-btn.position-bottom-left {
      bottom: 0;
      left: 0;
      border-top-right-radius: 8px;
      transform: translateX(-100%);
    }

    #curtain-toggle-btn.position-bottom-left:hover,
    #curtain-toggle-btn.position-bottom-left.visible {
      transform: translateX(0);
    }

    /* Position: bottom-right */
    #curtain-toggle-btn.position-bottom-right {
      bottom: 0;
      right: 0;
      border-top-left-radius: 8px;
      transform: translateX(100%);
    }

    #curtain-toggle-btn.position-bottom-right:hover,
    #curtain-toggle-btn.position-bottom-right.visible {
      transform: translateX(0);
    }

    /* Position: top-left */
    #curtain-toggle-btn.position-top-left {
      top: 0;
      left: 0;
      border-bottom-right-radius: 8px;
      transform: translateX(-100%);
    }

    #curtain-toggle-btn.position-top-left:hover,
    #curtain-toggle-btn.position-top-left.visible {
      transform: translateX(0);
    }

    /* Position: top-right */
    #curtain-toggle-btn.position-top-right {
      top: 0;
      right: 0;
      border-bottom-left-radius: 8px;
      transform: translateX(100%);
    }

    #curtain-toggle-btn.position-top-right:hover,
    #curtain-toggle-btn.position-top-right.visible {
      transform: translateX(0);
    }

    #curtain-toggle-btn img {
      width: 20px;
      height: 20px;
    }

    /* Hover trigger area */
    #curtain-hover-trigger {
      position: fixed;
      width: 50px;
      height: 100px;
      z-index: 2147483647;
      pointer-events: auto;
    }

    #curtain-hover-trigger.position-bottom-left {
      bottom: 0;
      left: 0;
    }

    #curtain-hover-trigger.position-bottom-right {
      bottom: 0;
      right: 0;
    }

    #curtain-hover-trigger.position-top-left {
      top: 0;
      left: 0;
    }

    #curtain-hover-trigger.position-top-right {
      top: 0;
      right: 0;
    }

    /* Light theme */
    .theme-light #curtain-overlay {
      background: #f5f5f5;
    }

    .theme-light #curtain-message {
      color: #1a1a1a;
    }

    .theme-light #curtain-motivation {
      color: #666666;
    }

    .theme-light #curtain-resume-btn {
      background: #1a1a1a;
      color: #ffffff;
    }

    .theme-light #curtain-resume-btn:hover {
      background: #333333;
    }

    .theme-light #curtain-toggle-btn {
      background: rgba(0, 0, 0, 0.8);
    }

    .theme-light #curtain-toggle-btn:hover,
    .theme-light #curtain-toggle-btn.visible {
      background: rgba(0, 0, 0, 0.95);
    }

    .theme-light #curtain-toggle-btn img {
      filter: invert(1);
    }

    /* Dark theme */
    .theme-dark #curtain-overlay {
      background: #1a1a1a;
    }

    .theme-dark #curtain-message {
      color: #ffffff;
    }

    .theme-dark #curtain-motivation {
      color: #a0a0a0;
    }

    .theme-dark #curtain-resume-btn {
      background: #e0e0e0;
      color: #1a1a1a;
    }

    .theme-dark #curtain-resume-btn:hover {
      background: #f5f5f5;
    }

    .theme-dark #curtain-toggle-btn {
      background: rgba(255, 255, 255, 0.15);
    }

    .theme-dark #curtain-toggle-btn:hover,
    .theme-dark #curtain-toggle-btn.visible {
      background: rgba(255, 255, 255, 0.25);
    }

    .theme-dark #curtain-toggle-btn img {
      filter: invert(0);
    }

    /* System theme - follows OS preference */
    .theme-system #curtain-overlay {
      background: #f5f5f5;
    }

    .theme-system #curtain-message {
      color: #1a1a1a;
    }

    .theme-system #curtain-motivation {
      color: #666666;
    }

    .theme-system #curtain-resume-btn {
      background: #1a1a1a;
      color: #ffffff;
    }

    .theme-system #curtain-resume-btn:hover {
      background: #333333;
    }

    .theme-system #curtain-toggle-btn {
      background: rgba(0, 0, 0, 0.8);
    }

    .theme-system #curtain-toggle-btn:hover,
    .theme-system #curtain-toggle-btn.visible {
      background: rgba(0, 0, 0, 0.95);
    }

    .theme-system #curtain-toggle-btn img {
      filter: invert(1);
    }

    @media (prefers-color-scheme: dark) {
      .theme-system #curtain-overlay {
        background: #1a1a1a;
      }

      .theme-system #curtain-message {
        color: #ffffff;
      }

      .theme-system #curtain-motivation {
        color: #a0a0a0;
      }

      .theme-system #curtain-resume-btn {
        background: #e0e0e0;
        color: #1a1a1a;
      }

      .theme-system #curtain-resume-btn:hover {
        background: #f5f5f5;
      }

      .theme-system #curtain-toggle-btn {
        background: rgba(255, 255, 255, 0.15);
      }

      .theme-system #curtain-toggle-btn:hover,
      .theme-system #curtain-toggle-btn.visible {
        background: rgba(255, 255, 255, 0.25);
      }

      .theme-system #curtain-toggle-btn img {
        filter: invert(0);
      }
    }
  `;

  // Apply theme to shadow root
  function applyTheme(theme: 'light' | 'dark' | 'system'): void {
    if (!shadowRoot) return;
    themePreference = theme;

    // Find the theme container (div that wraps the overlay)
    const container = shadowRoot.querySelector('div[class*="theme-"]');

    if (container) {
      container.classList.remove('theme-light', 'theme-dark', 'theme-system');
      container.classList.add(`theme-${theme}`);
    }
  }

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

    // Create container with theme class
    const container = document.createElement('div');
    container.classList.add(`theme-${themePreference}`);

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
    container.appendChild(overlay);
    shadowRoot.appendChild(container);
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

    // Find the theme container
    const container = shadowRoot.querySelector('div[class*="theme-"]');
    if (!container) return;

    // Get position class
    const positionClass = `position-${buttonPosition}`;

    // Create hover trigger area
    const hoverTrigger = document.createElement('div');
    hoverTrigger.id = 'curtain-hover-trigger';
    hoverTrigger.className = positionClass;
    hoverTrigger.style.pointerEvents = 'auto'; // Enable pointer events

    // Create button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'curtain-toggle-btn';
    toggleBtn.className = positionClass;
    toggleBtn.style.pointerEvents = 'auto'; // Enable pointer events
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

    container.appendChild(hoverTrigger);
    container.appendChild(toggleBtn);

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
    // First, load theme and position preferences
    try {
      chrome.runtime.sendMessage({ action: 'getTheme' }, (themeResponse) => {
        if (themeResponse && themeResponse.theme) {
          themePreference = themeResponse.theme;
        }

        // Load button position preference from storage
        chrome.storage.local.get(['buttonPosition'], (positionResult) => {
          if (positionResult.buttonPosition) {
            buttonPosition = positionResult.buttonPosition;
          }

          // Now create curtain with the correct theme and position
          createCurtain();
          createToggleButton();

          // Request saved state from service worker
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
        });
      });
    } catch (_e) {
      console.log(
        'Curtains: Extension context invalidated, defaulting to visible'
      );
      // Fallback: create with default theme
      createCurtain();
      createToggleButton();
      hideCurtain(true);
    }
  }

  // Listen for messages from service worker
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'toggleCurtain') {
      toggleCurtain();
      sendResponse({ success: true });
      return true;
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
      return true;
    } else if (message.action === 'updateTheme') {
      // Update theme when user changes preference in popup
      if (message.theme) {
        applyTheme(message.theme);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
      return true;
    } else if (message.action === 'updateButtonPosition') {
      // Update button position
      if (!shadowRoot) {
        sendResponse({ success: false });
        return true;
      }

      if (message.position) {
        buttonPosition = message.position;

        const positionClass = `position-${buttonPosition}`;
        const toggleBtn = shadowRoot.getElementById('curtain-toggle-btn');
        const hoverTrigger = shadowRoot.getElementById('curtain-hover-trigger');

        if (toggleBtn) {
          // Remove all position classes
          toggleBtn.className = '';
          // Add new position class (and preserve 'visible' class if it exists)
          toggleBtn.classList.add(positionClass);
        }

        if (hoverTrigger) {
          hoverTrigger.className = positionClass;
        }
      }

      sendResponse({ success: true });
      return true;
    }
    return true;
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCurtain);
  } else {
    initializeCurtain();
  }
})();
