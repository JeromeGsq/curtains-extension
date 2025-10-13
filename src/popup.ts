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
const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
if (themeSelect) {
  chrome.storage.local.get(['themePreference'], (result) => {
    const theme = result.themePreference || 'system';
    themeSelect.value = theme;
  });

  // Handle theme selection changes
  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;

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
}


// Toggle button handler
const toggleBtn = document.getElementById('toggleBtn');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleCurtain' }, () => {
          // Close popup after toggling
          window.close();
        });
      }
    });
  });
}
