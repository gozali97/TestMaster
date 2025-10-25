# TestMaster Windows Installation Script
# Run this in PowerShell as Administrator

Write-Host "=== TestMaster Installation (API + Web Only) ===" -ForegroundColor Green
Write-Host ""

# Step 1: Install Shared Package
Write-Host "Step 1: Installing Shared Package..." -ForegroundColor Yellow
Set-Location -Path "packages\shared"
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build shared package!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Shared package built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Install Test Engine
Write-Host "Step 2: Installing Test Engine..." -ForegroundColor Yellow
Set-Location -Path "..\test-engine"
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build test-engine package!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Test Engine built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Install API
Write-Host "Step 3: Installing API..." -ForegroundColor Yellow
Set-Location -Path "..\api"
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build API package!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ API built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Install Web
Write-Host "Step 4: Installing Web Portal..." -ForegroundColor Yellow
Set-Location -Path "..\web"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install Web package!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Web Portal installed successfully" -ForegroundColor Green
Write-Host ""

# Go back to root
Set-Location -Path "..\..\"

Write-Host "=== Installation Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Setup database: mysql -u root -p -e 'CREATE DATABASE testmaster'"
Write-Host "2. Import schema: mysql -u root -p testmaster < database\schema.sql"
Write-Host "3. Copy .env.example to .env and configure"
Write-Host "4. Run API: cd packages\api && npm run dev"
Write-Host "5. Run Web: cd packages\web && npm run dev"
Write-Host ""
