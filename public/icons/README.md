# Icons Directory

This directory should contain PWA icons for the ScreenSphere application.

## Required Icons

Based on `manifest.json`, the following icons are needed:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to Add Icons

1. Create or obtain a logo for ScreenSphere (512x512 recommended)
2. Use a tool like:
   - [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Or manually resize using image editing software

3. Place the generated icons in this directory

## Temporary Solution

The app will work without these icons, but:
- PWA installation prompts may not show properly
- Home screen icons will use a default/fallback
- The app will show 404 errors in console for missing icons

This is not critical for development but should be addressed before production deployment.
