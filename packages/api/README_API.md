# TestMaster API - Quick Start Guide

## 🚀 Quick Commands

### Start API
```bash
npm start
```

### Stop API
```bash
npm run stop
```

### Restart API (rebuild + start)
```bash
npm run restart
```

### Kill Port 3001
```bash
npm run kill-port
```

### Development Mode (auto-reload)
```bash
npm run dev
```

### Build TypeScript
```bash
npm run build
```

## 📋 Common Issues & Solutions

### ❌ Error: "Cannot find module 'moment'"
**Solution**: Dependencies sudah ditambahkan
```bash
npm install
npm run build
npm start
```

### ❌ Error: "EADDRINUSE: address already in use :::3001"
**Solution**: Port sudah digunakan
```bash
npm run kill-port
npm start
```

atau

```bash
npm run restart
```

### ❌ Error: "Database connection failed"
**Solution**: Check `.env` configuration
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your database credentials
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start API server |
| `npm run stop` | Stop API server |
| `npm run restart` | Stop → Build → Start |
| `npm run kill-port` | Kill process on port 3001 |
| `npm run dev` | Dev mode with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run clean` | Remove dist folder |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run migrate` | Run database migrations |

## 🗂️ Project Structure

```
packages/api/
├── src/
│   ├── index.ts           # Entry point
│   ├── database/          # Database config & models
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── dist/                  # Compiled JavaScript (generated)
├── kill-port.ps1         # Helper: Kill port 3001
├── stop-api.ps1          # Helper: Stop API server
├── start-api.ps1         # Helper: Start with port check
└── package.json
```

## 🌐 API Endpoints

Once started, API runs on: **http://localhost:3001**

### Health Check
```bash
curl http://localhost:3001/health
```

### Swagger Documentation
```
http://localhost:3001/api-docs
```

## 📝 Environment Variables

Create `.env` file in `packages/api/`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=testmaster
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🔍 Troubleshooting

### Check if API is running
```powershell
netstat -ano | findstr :3001
```

### View API logs
Logs appear in console when running `npm start` or `npm run dev`

### Test API connection
```bash
curl http://localhost:3001/health
```

### Check database connection
Look for this message in console:
```
Database connection established successfully.
```

## 💻 Development Workflow

### 1. First Time Setup
```bash
cd packages/api
npm install
npm run build
npm start
```

### 2. Daily Development
```bash
# Use dev mode for auto-reload
npm run dev

# In another terminal, test your changes
curl http://localhost:3001/your-endpoint
```

### 3. Before Committing
```bash
npm run lint
npm test
npm run build
```

## 📚 Documentation

- **API Bug Fixes**: See `API_BUG_FIX.md`
- **Port Conflict Fix**: See `API_PORT_CONFLICT_FIX.md`
- **Full API Docs**: See Swagger at http://localhost:3001/api-docs

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure `.env` file
3. ✅ Run migrations: `npm run migrate`
4. ✅ Start API: `npm start`
5. ✅ Test API: `curl http://localhost:3001/health`
6. ✅ Check Swagger docs: http://localhost:3001/api-docs

---

**Status**: ✅ All bugs fixed and ready to use!

- ✅ moment dependency added
- ✅ Port conflict helper scripts created  
- ✅ npm scripts added for easy management
