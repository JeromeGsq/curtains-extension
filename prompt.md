# Developer prompt + spec (English)

Below is a complete, precise set of instructions you can give to your _developer LLM_ to build a Chrome extension (Manifest V3) from scratch that:

- On **any** webpage overlays the page with a full-screen white “curtain” overlay that intercepts all clicks and keyboard interaction.
- Shows a large panel message (“Curtain closed” or similar).
- Contains a **large reveal button** that the user clicks to remove the overlay and resume browsing.
- When the overlay is removed, a **small persistent button** (floating) remains so the user can re-apply the curtain with one click.
- Supports a global keyboard shortcut to toggle the curtain (both hide and re-show).
- Persists per-tab state so reveal/hidden state survives reloads and SPA navigations.
- Is ready to be adapted to Firefox later (notes included).

Use the content below as the single authoritative prompt for your developer LLM.

---

## Project overview (short)

Create a Chrome MV3 extension that injects a content script into pages. The content script injects a full-screen overlay element that blocks pointer and keyboard events. The overlay has a big message and a reveal button. The content script also adds a small floating re-hide button that appears when the curtain is open. A service worker (background) keeps per-tab state and handles keyboard commands (manifest `commands`) to toggle overlay in the active tab. Use `chrome.runtime` messaging and `chrome.storage.local` to persist per-tab state.

---

## File list (what to create)

- `manifest.json`
- `icons/` (optional small icons)
- `content.css` — styles for overlay and small button
- `content.js` — content script (injected into web pages)
- `service_worker.js` — extension service worker (background logic, commands)
- (optional) `popup.html` + `popup.js` if you want a simple extension popup toggle — **not required** but mention if the user wants UI in toolbar later.
- `README.md` — install & test steps

---

## `manifest.json` (Manifest V3) — minimal example

```json
{
  "manifest_version": 3,
  "name": "Page Curtain",
  "version": "1.0",
  "description": "Overlay a full-screen curtain that intercepts interactions. Reveal with a button or keyboard shortcut, re-hide with small button or shortcut.",
  "permissions": ["storage", "scripting", "tabs"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "service_worker.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_end"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "commands": {
    "toggle-curtain": {
      "suggested_key": {
        "default": "Ctrl+Shift+Y"
      },
      "description": "Toggle the page curtain (show/hide)"
    },
    "show-curtain": {
      "suggested_key": {
        "default": "Ctrl+Shift+U"
      },
      "description": "Show the curtain"
    },
    "hide-curtain": {
      "suggested_key": {
        "default": "Ctrl+Shift+I"
      },
      "description": "Hide the curtain"
    }
  }
}
```

Notes:

- `host_permissions` set to `<all_urls>` for simplicity; if you want restricted scope, replace with specific match patterns.
- Shortcuts are default — user can change them in `chrome://extensions/shortcuts`.

---

## `content.css` (styling)

```css
/* content.css */

/* Full-screen overlay */
.__page_curtain_overlay {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: white !important;
  z-index: 2147483647 !important; /* max z-index to stay on top */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  pointer-events: auto !important; /* capture clicks */
  user-select: none !important;
}

/* message box in center */
.__page_curtain_panel {
  text-align: center;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  padding: 36px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  background: transparent;
}

/* large message */
.__page_curtain_message {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* big reveal button */
.__page_curtain_reveal_btn {
  font-size: 18px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #f5f5f5;
}

/* small floating re-hide button (visible when curtain hidden) */
.__page_curtain_small_btn {
  position: fixed !important;
  right: 16px !important;
  bottom: 16px !important;
  z-index: 2147483646 !important;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  user-select: none;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
```

---

## `content.js` (content script) — core behaviors

Insert this file. It will:

- Create overlay DOM and small re-hide button.
- Intercept all pointer and key events when overlay visible.
- Communicate with service worker to get / set per-tab state.
- Detect SPA navigation (pushState/replaceState) and re-apply overlay according to state.

```javascript
// content.js
(function () {
  if (window.__pageCurtainInjected) return;
  window.__pageCurtainInjected = true;

  // create overlay element
  const overlay = document.createElement('div');
  overlay.className = '__page_curtain_overlay';
  overlay.style.display = 'none'; // initially hidden until we ask background

  const panel = document.createElement('div');
  panel.className = '__page_curtain_panel';

  const message = document.createElement('div');
  message.className = '__page_curtain_message';
  message.innerText = 'Curtain closed';

  const revealBtn = document.createElement('button');
  revealBtn.className = '__page_curtain_reveal_btn';
  revealBtn.innerText = 'Reveal page';

  panel.appendChild(message);
  panel.appendChild(revealBtn);
  overlay.appendChild(panel);
  document.documentElement.appendChild(overlay);

  // small floating re-hide button (visible when curtain is hidden)
  const smallBtn = document.createElement('button');
  smallBtn.className = '__page_curtain_small_btn';
  smallBtn.title = 'Re-hide page';
  smallBtn.innerText = '☰'; // or any icon
  smallBtn.style.display = 'none';
  document.documentElement.appendChild(smallBtn);

  // helper to block keyboard events while overlay is visible
  function blockKeyboard(ev) {
    ev.stopImmediatePropagation();
    // allow some keys if you want (like extension shortcut?) — but Chrome command triggers in background, not here
  }

  // Intercept pointer/keyboard events: overlay already captures pointer events because it sits on top.
  function showOverlay() {
    overlay.style.display = '';
    smallBtn.style.display = 'none';
    // trap focus on overlay
    overlay.setAttribute('tabindex', '-1');
    overlay.focus?.();
    // listen and stop keyboard events
    window.addEventListener('keydown', blockKeyboard, true);
    window.addEventListener('keyup', blockKeyboard, true);
    // optional: prevent focus from moving out
  }

  function hideOverlay() {
    overlay.style.display = 'none';
    smallBtn.style.display = ''; // show small re-hide button
    window.removeEventListener('keydown', blockKeyboard, true);
    window.removeEventListener('keyup', blockKeyboard, true);
  }

  // When user clicks reveal button
  revealBtn.addEventListener('click', () => {
    // tell background to mark this tab as "revealed"
    chrome.runtime.sendMessage({ type: 'set-state', reveal: true }, () => {
      hideOverlay();
    });
  });

  // small button re-hides the page
  smallBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'set-state', reveal: false }, () => {
      showOverlay();
    });
  });

  // Listen to messages from service worker
  chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
    if (msg && msg.type === 'set-overlay') {
      if (msg.show) showOverlay();
      else hideOverlay();
    }
    // optional: reply
  });

  // ask background for initial state for this tab
  chrome.runtime.sendMessage({ type: 'get-state' }, (resp) => {
    // background will reply after checking sender.tab.id
    const shouldReveal = resp && resp.reveal === true;
    if (shouldReveal) {
      hideOverlay();
    } else {
      showOverlay();
    }
  });

  // SPA navigation detection: wrap pushState/replaceState and listen to popstate
  (function () {
    const _wr = function (type) {
      const orig = history[type];
      return function () {
        const rv = orig.apply(this, arguments);
        window.dispatchEvent(new Event('urlchange'));
        return rv;
      };
    };
    history.pushState = _wr('pushState');
    history.replaceState = _wr('replaceState');
    window.addEventListener('popstate', () =>
      window.dispatchEvent(new Event('urlchange'))
    );
    window.addEventListener('urlchange', () => {
      // Re-check desired state after SPA navigation: ask background
      chrome.runtime.sendMessage({ type: 'get-state' }, (resp) => {
        const shouldReveal = resp && resp.reveal === true;
        if (shouldReveal) hideOverlay();
        else showOverlay();
      });
    });
  })();

  // Ensure overlay captures clicks even inside iframes by setting pointer-events on top-level
  // Note: cannot directly control cross-origin iframes; but overlay will sit above them
})();
```

Notes:

- The content script **asks** the background/service worker for the state. The background can access `sender.tab.id` to know which tab requested the state.
- The content script does not try to determine its tabId (not available directly). All tab-specific state is managed by the background.

---

## `service_worker.js` (background) — messaging and commands

This file manages a `Map` of `tabId -> reveal` booleans and handles `chrome.commands` to toggle. It also listens for messages from the content script and persists to `chrome.storage.local` (so state survives restarts).

```javascript
// service_worker.js
const tabState = new Map(); // in-memory; also persist

// load persisted state on startup
chrome.storage.local.get(['pageCurtainTabState'], (res) => {
  try {
    const saved = res.pageCurtainTabState || {};
    for (const k in saved) tabState.set(Number(k), !!saved[k]);
  } catch (e) {
    console.error('Failed to restore state', e);
  }
});

function persist() {
  const obj = {};
  for (const [k, v] of tabState.entries()) obj[k] = v;
  chrome.storage.local.set({ pageCurtainTabState: obj });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
  // sender.tab exists when message comes from content script
  const tabId = sender && sender.tab && sender.tab.id;
  if (msg.type === 'get-state') {
    const reveal = tabId != null ? !!tabState.get(tabId) : true;
    sendResp({ reveal });
    return true; // will respond asynchronously if needed
  }

  if (msg.type === 'set-state') {
    if (tabId == null) {
      sendResp({ error: 'no tab' });
      return;
    }
    const revealFlag = !!msg.reveal;
    tabState.set(tabId, revealFlag);
    persist();
    // notify the tab to show/hide overlay
    chrome.tabs.sendMessage(
      tabId,
      { type: 'set-overlay', show: !revealFlag },
      () => {}
    );
    sendResp({ ok: true });
    return true;
  }
});

// react to tab removal to clean memory
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabState.has(tabId)) {
    tabState.delete(tabId);
    persist();
  }
});

async function sendToggleToActiveTab(action) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) return;
  const tabId = tabs[0].id;
  if (action === 'toggle') {
    const current = !!tabState.get(tabId);
    const newReveal = !current;
    tabState.set(tabId, newReveal);
    persist();
    chrome.tabs.sendMessage(
      tabId,
      { type: 'set-overlay', show: !newReveal },
      () => {}
    );
  } else if (action === 'show') {
    tabState.set(tabId, false); // false means curtain shown
    persist();
    chrome.tabs.sendMessage(
      tabId,
      { type: 'set-overlay', show: true },
      () => {}
    );
  } else if (action === 'hide') {
    tabState.set(tabId, true);
    persist();
    chrome.tabs.sendMessage(
      tabId,
      { type: 'set-overlay', show: false },
      () => {}
    );
  }
}

// handle keyboard shortcuts (commands)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-curtain') {
    sendToggleToActiveTab('toggle');
  } else if (command === 'show-curtain') {
    sendToggleToActiveTab('show');
  } else if (command === 'hide-curtain') {
    sendToggleToActiveTab('hide');
  }
});
```

Notes:

- `tabState` keys: `tabId -> reveal boolean`. `reveal=true` means user revealed the page (i.e., curtain hidden). `reveal=false` means curtain shown.
- Service worker persists the map in `chrome.storage.local` so states survive service worker restarts.
- When user triggers keyboard command, background toggles state for the active tab and sends a message to that tab.

---

## Behavior summary (runtime)

1. On page load the content script sends `{type:'get-state'}`. The background checks the tabId and returns `{reveal: true/false}` (default to `false` or chosen behavior). If `reveal===false` -> show overlay.
2. When the user clicks the **Reveal page** big button, the content script sends `{type:'set-state', reveal: true}` to background. Background stores it and notifies the tab to hide overlay.
3. When curtain is hidden, the small floating button is displayed. Clicking it sends `{type:'set-state', reveal: false}` to background; background stores it and notifies content script to show overlay again.
4. Keyboard shortcuts (configured in `manifest.json`) call `chrome.commands.onCommand` → background toggles the state for the active tab and sends a message to the content script to show/hide overlay.
5. SPA navigations trigger the content script’s `urlchange` event which re-queries the background for the current state and re-applies overlay as necessary.

---

## Accessibility & UX suggestions

- The big reveal button should be keyboard-focusable and have `aria-label`.
- The overlay should set `role="dialog"` and `aria-modal="true"` if you want to be accessible.
- Consider allowing the user to customize message text and colors via an options page later.
- Provide an optional toolbar popup toggle for quick control.

---

## Security & privacy

- Do not collect or transmit page content to any server.
- Only use `chrome.storage.local` for per-tab state.
- If you decide to add analytics later, disclose in your privacy policy and request user consent.

---

## Testing & debugging steps

1. Load unpacked extension:

   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click “Load unpacked” and select the extension directory.

2. Open any webpage. Expected: the white curtain shows (if default state is shown).
3. Click **Reveal page** — content becomes visible and small button appears bottom-right.
4. Click small button — curtain returns.
5. Press the keyboard shortcut (`Ctrl+Shift+Y` by default) — toggle overlay.
6. Test SPA site (e.g., Gmail, news SPA): change views, ensure curtain state persists as expected.
7. Open background console: `chrome://extensions/` → click “Service worker” (Inspect views) to see logs.

---

## Packaging and Chrome Web Store notes

- Verify icons, description, and privacy policy before publishing.
- Make sure your extension does not request more host permissions than necessary. If you need `<all_urls>`, justify it in listing.
- Manifest V3 is required for Chrome; Firefox MV3 support is improving but may require small adjustments later (see below).

---

## Migration notes for Firefox (later)

- Firefox supports Manifest V3 partially; the content script model and `commands` are similar. Service worker support in Firefox may differ — you may need to convert to background scripts if testing shows incompatibility.
- Use `browser.*` namespace compatibility layer or `chrome.*` polyfill.
- Test shortcuts and `chrome.scripting` equivalents — Firefox may inject content scripts differently; using `content_scripts` in the manifest should still work.

---

## Extra polishing ideas (optional)

- Add an options page to set:

  - Default behavior (show curtain automatically or not).
  - Custom message text.
  - Default for new tabs/windows.

- Add a per-origin whitelist (so you can disable curtain automatically for selected sites).
- Animate the overlay in/out for better UX.
- Add a user-configurable keyboard shortcut via chrome's UI.

---

## Final note to your developer LLM

1. Implement exactly the files above using MV3.
2. Ensure the content script **never leaks** page content to external servers.
3. Test on several sites including single-page apps.
4. Provide clear comments in code and a README that explains how to install, change shortcut keys, and where to find logs.

---

If you want, I can now:

- produce the entire extension as a zip in this chat (source files with code above ready to copy), or
- generate a slightly fancier UI (animated overlay + accessibility improvements), or
- adjust default shortcuts to Mac-friendly ones and include instructions for mapping them in `chrome://extensions/shortcuts`.

Which of those would you like next?
