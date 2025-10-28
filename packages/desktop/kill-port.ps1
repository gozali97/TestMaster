# Kill Process on Port Script
# Usage: .\kill-port.ps1 -Port 5175

param(
    [Parameter(Mandatory=$true)]
    [int]$Port
)

Write-Host "🔍 Checking port $Port..." -ForegroundColor Cyan

# Find process using the port
$processId = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processId) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "⚠️  Port $Port is being used by: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
        Write-Host "🛑 Killing process..." -ForegroundColor Red
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✅ Process killed successfully!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Port $Port is free!" -ForegroundColor Green
}
