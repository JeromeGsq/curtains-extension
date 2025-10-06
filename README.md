# Curtains Chrome Extension

Block distracting websites so you can focus on your work.

## Development

This extension is built with **TypeScript** for better type safety and developer experience.

### Setup

```bash
npm install
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Watch Mode (Development)

Auto-compile on file changes:

```bash
npm run watch
```

Keep this running in a terminal while developing. The compiled JavaScript files will be output to the `dist/` folder.

### Project Structure

```
chrome/
├── src/                    # TypeScript source files
│   ├── content.ts          # Content script (injected into pages)
│   ├── service_worker.ts   # Background service worker
│   └── popup.ts            # Popup UI logic
├── dist/                   # Compiled JavaScript (auto-generated)
├── icons/                  # Extension icons
├── manifest.json           # Extension manifest
├── popup.html              # Popup UI
├── content.css            # Content script styles
└── tsconfig.json          # TypeScript configuration
```

## Loading the Extension

1. Build the extension: `npm run build`
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select this directory

## Usage

- **Click the eye button** on any page to toggle the curtain
- **Keyboard shortcut**: `Ctrl+Shift+H` (Windows/Linux) or `Command+Shift+H` (Mac)
- **Popup**: Click the extension icon for quick controls

## Features

- **Per-domain blocking**: Block youtube.com once, it's blocked in all tabs
- **Persistent state**: Blocked sites stay blocked across browser restarts
- **Auto-sync**: Block a site in one tab, all tabs with that domain are blocked
- **Tab muting**: Blocked tabs are automatically muted
- **Keyboard shortcuts**: Quick toggle with customizable shortcuts

## TypeScript Benefits

- ✅ Type safety - catch bugs at compile time
- ✅ IntelliSense - better autocomplete in VS Code
- ✅ Chrome API types included
- ✅ No runtime performance impact (compiles to plain JavaScript)
