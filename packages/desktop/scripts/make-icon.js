#!/usr/bin/env node
// Converts the source image (WebP-with-.png-extension) into a proper
// 512x512 PNG icon that electron-builder can use for Linux (.deb/AppImage)
// and auto-convert to .ico for Windows (nsis).
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const src = path.join(__dirname, '..', '..', '..', 'public', 'original-e3a2ef57d22b7332a1cbabaf3a038aa6.png');
const outDir = path.join(__dirname, '..', 'build');
const out = path.join(outDir, 'icon.png');

fs.mkdirSync(outDir, { recursive: true });

sharp(src)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(out)
  .then((info) => {
    console.log(`[make-icon] Wrote ${out} (${info.width}x${info.height})`);
  })
  .catch((err) => {
    console.error('[make-icon] Failed:', err.message);
    process.exit(1);
  });
