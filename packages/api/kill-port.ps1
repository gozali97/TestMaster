# Kill process using port 3001
# Usage: .\kill-port.ps1

$port = 3001

Write-Host "Finding process using port $port..." -ForegroundColor Yellow

$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Found process with PID: $process" -ForegroundColor Green
    Write-Host "Killing process..." -ForegroundColor Yellow
    
    Stop-Process -Id $process -Force
    
    Write-Host "Process killed successfully!" -ForegroundColor Green
    Write-Host "Port $port is now available." -ForegroundColor Green
} else {
    Write-Host "No process found using port $port" -ForegroundColor Cyan
}
