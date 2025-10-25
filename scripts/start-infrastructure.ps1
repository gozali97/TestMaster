# Start All TestMaster Infrastructure Services

Write-Host "🚀 Starting TestMaster Infrastructure..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Navigate to docker directory
$dockerDir = Join-Path $PSScriptRoot "..\docker"
Set-Location $dockerDir

Write-Host "📦 Starting all infrastructure services..." -ForegroundColor Yellow
Write-Host ""

# Start all services
docker-compose -f docker-compose.all.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f docker-compose.all.yml ps
    
    Write-Host ""
    Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Elasticsearch:  http://localhost:9200" -ForegroundColor White
    Write-Host "  Kibana:         http://localhost:5601" -ForegroundColor White
    Write-Host "  Prometheus:     http://localhost:9090" -ForegroundColor White
    Write-Host "  Grafana:        http://localhost:3100 (admin/admin)" -ForegroundColor White
    Write-Host "  MinIO Console:  http://localhost:9001 (minioadmin/minioadmin)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📝 Initializing Elasticsearch indices..." -ForegroundColor Yellow
    
    # Wait for Elasticsearch to be fully ready
    $maxAttempts = 30
    $attempt = 0
    $esReady = $false
    
    while (-not $esReady -and $attempt -lt $maxAttempts) {
        $attempt++
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9200/_cluster/health" -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $esReady = $true
                Write-Host "✅ Elasticsearch is ready!" -ForegroundColor Green
            }
        } catch {
            Write-Host "  Waiting for Elasticsearch... (attempt $attempt/$maxAttempts)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
    
    if ($esReady) {
        Write-Host ""
        Write-Host "📝 Creating Elasticsearch indices..." -ForegroundColor Yellow
        
        # Create indices using PowerShell
        $indices = @{
            "testmaster-executions" = @{
                settings = @{
                    number_of_shards = 1
                    number_of_replicas = 0
                    "index.mapping.total_fields.limit" = 2000
                }
                mappings = @{
                    properties = @{
                        testRunId = @{ type = "keyword" }
                        testCaseId = @{ type = "keyword" }
                        testCaseName = @{ type = "text" }
                        status = @{ type = "keyword" }
                        duration = @{ type = "long" }
                        errorMessage = @{ type = "text" }
                        errorStack = @{ type = "text" }
                        logs = @{ type = "text" }
                        screenshots = @{ type = "keyword" }
                        environment = @{ type = "keyword" }
                        browser = @{ type = "keyword" }
                        timestamp = @{ type = "date" }
                    }
                }
            }
            "testmaster-failures" = @{
                settings = @{
                    number_of_shards = 1
                    number_of_replicas = 0
                }
                mappings = @{
                    properties = @{
                        testRunId = @{ type = "keyword" }
                        testCaseId = @{ type = "keyword" }
                        failureCategory = @{ type = "keyword" }
                        errorMessage = @{ type = "text" }
                        stackTrace = @{ type = "text" }
                        screenshot = @{ type = "keyword" }
                        context = @{ type = "object"; enabled = $true }
                        embedding = @{ type = "dense_vector"; dims = 1536 }
                        timestamp = @{ type = "date" }
                    }
                }
            }
            "testmaster-healing" = @{
                settings = @{
                    number_of_shards = 1
                    number_of_replicas = 0
                }
                mappings = @{
                    properties = @{
                        testResultId = @{ type = "keyword" }
                        objectId = @{ type = "keyword" }
                        failedLocator = @{ type = "keyword" }
                        healedLocator = @{ type = "keyword" }
                        strategy = @{ type = "keyword" }
                        confidence = @{ type = "float" }
                        autoApplied = @{ type = "boolean" }
                        timestamp = @{ type = "date" }
                    }
                }
            }
            "testmaster-metrics" = @{
                settings = @{
                    number_of_shards = 1
                    number_of_replicas = 0
                }
                mappings = @{
                    properties = @{
                        metricName = @{ type = "keyword" }
                        metricValue = @{ type = "double" }
                        tags = @{ type = "object"; enabled = $true }
                        timestamp = @{ type = "date" }
                    }
                }
            }
        }
        
        foreach ($indexName in $indices.Keys) {
            try {
                $body = $indices[$indexName] | ConvertTo-Json -Depth 10
                Invoke-RestMethod -Uri "http://localhost:9200/$indexName" -Method Put -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue | Out-Null
                Write-Host "  ✅ Created index: $indexName" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️  Index $indexName may already exist" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "✅ Elasticsearch indices created!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Elasticsearch took too long to start. Please run init-indices.sh manually." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎉 Infrastructure is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Check service health in Grafana: http://localhost:3100" -ForegroundColor White
    Write-Host "  2. Configure TestMaster API to use these services" -ForegroundColor White
    Write-Host "  3. Continue with Phase 0, Task 0.3 (MetricsCollector)" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "❌ Failed to start infrastructure services" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  - Check Docker Desktop is running" -ForegroundColor White
    Write-Host "  - Check ports are not already in use" -ForegroundColor White
    Write-Host "  - View logs: docker-compose -f docker-compose.all.yml logs" -ForegroundColor White
    Write-Host ""
    exit 1
}
