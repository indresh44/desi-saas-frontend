# PWA icons

The `manifest.json` references four icon files that must live in this
directory. Generate them once and drop them here.

| Filename | Size | Purpose |
|---|---|---|
| `icon-192.png` | 192×192 | Standard launcher icon |
| `icon-512.png` | 512×512 | High-res launcher / splash |
| `icon-maskable-192.png` | 192×192 | Android adaptive icon (with safe zone) |
| `icon-maskable-512.png` | 512×512 | Android adaptive icon (with safe zone) |

You also need an Apple touch icon at `public/apple-touch-icon.png`
(180×180) — iOS reads this from the site root.

## Easiest way to generate all of them

Use [realfavicongenerator.net](https://realfavicongenerator.net/):

1. Upload `app/sellnsettle-icon.png` (or a higher-res source if you
   have one — 1024×1024 is ideal).
2. Configure each platform:
   - **Favicon for Android Chrome** — pick "use a dedicated picture"
     for the maskable variants. Add ~10% safe-zone padding so the
     adaptive-icon mask doesn't crop the logo.
   - **Favicon for iOS** — sets the apple-touch-icon.
   - **Theme colour** — set to `#0a192f` (matches `manifest.json`).
3. Download the package, extract, and copy the files into
   `public/icons/` and `public/` per the table above.

## Until you generate them

The site still works — Lighthouse will flag the PWA audit as failing
"installable" because of the missing icons, and Android Chrome's
"Install" prompt won't appear. The service worker, manifest, and
update banner all function regardless.

To unblock testing **without** generating icons, you can temporarily
copy the existing 48×48 icon to all four filenames:

```bash
cp public/sellnsettle-icon.png public/icons/icon-192.png
cp public/sellnsettle-icon.png public/icons/icon-512.png
cp public/sellnsettle-icon.png public/icons/icon-maskable-192.png
cp public/sellnsettle-icon.png public/icons/icon-maskable-512.png
cp public/sellnsettle-icon.png public/apple-touch-icon.png
```

Browsers will scale the 48px icon up — looks blurry but works for
testing the install flow. Replace before any real deploy.
