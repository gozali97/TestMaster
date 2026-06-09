# TestMaster — Installation & Setup Guide

AI-augmented test automation platform. Monorepo (Turborepo + npm workspaces) with:

| Package | Tech | Role | Port |
|---------|------|------|------|
| `packages/shared` | TypeScript | Shared types/utils/validation | – |
| `packages/test-engine` | Playwright | Test execution engine | – |
| `packages/api` | Express + Sequelize + MySQL | Backend REST API + JWT auth | 3001 |
| `packages/web` | Next.js 14 | Web portal | 3000 |
| `packages/desktop` | Electron + React + Vite | Desktop IDE (bundled Playwright) | 5175 (dev) |

**How data & execution work**
- All data (projects, test cases, executions) is read/written through the **API** (`:3001`), which talks to **MySQL**. Both the web and desktop apps use the API for data.
- The **desktop app runs Playwright locally** (inside the Electron main process) using a **bundled Chromium**, so end users don't need to install Playwright. It still fetches the test data from the API.

---

## 1. Prerequisites

- **Node.js** ≥ 18 (tested on 24)
- **npm** ≥ 9
- **MySQL** 8.x
- **Git**
- Linux only (desktop build to `.deb`): `dpkg`, `fakeroot` are used by electron-builder (usually preinstalled).
- Windows installer (`.exe`) must be built **on Windows** (or Linux/macOS with Wine).

Check versions:
```bash
node --version
npm --version
mysql --version
```

---

## 2. Install dependencies (monorepo root)

From the project root:
```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` avoids peer-dependency conflicts in this repo.

### Linux: fix missing Rollup native binary (if web/desktop dev fails)
Because of a known npm bug (#4828) with optional deps + `--legacy-peer-deps`, the platform-specific Rollup binary can be skipped. If Vite fails with `Cannot find module @rollup/rollup-linux-x64-gnu`, run:
```bash
npm install @rollup/rollup-linux-x64-gnu --no-save --legacy-peer-deps
```

---

## 3. Build the shared & engine packages

The API depends on these compiled packages:
```bash
npm run build --workspace=@testmaster/shared
npm run build --workspace=@testmaster/test-engine
```

> Note: `@testmaster/test-engine` has some pre-existing TypeScript type errors but `tsc` still emits its `dist/` output, which is what the API and desktop load. Dev mode (`tsx`) does not type-check, so the API runs fine.

---

## 4. Database setup (MySQL)

Create the database and a dedicated user, then import the schema.

```bash
# Login as root (socket auth on Linux):
sudo mysql

# In the MySQL prompt:
CREATE DATABASE IF NOT EXISTS testmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'testmaster'@'localhost' IDENTIFIED WITH mysql_native_password BY 'TestMaster#2024';
CREATE USER IF NOT EXISTS 'testmaster'@'%'         IDENTIFIED WITH mysql_native_password BY 'TestMaster#2024';
GRANT ALL PRIVILEGES ON testmaster.* TO 'testmaster'@'localhost';
GRANT ALL PRIVILEGES ON testmaster.* TO 'testmaster'@'%';
FLUSH PRIVILEGES;
EXIT;
```

Import the schema:
```bash
sudo mysql testmaster < database/schema.sql
```

> The app connects over TCP to `127.0.0.1`, which MySQL resolves to `localhost` — that's why both `'localhost'` and `'%'` grants are created.
> You can also just use the `root` user if you prefer; set the credentials accordingly in `.env`.

---

## 5. Environment variables

The API loads `.env` from its own folder (`packages/api`). Create these files:

```bash
cp .env.example .env
cp .env packages/api/.env
cp .env packages/web/.env.local
```

Edit the database section (root `.env` and `packages/api/.env`):
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=testmaster
DB_USER=testmaster
DB_PASSWORD="TestMaster#2024"

JWT_SECRET=change-me-to-a-random-string
REFRESH_TOKEN_SECRET=another-random-string

API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> ⚠️ **Quote the password if it contains `#`.** dotenv treats an unquoted `#` as the start of a comment, which would truncate the password. `DB_PASSWORD="TestMaster#2024"` is correct; `DB_PASSWORD=TestMaster#2024` is not.

---

## 6. Run the app (development)

Open two terminals.

**Terminal 1 — API** (http://localhost:3001):
```bash
cd packages/api
npm run dev
```
You should see:
```
Database connection established successfully.
TestMaster API server is running on port 3001
```

**Terminal 2 — Web portal** (http://localhost:3000):
```bash
cd packages/web
npm run dev
```

Open http://localhost:3000 and log in (or register a new account).

---

## 7. Run the Desktop IDE (development)

The desktop app runs Playwright **locally** using bundled Chromium and reads data from the API. Make sure the API (`:3001`) is running first.

### One-time: bundle the Playwright browser into the app
```bash
cd packages/desktop
npm run bundle-browsers
```
This downloads Chromium into `packages/desktop/ms-playwright/` (≈ a few hundred MB). It is shipped with the installer and used at runtime via `PLAYWRIGHT_BROWSERS_PATH`.

### Start the desktop app
```bash
cd packages/desktop
npm run build:main   # compile Electron main/preload once
npm run dev          # runs Vite (5175) + tsc watch + Electron
```

An Electron window opens with the TestMaster IDE. Create/select a test case, then **Execute** — automation runs in the bundled browser, no system Playwright install required.

---

## 8. Build desktop installers (`.deb` and `.exe`)

Installers bundle the app **and** the Playwright browser, so end users can run automation without installing anything extra.

> The bundled browser is OS-specific. Build the `.deb` **on Linux** and the `.exe` **on Windows** so the correct Chromium build ships with each. `npm run bundle-browsers` downloads the browser for the OS you build on.

From `packages/desktop`:

```bash
# Linux .deb  (run on Linux)
npm run dist:linux

# Windows .exe installer  (run on Windows, or Linux/macOS with Wine)
npm run dist:win

# Both
npm run dist:all
```

Each script runs `bundle-browsers` → builds the renderer + main process → packages with electron-builder. Output goes to `packages/desktop/release/`:
- `TestMaster-1.0.0.deb`
- `TestMaster-Setup-1.0.0.exe`

> The installer size is large (~1 GB) because the browser is bundled. To trim it, only Chromium is bundled by default (see `scripts/bundle-browsers.js`).

---

## 9. Verify

**API health:**
```bash
curl http://localhost:3001/health
# {"status":"ok","message":"TestMaster API is running"}
```

**Web:** open http://localhost:3000 — login page appears.

**Auth flow:** register an account or log in, then create a project and a test case with steps, and run it from the Executions page.

---

## 10. Troubleshooting

**`Access denied for user 'testmaster'@'localhost'`**
- Ensure both `'localhost'` and `'%'` users exist with the correct password (Step 4).
- Ensure `DB_PASSWORD` is **quoted** in `.env` if it contains `#` (Step 5).

**`Cannot find module @rollup/rollup-linux-x64-gnu`** (Vite)
- Run the Rollup native-binary fix in Step 2.

**`Cannot find module '@testmaster/shared'` / `'@testmaster/test-engine'`**
- Build them: see Step 3.

**Port already in use (3000 / 3001 / 5175)**
- Find/stop the process, e.g. `lsof -i :3001` then `kill <pid>`, or change the port in `.env`.

**Playwright can't launch in the desktop app**
- Make sure `npm run bundle-browsers` was run, so `packages/desktop/ms-playwright/` is populated.
- On some Linux distros Chromium needs system libs (e.g. `libnss3`, `libgbm1`, `libasound2`). Install via your package manager if launch fails.

**electron-builder: "Cannot compute electron version"**
- `electronVersion` is pinned in `packages/desktop/package.json` (`build.electronVersion`). Update it if you change the Electron version.

**`.deb` build: "Please specify project homepage"**
- `homepage`, `author`, and `description` are set in `packages/desktop/package.json`. Keep them present.

---

## Ports summary

| Service | URL |
|---------|-----|
| Web portal | http://localhost:3000 |
| API | http://localhost:3001 |
| Desktop (Vite dev server) | http://localhost:5175 |
| MySQL | 127.0.0.1:3306 |
