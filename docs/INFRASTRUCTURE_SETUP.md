# 🏗️ TestMaster Infrastructure Setup Guide

This guide covers setting up the complete infrastructure for TestMaster's Autonomous Testing features.

## 📦 Infrastructure Components

### 1. **ELK Stack** (Elasticsearch + Kibana)
- **Purpose:** Centralized logging and search
- **Ports:** 
  - Elasticsearch: 9200 (API), 9300 (Node communication)
  - Kibana: 5601 (Dashboard)

### 2. **Prometheus + Grafana**
- **Purpose:** Metrics collection and visualization
- **Ports:**
  - Prometheus: 9090 (Metrics API)
  - Grafana: 3100 (Dashboard)
  - Node Exporter: 9100 (System metrics)

### 3. **MinIO**
- **Purpose:** S3-compatible object storage
- **Ports:**
  - MinIO API: 9000
  - MinIO Console: 9001

---

## 🚀 Quick Start

### Option 1: Start All Services at Once

```bash
# Navigate to docker directory
cd docker

# Start all infrastructure services
docker-compose -f docker-compose.all.yml up -d

# Check status
docker-compose -f docker-compose.all.yml ps
```

### Option 2: Start Services Individually

#### Start ELK Stack
```bash
cd docker/elk
docker-compose up -d

# Wait for Elasticsearch to be ready (30-60 seconds)
# Initialize indices
bash init-indices.sh
```

#### Start Monitoring Stack
```bash
cd docker/monitoring
docker-compose up -d
```

#### Start MinIO
```bash
cd docker/minio
docker-compose up -d
```

---

## ✅ Verification

### Check Elasticsearch
```bash
# Health check
curl http://localhost:9200/_cluster/health

# List indices
curl http://localhost:9200/_cat/indices?v
```

Expected output:
```
{
  "cluster_name": "testmaster-cluster",
  "status": "yellow",
  "number_of_nodes": 1
}
```

### Check Kibana
Open browser: http://localhost:5601

You should see the Kibana home page.

### Check Prometheus
Open browser: http://localhost:9090

Go to Status → Targets to verify all scrape targets are up.

### Check Grafana
Open browser: http://localhost:3100

**Default credentials:**
- Username: `admin`
- Password: `admin`

Navigate to Dashboards → TestMaster Overview to see the main dashboard.

### Check MinIO
Open browser: http://localhost:9001

**Default credentials:**
- Username: `minioadmin`
- Password: `minioadmin`

You should see 4 buckets:
- `testmaster-screenshots`
- `testmaster-videos`
- `testmaster-baselines`
- `testmaster-reports`

---

## 📊 Elasticsearch Indices

The following indices are automatically created:

| Index | Purpose | Key Fields |
|-------|---------|------------|
| `testmaster-executions` | Test execution logs | testRunId, testCaseId, status, duration |
| `testmaster-failures` | Failure events | failureCategory, errorMessage, embedding |
| `testmaster-healing` | Self-healing events | failedLocator, healedLocator, strategy |
| `testmaster-metrics` | Custom metrics | metricName, metricValue, tags |

---

## 🔧 Configuration

### Elasticsearch Memory

Default: 512MB heap. To increase:

Edit `docker/elk/docker-compose.yml`:
```yaml
environment:
  - "ES_JAVA_OPTS=-Xms1g -Xmx1g"  # Increase to 1GB
```

### Prometheus Scrape Interval

Edit `docker/monitoring/prometheus.yml`:
```yaml
global:
  scrape_interval: 15s  # Change to desired interval
```

### MinIO Storage Location

To use persistent storage location:

Edit `docker/minio/docker-compose.yml`:
```yaml
volumes:
  - /path/to/persistent/storage:/data  # Custom path
```

---

## 🛠️ Troubleshooting

### Elasticsearch won't start
**Problem:** Container exits immediately

**Solution:**
```bash
# Increase virtual memory
# Linux:
sudo sysctl -w vm.max_map_count=262144

# Windows (WSL2):
wsl -d docker-desktop
sysctl -w vm.max_map_count=262144
```

### Kibana shows "Kibana server is not ready yet"
**Problem:** Kibana can't connect to Elasticsearch

**Solution:**
```bash
# Check Elasticsearch is running
docker logs testmaster-elasticsearch

# Wait 1-2 minutes for Elasticsearch to fully start
```

### Prometheus targets are down
**Problem:** `host.docker.internal` not resolving

**Solution:**
Edit `docker/monitoring/prometheus.yml` and replace `host.docker.internal` with:
- Linux: `172.17.0.1` (Docker bridge IP)
- Windows/Mac: `host.docker.internal` should work

### MinIO buckets not created
**Problem:** minio-init container fails

**Solution:**
```bash
# Manually create buckets
docker exec testmaster-minio mc mb /data/testmaster-screenshots
docker exec testmaster-minio mc mb /data/testmaster-videos
docker exec testmaster-minio mc mb /data/testmaster-baselines
docker exec testmaster-minio mc mb /data/testmaster-reports
```

---

## 🔄 Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.all.yml logs -f

# Specific service
docker logs -f testmaster-elasticsearch
docker logs -f testmaster-kibana
docker logs -f testmaster-prometheus
docker logs -f testmaster-grafana
docker logs -f testmaster-minio
```

### Stop Services
```bash
# Stop all
docker-compose -f docker-compose.all.yml stop

# Stop specific
cd docker/elk && docker-compose stop
cd docker/monitoring && docker-compose stop
cd docker/minio && docker-compose stop
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.all.yml restart

# Restart specific
docker restart testmaster-elasticsearch
```

### Remove Services (⚠️ Data Loss)
```bash
# Remove all containers and volumes
docker-compose -f docker-compose.all.yml down -v

# Remove specific
cd docker/elk && docker-compose down -v
```

---

## 📈 Performance Tuning

### For Production

1. **Increase Elasticsearch heap:**
   - Recommended: 50% of available RAM (max 32GB)
   - Edit `ES_JAVA_OPTS` in docker-compose.yml

2. **Enable Elasticsearch replicas:**
   ```bash
   curl -X PUT "localhost:9200/testmaster-*/_settings" -H 'Content-Type: application/json' -d'
   {
     "index": {
       "number_of_replicas": 1
     }
   }
   '
   ```

3. **Prometheus retention:**
   Add to Prometheus command:
   ```yaml
   - '--storage.tsdb.retention.time=30d'
   ```

4. **Grafana performance:**
   - Enable caching
   - Use read-only dashboards
   - Limit time range queries

---

## 🔐 Security (Production)

### Enable Elasticsearch Security
Edit `docker/elk/docker-compose.yml`:
```yaml
environment:
  - xpack.security.enabled=true
  - ELASTIC_PASSWORD=your-secure-password
```

### Enable MinIO TLS
```bash
# Generate certificates
docker exec testmaster-minio mc admin cert generate

# Update docker-compose with TLS settings
```

### Secure Grafana
```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=secure-password
  - GF_SERVER_PROTOCOL=https
  - GF_SERVER_CERT_FILE=/etc/grafana/ssl/cert.pem
  - GF_SERVER_CERT_KEY=/etc/grafana/ssl/key.pem
```

---

## 📚 Next Steps

After infrastructure is running:
1. ✅ Configure TestMaster API to use these services
2. ✅ Create MetricsCollector service (Task 0.3)
3. ✅ Setup OpenAI integration (Task 0.5)
4. ✅ Setup Computer Vision (Task 0.6)

See [Phase 0 Implementation Tasks](../AUTONOMOUS_TESTING_IMPLEMENTATION_TASKS.md) for details.

---

## 📞 Support

- **Elasticsearch Docs:** https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- **Kibana Docs:** https://www.elastic.co/guide/en/kibana/current/index.html
- **Prometheus Docs:** https://prometheus.io/docs/
- **Grafana Docs:** https://grafana.com/docs/
- **MinIO Docs:** https://docs.min.io/

---

**Last Updated:** 2025-10-25
**Version:** 1.0
