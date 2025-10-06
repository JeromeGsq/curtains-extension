# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Manifest V3 extension called "Curtains" that overlays web pages with a full-screen white curtain. The curtain blocks all interactions until the user clicks a reveal button. Once revealed, a floating button allows re-hiding the page. State is persisted per-tab across reloads and SPA navigations.

## Architecture

The extension follows a standard MV3 architecture with three main components:

1. **Content Script ([content.js](content.js))**: Injected into all pages at `document_start`. Creates and manages two DOM elements:
   - A full-screen overlay (`#curtain-overlay`) with a reveal button
   - A floating hide button (`#curtain-hide-btn`) shown when curtain is hidden

   Communicates with the service worker via `chrome.runtime.sendMessage` to get/set per-tab state.

2. **Service Worker ([service_worker.js](service_worker.js))**: Manages per-tab curtain state using an in-memory `Map<tabId, boolean>` where `true` = curtain shown, `false` = curtain hidden. Handles:
   - State queries from content scripts (identifies tab via `sender.tab.id`)
   - State updates and persistence
   - Keyboard command events (`toggle-curtain`)
   - Tab cleanup on removal

3. **Styling ([content.css](content.css))**: Uses high z-index values (2147483647) to ensure overlay stays on top. Elements are prefixed with `#curtain-` to avoid conflicts with page styles.

## Key Implementation Details

- **Default behavior**: Website is visible by default (curtain hidden). The content script queries the service worker for saved state on initialization.
- **State management**: Service worker is the source of truth for tab state. Content script never directly manages state, only queries/updates via messages.
- **Keyboard shortcut**: `Ctrl+Shift+H` (Mac: `Command+Shift+H`) toggles the curtain via the service worker.
- **No SPA detection**: Current implementation does not handle SPA navigation (unlike the spec in [prompt.md](prompt.md)). State persists only across hard reloads via the service worker's tab state map.

## Loading the Extension

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this directory

## Icons

The extension includes three placeholder blue icon files (icon16.png, icon48.png, icon128.png) created with ImageMagick. Replace these with proper icons for production.

## Differences from Spec

The implemented version differs from the detailed spec in [prompt.md](prompt.md):

- Simpler state management (no `chrome.storage.local` persistence across browser restarts)
- No SPA navigation detection (no history API wrapping)
- No keyboard event blocking when curtain is shown
- Simplified messaging protocol
- Single toggle command instead of separate show/hide commands
- Different keyboard shortcut (Ctrl+Shift+H vs Ctrl+Shift+Y)
