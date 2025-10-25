# Check TestMaster Infrastructure Status

Write-Host "🔍 Checking TestMaster Infrastructure Status..." -ForegroundColor Cyan
Write-Host ""

function Test-Service {
    param (
        [string]$Name,
        [string]$Url,
        [string]$ExpectedPattern = ""
    )
    
    Write-Host "  Checking $Name..." -NoNewline -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            if ($ExpectedPattern -and $response.Content -notmatch $ExpectedPattern) {
                Write-Host " ⚠️  Running but unexpected response" -ForegroundColor Yellow
                return $false
            }
            Write-Host " ✅ Running" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host " ❌ Not accessible" -ForegroundColor Red
        return $false
    }
    
    return $false
}

# Check services
Write-Host "Service Health:" -ForegroundColor Cyan
Write-Host ""

$esRunning = Test-Service -Name "Elasticsearch" -Url "http://localhost:9200/_cluster/health" -ExpectedPattern "testmaster-cluster"
$kibanaRunning = Test-Service -Name "Kibana" -Url "http://localhost:5601/api/status"
$prometheusRunning = Test-Service -Name "Prometheus" -Url "http://localhost:9090/-/healthy"
$grafanaRunning = Test-Service -Name "Grafana" -Url "http://localhost:3100/api/health"
$minioRunning = Test-Service -Name "MinIO" -Url "http://localhost:9000/minio/health/live"

Write-Host ""

# Check Elasticsearch indices
if ($esRunning) {
    Write-Host "Elasticsearch Indices:" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        $indices = Invoke-RestMethod -Uri "http://localhost:9200/_cat/indices/testmaster-*?format=json" -UseBasicParsing
        foreach ($index in $indices) {
            $status = if ($index.health -eq "green") { "✅" } elseif ($index.health -eq "yellow") { "⚠️" } else { "❌" }
            Write-Host "  $status $($index.index) - Docs: $($index.'docs.count') - Size: $($index.'store.size')" -ForegroundColor White
        }
    } catch {
        Write-Host "  ⚠️  Could not retrieve indices" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Check MinIO buckets
if ($minioRunning) {
    Write-Host "MinIO Buckets:" -ForegroundColor Cyan
    Write-Host ""
    
    $expectedBuckets = @(
        "testmaster-screenshots",
        "testmaster-videos",
        "testmaster-baselines",
        "testmaster-reports"
    )
    
    foreach ($bucket in $expectedBuckets) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9000/$bucket" -Method Head -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 403) {
                Write-Host "  ✅ $bucket" -ForegroundColor Green
            }
        } catch {
            Write-Host "  ❌ $bucket - Not found" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# Summary
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host ""

$allRunning = $esRunning -and $kibanaRunning -and $prometheusRunning -and $grafanaRunning -and $minioRunning

if ($allRunning) {
    Write-Host "✅ All infrastructure services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access URLs:" -ForegroundColor Cyan
    Write-Host "  Elasticsearch:  http://localhost:9200" -ForegroundColor White
    Write-Host "  Kibana:         http://localhost:5601" -ForegroundColor White
    Write-Host "  Prometheus:     http://localhost:9090" -ForegroundColor White
    Write-Host "  Grafana:        http://localhost:3100" -ForegroundColor White
    Write-Host "  MinIO Console:  http://localhost:9001" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  Some services are not running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start infrastructure: .\scripts\start-infrastructure.ps1" -ForegroundColor White
    Write-Host ""
}

# Docker container status
Write-Host "Docker Containers:" -ForegroundColor Cyan
Write-Host ""

$dockerDir = Join-Path $PSScriptRoot "..\docker"
Push-Location $dockerDir
docker-compose -f docker-compose.all.yml ps
Pop-Location

Write-Host ""
