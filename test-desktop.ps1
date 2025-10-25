# Test Desktop Dev Mode
Write-Host "Testing Desktop Dev Mode..." -ForegroundColor Green

cd packages\desktop

Write-Host "`nStarting Desktop IDE in dev mode..." -ForegroundColor Yellow
Write-Host "This will open 3 processes:" -ForegroundColor Cyan
Write-Host "  1. TypeScript compiler (main process)" -ForegroundColor White
Write-Host "  2. Vite dev server (renderer)" -ForegroundColor White  
Write-Host "  3. Electron window" -ForegroundColor White
Write-Host ""

npm run dev
