# Stop All TestMaster Infrastructure Services

Write-Host "🛑 Stopping TestMaster Infrastructure..." -ForegroundColor Cyan
Write-Host ""

# Navigate to docker directory
$dockerDir = Join-Path $PSScriptRoot "..\docker"
Set-Location $dockerDir

# Stop all services
docker-compose -f docker-compose.all.yml stop

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start again: .\scripts\start-infrastructure.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to stop services" -ForegroundColor Red
    Write-Host ""
}
