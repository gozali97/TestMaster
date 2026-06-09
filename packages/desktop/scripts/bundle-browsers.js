#!/usr/bin/env node
/**
 * Downloads the Playwright browsers INTO the desktop package
 * (packages/desktop/ms-playwright) instead of the global user cache.
 *
 * electron-builder ships this folder via `extraResources`, and at runtime the
 * Electron main process points PLAYWRIGHT_BROWSERS_PATH here. The result: the
 * packaged desktop app runs automation WITHOUT the end user installing
 * Playwright or its browsers.
 *
 * Cross-platform (works on Windows/macOS/Linux) because it sets the env var in
 * process and spawns the Playwright CLI directly.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const browsersDir = path.join(__dirname, '..', 'ms-playwright');
fs.mkdirSync(browsersDir, { recursive: true });

// Only bundle Chromium (headed + headless shell + ffmpeg). Add 'firefox'
// / 'webkit' here if you need them — each adds a few hundred MB.
const browsers = ['chromium'];

console.log(`[bundle-browsers] Installing into: ${browsersDir}`);

// Resolve the Playwright CLI entry. Subpath exports are restricted, so locate
// it via the package directory instead.
function resolveCli() {
  for (const pkg of ['playwright-core', 'playwright', '@playwright/test']) {
    try {
      const pkgJson = require.resolve(`${pkg}/package.json`);
      const cli = path.join(path.dirname(pkgJson), 'cli.js');
      if (fs.existsSync(cli)) return cli;
    } catch {
      /* try next */
    }
  }
  return null;
}

const cliPath = resolveCli();
if (!cliPath) {
  console.error('[bundle-browsers] Could not locate the Playwright CLI. Is Playwright installed?');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [cliPath, 'install', ...browsers],
  {
    stdio: 'inherit',
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browsersDir },
  }
);

if (result.status !== 0) {
  console.error('[bundle-browsers] Failed to install browsers.');
  process.exit(result.status || 1);
}

console.log('[bundle-browsers] Done. Browsers bundled at', browsersDir);
