# Clean Restart Script for TestMaster Desktop App
# This script cleans cache and restarts the dev server

Write-Host "🧹 Cleaning TestMaster Desktop..." -ForegroundColor Cyan

# Kill all electron processes
Write-Host "Stopping Electron processes..." -ForegroundColor Yellow
Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill all node processes
Write-Host "Stopping Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -eq ""} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to fully terminate
Start-Sleep -Seconds 3

# Clean all cache directories thoroughly
Write-Host "Cleaning all cache directories..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue }
if (Test-Path ".vite") { Remove-Item -Recurse -Force ".vite" -ErrorAction SilentlyContinue }
if (Test-Path "dist-electron") { Remove-Item -Recurse -Force "dist-electron" -ErrorAction SilentlyContinue }

# Build main process
Write-Host "Building main process..." -ForegroundColor Yellow
npm run build:main

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
Write-Host "📌 Wait for Vite to show: Local: http://localhost:5175/" -ForegroundColor Gray
Write-Host "📌 Then Electron window will open automatically" -ForegroundColor Gray
Write-Host "📌 Press Ctrl+C to stop all processes" -ForegroundColor Gray
Write-Host ""

# Start dev server
npm run dev
