# TestMaster - Setup Guide

## Quick Start (Step by Step)

### 1. Install Dependencies

From the **root directory**:

```bash
# Go to root directory
cd D:\Project\TestMaster

# Install all dependencies (this will take a few minutes)
npm install
```

This will install dependencies for all packages in the monorepo.

### 2. Build All Packages

Build in the correct order (shared → test-engine → api/desktop/web):

```bash
# Build shared package first (required by others)
cd packages/shared
npm run build

# Build test-engine (required by api)
cd ../test-engine
npm run build

# Build API
cd ../api
npm run build

# Or build all at once from root
cd ../..
npm run build
```

### 3. Setup Database

```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE testmaster"

# Import schema
mysql -u root -p testmaster < database/schema.sql
```

### 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
```

Required settings in `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=testmaster
DB_USER=root
DB_PASSWORD=your_password

# JWT Secrets
JWT_SECRET=your-secret-key-change-this
REFRESH_TOKEN_SECRET=your-refresh-secret-change-this

# Optional: AI Features (skip if not using)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Run Backend API

```bash
cd packages/api

# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

API will be available at: http://localhost:3001

### 6. Run Web Portal

In a **new terminal**:

```bash
cd packages/web

# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Web portal will be available at: http://localhost:3000

### 7. Run Desktop IDE (Optional)

In a **new terminal**:

```bash
cd packages/desktop

# Development mode
npm run dev
```

Electron window will open automatically.

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Build the packages first:
```bash
cd packages/shared && npm run build
cd ../test-engine && npm run build
cd ../api && npm run build
```

### Issue: "workspace:*" protocol error

**Solution**: Already fixed! The package.json files now use `*` instead of `workspace:*`.

### Issue: Database connection error

**Solution**: 
1. Make sure MySQL is running
2. Check credentials in `.env` file
3. Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Issue: Port already in use

**Solution**:
- API (3001): Change `API_PORT` in `.env`
- Web (3000): Change port in `packages/web/package.json` dev script

### Issue: Build errors in TypeScript

**Solution**:
```bash
# Clean and rebuild
npm run clean
npm run build
```

---

## Project Structure

```
testmaster/
├── packages/
│   ├── shared/         # Build this FIRST
│   ├── test-engine/    # Build this SECOND
│   ├── api/            # Backend API
│   ├── web/            # Web Portal
│   ├── desktop/        # Desktop IDE
│   └── cli/            # CLI Tool
├── database/
│   └── schema.sql      # MySQL schema
├── .env.example        # Environment template
└── README.md
```

---

## Development Workflow

### 1. Make code changes

Edit files in any package.

### 2. Rebuild changed package

```bash
cd packages/shared  # or api, web, etc.
npm run build
```

### 3. Restart the application

For API/Web, the dev mode will auto-reload.
For Desktop, restart the Electron process.

---

## Testing the Platform

### 1. Register a User

Open http://localhost:3000/login and click "Sign up"

- Email: test@example.com
- Password: Test123!@#
- Name: Test User
- Organization: Test Org

### 2. Create a Project

- Navigate to "Projects"
- Click "Create Project"
- Enter project name and description
- Click "Create"

### 3. Create a Test Case

- Open your project
- Click "Create Test Case"
- Enter test details
- Add test steps
- Save

### 4. Run Tests

- Go to "Executions"
- Click "Run Tests"
- Select test cases
- Monitor execution

---

## Optional: AI Features Setup

To use AI-powered features:

### 1. Get API Key

**Option A: OpenAI (Recommended)**
- Go to https://platform.openai.com/api-keys
- Create new API key
- Copy the key (starts with `sk-`)

**Option B: Anthropic Claude**
- Go to https://console.anthropic.com/
- Create API key
- Copy the key (starts with `sk-ant-`)

### 2. Add to .env

```env
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Restart API Server

```bash
cd packages/api
npm run dev
```

### 4. Use AI Features

- Navigate to "AI Assistant" in web portal
- Enter test description
- Click "Generate Test with AI"

---

## Production Deployment

### 1. Build all packages

```bash
npm run build
```

### 2. Set environment to production

```env
NODE_ENV=production
```

### 3. Use process manager

```bash
# Install PM2
npm install -g pm2

# Start API
cd packages/api
pm2 start npm --name testmaster-api -- start

# Start Web
cd packages/web
pm2 start npm --name testmaster-web -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## Need Help?

- Check `README.md` for overview
- Check `PROJECT_COMPLETE.md` for features
- Check API logs in console
- Check browser console for web errors

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Build packages: `npm run build`
3. ✅ Setup database
4. ✅ Configure .env
5. ✅ Run API: `cd packages/api && npm run dev`
6. ✅ Run Web: `cd packages/web && npm run dev`
7. ✅ Open http://localhost:3000
8. ✅ Create account and start testing!

Good luck! 🚀
