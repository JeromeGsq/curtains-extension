# Publishing to Chrome Web Store

## Prerequisites

- [ ] Google Account for Chrome Web Store Developer
- [ ] $5 one-time developer registration fee
- [ ] Production build ready in `dist/` folder

## Required Store Assets

### Extension Icons
✅ Already included in the project:
- `icons/icon16.png` - 16x16px (browser toolbar)
- `icons/icon48.png` - 48x48px (extensions management page)
- `icons/icon128.png` - 128x128px (Chrome Web Store)

### Store Listing Assets (YOU NEED TO CREATE THESE)

#### 1. Screenshots (Required)
- **Minimum**: 1 screenshot
- **Recommended**: 3-5 screenshots
- **Size**: 1280x800px or 640x400px
- **Format**: PNG or JPEG

**Suggested screenshots:**
1. Curtain overlay showing motivational message
2. Docked button revealing on hover
3. Extension popup with toggle and keyboard shortcut
4. Before/after comparison (distracted site vs blocked)

#### 2. Promotional Images (Optional but recommended)

**Small Promotional Tile** (440x280px):
- Shows in "Featured" section
- PNG or JPEG

**Marquee Promotional Tile** (1400x560px):
- Shows in Chrome Web Store homepage
- PNG or JPEG

#### 3. Store Listing Copy

**Short Description** (132 characters max):
```
Block distracting websites with peaceful curtain overlays and motivational messages. Stay focused, work better.
```

**Detailed Description** (suggested):
```
Curtains - Focus & Block Distractions

Take control of your browsing time with Curtains, a peaceful and motivating website blocker.

🎯 FEATURES

• Block Distracting Websites: Hide any website behind a peaceful grey curtain
• Per-Domain Control: Block YouTube.com once, it stays blocked across all tabs
• Motivational Messages: Get inspired with random motivational quotes when blocked
• Quick Resume: Easy one-click button to resume access when needed
• Docked Button: Minimal, hidden button that appears on hover
• Keyboard Shortcuts: Global shortcuts (Cmd+Shift+H / Ctrl+Shift+H)
• Auto Tab Muting: Blocked tabs are automatically muted
• Persistent State: Settings saved across browser restarts

✨ HOW IT WORKS

1. Click the extension icon or use the keyboard shortcut
2. Toggle any website to "blocked" mode
3. A peaceful curtain appears with motivational messages
4. Click "Resume" when you're ready to continue

🧘 STAY FOCUSED

Each time you block a site, you'll see a different motivational phrase:
- "Take a deep breath — peace starts here."
- "Focus is freedom — distractions can wait."
- "You control the curtain. You control your time."
...and 16 more inspiring messages!

🎨 MINIMAL DESIGN

The docked button stays hidden in the bottom-left corner until you need it. Move your mouse near the edge to reveal it — no clutter, just focus.

🔒 PRIVACY

- No data collection
- No tracking
- Works 100% offline
- Open source on GitHub

Perfect for students, professionals, and anyone looking to reduce digital distractions.
```

**Category**: Productivity

**Language**: English (or your target languages)

## Publishing Steps

### 1. Prepare the Package

```bash
# Build production version
npm run build

# Create a ZIP file of the dist folder
cd dist
zip -r ../curtains-v1.0.0.zip .
cd ..
```

### 2. Chrome Web Store Developer Dashboard

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload `curtains-v1.0.0.zip`
4. Fill in the store listing:
   - Item name: "Curtains - Focus & Block Distractions"
   - Summary: (see short description above)
   - Detailed description: (see detailed description above)
   - Category: Productivity
   - Language: English
5. Upload screenshots and promotional images
6. Set privacy policy URL (if you have one)
7. Fill in the distribution settings:
   - Visibility: Public
   - Regions: All regions (or select specific countries)

### 3. Privacy & Permissions

The extension requests these permissions:
- `storage` - Save blocked domains and button positions
- `activeTab` - Access current tab URL to identify domain
- `tabs` - Sync state across multiple tabs and mute blocked tabs

**Privacy Practices Declaration**:
- No user data is collected
- No user data is transmitted
- All data stays local on the user's device

### 4. Review & Submit

1. Review all information
2. Pay the $5 developer fee (if first time)
3. Click "Submit for Review"
4. Wait 1-3 business days for approval

## Version Management

Current version: **1.0.0**

To release a new version:

1. Update version in `manifest.json`:
   ```json
   "version": "1.1.0"
   ```

2. Build and package:
   ```bash
   npm run build
   cd dist && zip -r ../curtains-v1.1.0.zip . && cd ..
   ```

3. Upload to Chrome Web Store Dashboard
4. Submit for review

## Post-Publication

After approval:
- Share your extension URL: `https://chrome.google.com/webstore/detail/[your-extension-id]`
- Add the link to your README
- Update `homepage_url` in manifest.json

## Troubleshooting

**Common rejection reasons:**
- Missing or low-quality screenshots
- Privacy policy required if collecting data (we don't)
- Permissions not justified in description
- Icon quality issues

**Need to update metadata?**
- You can update description, screenshots, and promotional images without re-review
- Code changes require re-submission and review

## Additional Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/devguide/)
- [Branding Guidelines](https://developer.chrome.com/docs/webstore/branding/)
