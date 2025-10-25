# Stop TestMaster API Server
# Usage: .\stop-api.ps1

Write-Host "Stopping TestMaster API Server..." -ForegroundColor Yellow

# Kill process using port 3001
$port = 3001
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Found API server with PID: $process" -ForegroundColor Green
    Stop-Process -Id $process -Force
    Write-Host "API server stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "API server is not running." -ForegroundColor Cyan
}

# Also try to find node processes running index.js
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*dist/index.js*" }

if ($nodeProcesses) {
    Write-Host "Found additional node processes, stopping..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Write-Host "All node processes stopped." -ForegroundColor Green
}
