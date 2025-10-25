# Start TestMaster API Server
# Usage: .\start-api.ps1

Write-Host "Starting TestMaster API Server..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if port 3001 is already in use
$port = 3001
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "WARNING: Port $port is already in use by PID: $process" -ForegroundColor Red
    $response = Read-Host "Do you want to kill the existing process? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Stop-Process -Id $process -Force
        Write-Host "Process killed. Starting API server..." -ForegroundColor Green
        Start-Sleep -Seconds 1
    } else {
        Write-Host "Aborted. Please stop the existing process first." -ForegroundColor Red
        exit 1
    }
}

# Start the API server
npm start
