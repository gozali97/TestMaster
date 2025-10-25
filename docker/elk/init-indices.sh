#!/bin/bash

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch..."
until curl -s http://localhost:9200/_cluster/health | grep -q '"status":"green"\|"status":"yellow"'; do
  sleep 5
  echo "Still waiting..."
done

echo "Elasticsearch is ready! Creating indices..."

# Create testmaster-executions index
curl -X PUT "http://localhost:9200/testmaster-executions" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "index.mapping.total_fields.limit": 2000
  },
  "mappings": {
    "properties": {
      "testRunId": { "type": "keyword" },
      "testCaseId": { "type": "keyword" },
      "testCaseName": { "type": "text" },
      "status": { "type": "keyword" },
      "duration": { "type": "long" },
      "errorMessage": { "type": "text" },
      "errorStack": { "type": "text" },
      "logs": { "type": "text" },
      "screenshots": { "type": "keyword" },
      "environment": { "type": "keyword" },
      "browser": { "type": "keyword" },
      "timestamp": { "type": "date" }
    }
  }
}
'

# Create testmaster-failures index
curl -X PUT "http://localhost:9200/testmaster-failures" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "testRunId": { "type": "keyword" },
      "testCaseId": { "type": "keyword" },
      "failureCategory": { "type": "keyword" },
      "errorMessage": { "type": "text" },
      "stackTrace": { "type": "text" },
      "screenshot": { "type": "keyword" },
      "context": { "type": "object", "enabled": true },
      "embedding": { "type": "dense_vector", "dims": 1536 },
      "timestamp": { "type": "date" }
    }
  }
}
'

# Create testmaster-healing index
curl -X PUT "http://localhost:9200/testmaster-healing" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "testResultId": { "type": "keyword" },
      "objectId": { "type": "keyword" },
      "failedLocator": { "type": "keyword" },
      "healedLocator": { "type": "keyword" },
      "strategy": { "type": "keyword" },
      "confidence": { "type": "float" },
      "autoApplied": { "type": "boolean" },
      "timestamp": { "type": "date" }
    }
  }
}
'

# Create testmaster-metrics index
curl -X PUT "http://localhost:9200/testmaster-metrics" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "metricName": { "type": "keyword" },
      "metricValue": { "type": "double" },
      "tags": { "type": "object", "enabled": true },
      "timestamp": { "type": "date" }
    }
  }
}
'

echo "✅ All indices created successfully!"
