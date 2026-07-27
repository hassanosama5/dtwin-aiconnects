# Asset Generation Scripts

## Quick Start

### Option 1: Browser-Based Generator (Recommended)

1. Open `generate-assets.html` in your browser
2. Click each "Generate & Download" button
3. Save each file to the `assets/` folder

### Option 2: Alternative - Remove Asset References

If you want to skip asset generation for now, the app will work fine with Expo's defaults. Simply update `app.json`:

Remove these lines:
```json
"icon": "./assets/icon.png",
```

```json
"image": "./assets/splash.png",
```

```json
"foregroundImage": "./assets/adaptive-icon.png",
```

```json
"favicon": "./assets/favicon.png",
```

And Expo will use default assets.

## What Gets Generated

- **icon.png** (1024x1024) - App icon with "DT" logo
- **adaptive-icon.png** (1024x1024) - Android adaptive icon
- **splash.png** (1284x2778) - Splash screen with brand color
- **favicon.png** (48x48) - Web favicon

All assets use the Decision Twin brand color: `#0ea5e9`
