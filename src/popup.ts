// Display version from manifest
const versionElement = document.getElementById('version');
if (versionElement) {
  const manifest = chrome.runtime.getManifest();
  versionElement.textContent = `v${manifest.version}`;
}

// Display the actual configured keyboard shortcut
const shortcutElement = document.getElementById('shortcut');
if (shortcutElement) {
  chrome.commands.getAll((commands) => {
    const toggleCommand = commands.find((cmd) => cmd.name === 'toggle-curtain');

    if (toggleCommand) {
      if (toggleCommand.shortcut) {
        // Convert symbols to text and add separators
        const formatted = toggleCommand.shortcut
          .replace(/⌘/g, '+CMD+')
          .replace(/⇧/g, '+SHIFT+')
          .replace(/⌥/g, '+OPTION+')
          .replace(/⌃/g, '+CTRL+')
          .replace(/\+\+/g, '+') // Remove double +
          .replace(/^\+/, '') // Remove leading +
          .replace(/\+$/, ''); // Remove trailing +
        shortcutElement.textContent = formatted;
      } else {
        // Show suggested key if no shortcut is set
        shortcutElement.textContent = 'Not configured - click below to set';
      }
    } else {
      shortcutElement.textContent = 'Command not found';
    }
  });
}

// Handle configure shortcut button
const configureShortcutBtn = document.getElementById('configureShortcut');
if (configureShortcutBtn) {
  configureShortcutBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
}

// Load and display current theme preference
const themeButtons = document.querySelectorAll('.theme-btn');

if (themeButtons.length > 0) {
  // Load saved theme preference and highlight the selected button
  chrome.storage.local.get(['themePreference'], (result) => {
    const theme = result.themePreference || 'system';
    themeButtons.forEach((btn) => {
      if (btn.getAttribute('data-theme') === theme) {
        btn.classList.add('selected');
      }
    });
  });

  // Handle theme button clicks
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      if (!theme) return;

      // Update selected state
      themeButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Save theme preference to storage
      chrome.storage.local.set({ themePreference: theme }, () => {
        // Notify all tabs to update their theme
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs
                .sendMessage(tab.id, {
                  action: 'updateTheme',
                  theme: theme,
                })
                .catch(() => {}); // Ignore errors for tabs without content script
            }
          });
        });
      });
    });
  });
}

// Load and handle button position preferences
const cornerButtons = document.querySelectorAll('.corner-btn');

if (cornerButtons.length > 0) {
  // Load saved position preference and highlight the selected corner
  chrome.storage.local.get(['buttonPosition'], (result) => {
    const position = result.buttonPosition || 'bottom-left';
    cornerButtons.forEach((btn) => {
      if (btn.getAttribute('data-position') === position) {
        btn.classList.add('selected');
      }
    });
  });

  // Handle corner button clicks
  cornerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const position = btn.getAttribute('data-position');
      if (!position) return;

      // Update selected state
      cornerButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Save position preference to storage
      chrome.storage.local.set({ buttonPosition: position }, () => {
        // Notify all tabs to update their button position
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs
                .sendMessage(tab.id, {
                  action: 'updateButtonPosition',
                  position: position,
                })
                .catch(() => {}); // Ignore errors for tabs without content script
            }
          });
        });
      });
    });
  });
}
