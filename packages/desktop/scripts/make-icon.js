#!/usr/bin/env node
// Generates app icons for electron-builder from the source PNG.
//   - build/icon.png         -> 512x512 (used for Windows/macOS, generic)
//   - build/icons/<n>x<n>.png -> Linux icon set (reliable .deb/desktop icons)
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const src = path.join(__dirname, '..', 'public', 'image', 'icon.png');
const buildDir = path.join(__dirname, '..', 'build');
const iconsDir = path.join(buildDir, 'icons');

fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

async function run() {
  if (!fs.existsSync(src)) {
    console.error(`[make-icon] Source not found: ${src}`);
    process.exit(1);
  }

  // Main 512x512 icon (Windows/macOS auto-convert, generic)
  await sharp(src)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(buildDir, 'icon.png'));

  // Linux icon set (each standard size)
  for (const size of sizes) {
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(iconsDir, `${size}x${size}.png`));
  }

  console.log(`[make-icon] Wrote build/icon.png and ${sizes.length} sizes in build/icons/`);
}

run().catch((err) => {
  console.error('[make-icon] Failed:', err.message);
  process.exit(1);
});
