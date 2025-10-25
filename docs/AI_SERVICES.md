# 🤖 AI Services Documentation

Complete guide to using TestMaster's AI-powered features.

## 📋 Table of Contents

1. [Setup](#setup)
2. [LLMClient](#llmclient)
3. [Prompt Templates](#prompt-templates)
4. [Cost Tracking](#cost-tracking)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

---

## 🔧 Setup

### 1. Get OpenAI API Key

1. Sign up at https://platform.openai.com
2. Navigate to API Keys section
3. Create new secret key
4. Copy the key (starts with `sk-`)

### 2. Configure Environment

Add to `.env`:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.1
```

**Models Available:**
- `gpt-4-turbo-preview` - Best quality, recommended (default)
- `gpt-4` - Standard GPT-4
- `gpt-3.5-turbo` - Faster, cheaper, less accurate

### 3. Verify Setup

```typescript
import llmClient from './services/ai/LLMClient';

// Check if enabled
if (llmClient.isEnabled()) {
  console.log('✅ AI services ready!');
} else {
  console.log('❌ Configure OPENAI_API_KEY first');
}
```

---

## 🧠 LLMClient

Main interface for AI operations.

### Basic Usage

#### Simple Completion

```typescript
import llmClient from './services/ai/LLMClient';

const response = await llmClient.complete(
  'Analyze this error: Element not found at selector #submit-button'
);

console.log(response); // AI analysis text
```

#### Chat with Context

```typescript
const response = await llmClient.chat([
  {
    role: 'system',
    content: 'You are an expert QA automation engineer.'
  },
  {
    role: 'user',
    content: 'Why is this test flaky?'
  }
]);

console.log(response.content); // AI response
console.log(response.tokens);  // Token usage
console.log(response.cost);    // Cost in USD
console.log(response.cached);  // Was it cached?
```

#### With Options

```typescript
const response = await llmClient.chat(messages, {
  temperature: 0.2,      // Lower = more deterministic
  maxTokens: 1500,       // Limit response length
  topP: 0.9,             // Nucleus sampling
  frequencyPenalty: 0.5, // Reduce repetition
  stop: ['\n\n']         // Stop sequences
});
```

### Features

#### ✅ Automatic Caching

Responses are cached in Redis:
- Identical requests return cached results instantly
- No API calls = No cost
- Default TTL: 24 hours
- Saves ~70-80% on API costs

```typescript
// First call - hits API
const response1 = await llmClient.complete('Analyze this test');

// Second call - returns cached (instant, free)
const response2 = await llmClient.complete('Analyze this test');

console.log(response2.cached); // true
```

#### ✅ Rate Limiting

Built-in rate limiting:
- 60 requests per minute (default)
- Automatic wait if limit exceeded
- Prevents 429 errors

```typescript
// Check rate limit status
const stats = llmClient.getUsageStats();
console.log(stats.requestCount);        // 45
console.log(stats.rateLimitRemaining);  // 15
```

#### ✅ Cost Calculation

Automatic cost calculation:

```typescript
const response = await llmClient.chat(messages);

console.log(`Tokens: ${response.tokens.total}`);
console.log(`Cost: $${response.cost.toFixed(4)}`);
// Output: Cost: $0.0234
```

#### ✅ Embeddings

Generate embeddings for similarity search:

```typescript
const embeddings = await llmClient.getEmbeddings(
  'User login fails with 500 error'
);

console.log(embeddings.length); // 1536 (dimension)
// Use for finding similar failures in Elasticsearch
```

---

## 📝 Prompt Templates

Pre-built prompts for common tasks.

### Failure Analysis

```typescript
import { PromptTemplates } from './services/ai';

const prompt = PromptTemplates.failureAnalysis({
  testName: 'Login Test',
  errorMessage: 'Element not found: #submit-button',
  stackTrace: error.stack,
  logs: testLogs,
  testCode: testCodeString,
  previousFailures: 'Failed 3 times in last week...'
});

const response = await llmClient.complete(prompt);
const analysis = JSON.parse(response);

console.log(analysis.category);        // 'TEST_SCRIPT_ISSUE'
console.log(analysis.rootCause);       // 'Locator changed...'
console.log(analysis.suggestedFixQA);  // 'Update locator to...'
console.log(analysis.confidence);      // 0.95
```

**Response Format:**
```json
{
  "category": "APPLICATION_BUG",
  "confidence": 0.95,
  "rootCause": "API returns 500 error when...",
  "suggestedFixDev": "Add null check in UserController...",
  "suggestedFixQA": "Update test to handle error state",
  "priority": "HIGH"
}
```

### Test Generation

```typescript
const prompt = PromptTemplates.testGeneration({
  feature: 'User Registration',
  userStory: 'As a user, I want to register with email...',
  acceptanceCriteria: [
    'Email must be valid format',
    'Password must be 8+ characters',
    'Confirmation email sent'
  ],
  existingObjects: [
    { name: 'emailInput', locator: '#email' },
    { name: 'submitButton', locator: 'button[type="submit"]' }
  ]
});

const response = await llmClient.complete(prompt);
const generated = JSON.parse(response);

console.log(generated.testCases.length); // 5 test cases
```

**Response Format:**
```json
{
  "testCases": [
    {
      "name": "User can register with valid email",
      "priority": "P0",
      "steps": [
        { "action": "navigate", "url": "/register" },
        { "action": "type", "locator": "#email", "value": "test@example.com" },
        { "action": "click", "locator": "button[type='submit']" }
      ],
      "expectedResult": "User receives confirmation email"
    }
  ]
}
```

### Test Impact Analysis

```typescript
const prompt = PromptTemplates.testImpactAnalysis({
  changedFiles: ['src/components/LoginForm.tsx'],
  changedFunctions: ['handleSubmit', 'validateEmail'],
  testName: 'Login Test',
  testCode: testCodeString
});

const response = await llmClient.complete(prompt);
const impact = JSON.parse(response);

if (impact.impacted) {
  console.log(`Risk: ${impact.riskLevel}`);
  console.log(`Reason: ${impact.reason}`);
}
```

### Locator Healing

```typescript
const prompt = PromptTemplates.locatorHealing({
  failedLocator: '#old-submit-button',
  pageSnapshot: htmlSnapshot,
  elementContext: 'Submit button in login form'
});

const response = await llmClient.complete(prompt);
const suggestions = JSON.parse(response);

suggestions.suggestions.forEach(s => {
  console.log(`${s.locator} (confidence: ${s.confidence})`);
  console.log(`  ${s.reasoning}`);
});
```

### Flakiness Analysis

```typescript
const prompt = PromptTemplates.flakinessAnalysis({
  testName: 'Checkout Flow',
  failureHistory: [
    { date: '2025-10-25', error: 'Timeout', duration: 5200 },
    { date: '2025-10-24', error: 'Timeout', duration: 5100 },
    { date: '2025-10-23', error: 'Element not found', duration: 3000 }
  ]
});

const response = await llmClient.complete(prompt);
const analysis = JSON.parse(response);

console.log(analysis.isFlaky);      // true
console.log(analysis.rootCause);    // 'Race condition...'
console.log(analysis.suggestedFix); // 'Add explicit wait...'
```

### Bug Report Generation

```typescript
const prompt = PromptTemplates.bugReportGeneration({
  testName: 'Login Test',
  errorMessage: '500 Internal Server Error',
  stackTrace: error.stack,
  screenshots: ['failure-screenshot.png'],
  logs: testLogs,
  environment: 'staging'
});

const response = await llmClient.complete(prompt);
const bugReport = JSON.parse(response);

// Create Jira ticket
await jiraClient.createIssue({
  summary: bugReport.title,
  description: bugReport.description,
  priority: bugReport.severity,
  components: bugReport.components,
  labels: bugReport.labels
});
```

---

## 💰 Cost Tracking

Monitor AI API usage and costs.

### Basic Tracking

```typescript
import costTracker from './services/ai/CostTracker';

// Track a cost entry
await costTracker.track({
  timestamp: new Date(),
  model: 'gpt-4-turbo-preview',
  operation: 'failure_analysis',
  promptTokens: 500,
  completionTokens: 200,
  totalTokens: 700,
  cost: 0.0234,
  featureType: 'failure_analysis'
});
```

### Get Cost Summary

```typescript
const summary = costTracker.getSummary();

console.log(`Total Cost: $${summary.totalCost.toFixed(2)}`);
console.log(`Total Requests: ${summary.totalEntries}`);
console.log('Cost by Model:', summary.costByModel);
console.log('Cost by Feature:', summary.costByFeature);
```

**Output:**
```
Total Cost: $127.43
Total Requests: 1,234
Cost by Model: {
  'gpt-4-turbo-preview': 98.50,
  'gpt-3.5-turbo': 28.93
}
Cost by Feature: {
  'failure_analysis': 85.20,
  'test_generation': 42.23
}
```

### Budget Monitoring

```typescript
const monthlyBudget = 500; // $500/month
const status = costTracker.getBudgetStatus(monthlyBudget);

console.log(`Budget: $${status.budget}`);
console.log(`Spent: $${status.spent.toFixed(2)}`);
console.log(`Remaining: $${status.remaining.toFixed(2)}`);
console.log(`Used: ${status.percentageUsed.toFixed(1)}%`);
console.log(`Days Remaining: ${status.daysRemaining}`);
console.log(`Projected Month Cost: $${status.projectedMonthCost.toFixed(2)}`);

if (costTracker.isBudgetExceeded(monthlyBudget)) {
  console.log('⚠️ Budget exceeded! Consider reducing API usage.');
}
```

**Output:**
```
Budget: $500
Spent: $127.43
Remaining: $372.57
Used: 25.5%
Days Remaining: 20
Projected Month Cost: $382.29
```

### Cost by Period

```typescript
// Today's cost
const todayCost = costTracker.getCostToday();
console.log(`Today: $${todayCost.toFixed(2)}`);

// This month's cost
const monthCost = costTracker.getCostThisMonth();
console.log(`This Month: $${monthCost.toFixed(2)}`);

// Custom period
const startDate = new Date('2025-10-01');
const endDate = new Date('2025-10-15');
const periodCost = costTracker.getCostForPeriod(startDate, endDate);
console.log(`Oct 1-15: $${periodCost.toFixed(2)}`);
```

---

## 💡 Examples

### Example 1: Analyze Test Failure

```typescript
import llmClient from './services/ai/LLMClient';
import { PromptTemplates } from './services/ai';
import costTracker from './services/ai/CostTracker';

async function analyzeFailure(testResult: any) {
  // Build prompt
  const prompt = PromptTemplates.failureAnalysis({
    testName: testResult.testName,
    errorMessage: testResult.errorMessage,
    stackTrace: testResult.stackTrace,
    logs: testResult.logs,
    testCode: testResult.testCode
  });

  // Get AI analysis
  const response = await llmClient.complete(prompt);
  const analysis = JSON.parse(response);

  // Track cost
  await costTracker.track({
    timestamp: new Date(),
    model: response.model,
    operation: 'analyze_failure',
    promptTokens: response.tokens.prompt,
    completionTokens: response.tokens.completion,
    totalTokens: response.tokens.total,
    cost: response.cost,
    featureType: 'failure_analysis'
  });

  // Log to metrics
  await MetricsCollector.recordMetric({
    metricName: 'ai_analysis_completed',
    metricValue: 1,
    tags: {
      category: analysis.category,
      confidence: analysis.confidence.toString()
    },
    timestamp: new Date()
  });

  return analysis;
}

// Usage
const analysis = await analyzeFailure(failedTest);
console.log(`Category: ${analysis.category}`);
console.log(`Root Cause: ${analysis.rootCause}`);
console.log(`Fix: ${analysis.suggestedFixQA}`);
```

### Example 2: Generate Tests from User Story

```typescript
async function generateTests(userStory: string) {
  const prompt = PromptTemplates.testGeneration({
    feature: 'Shopping Cart',
    userStory: userStory,
    acceptanceCriteria: [
      'User can add items to cart',
      'Cart persists across sessions',
      'User can remove items'
    ],
    existingObjects: await getExistingObjects()
  });

  const response = await llmClient.complete(prompt);
  const generated = JSON.parse(response);

  // Save generated tests
  for (const testCase of generated.testCases) {
    await saveTestCase({
      name: testCase.name,
      steps: testCase.steps,
      priority: testCase.priority,
      expectedResult: testCase.expectedResult
    });
  }

  console.log(`✅ Generated ${generated.testCases.length} test cases`);
  return generated.testCases;
}
```

### Example 3: Smart Test Selection

```typescript
async function selectTestsForCommit(commitSHA: string) {
  // Get changed files
  const changes = await gitAnalyzer.analyzeCommit(commitSHA);
  
  // Get all tests
  const allTests = await getAllTests();
  
  // Analyze each test
  const impactedTests = [];
  
  for (const test of allTests) {
    const prompt = PromptTemplates.testImpactAnalysis({
      changedFiles: changes.files,
      changedFunctions: changes.functions,
      testName: test.name,
      testCode: test.code
    });
    
    const response = await llmClient.complete(prompt);
    const impact = JSON.parse(response);
    
    if (impact.impacted && impact.riskLevel !== 'LOW') {
      impactedTests.push({
        ...test,
        riskLevel: impact.riskLevel,
        reason: impact.reason
      });
    }
  }
  
  console.log(`Selected ${impactedTests.length}/${allTests.length} tests`);
  return impactedTests;
}
```

---

## 🎯 Best Practices

### 1. Cache Aggressively

```typescript
// ✅ GOOD: Same prompt will be cached
const analysis1 = await llmClient.complete(standardPrompt);
const analysis2 = await llmClient.complete(standardPrompt); // Cached!

// ❌ BAD: Dynamic timestamps prevent caching
const prompt = `Analyze this at ${new Date().toISOString()}...`;
const analysis = await llmClient.complete(prompt); // Never cached
```

### 2. Use Lower Temperature for Deterministic Results

```typescript
// For analysis/classification (deterministic)
const response = await llmClient.chat(messages, {
  temperature: 0.1  // Low = consistent results
});

// For creative generation (varied)
const response = await llmClient.chat(messages, {
  temperature: 0.7  // Higher = more creative
});
```

### 3. Set Token Limits

```typescript
// ✅ GOOD: Prevent runaway costs
const response = await llmClient.chat(messages, {
  maxTokens: 1000  // Limit response length
});

// ❌ BAD: No limit (could be expensive)
const response = await llmClient.chat(messages);
```

### 4. Handle Errors Gracefully

```typescript
try {
  const response = await llmClient.complete(prompt);
  return response;
} catch (error: any) {
  if (error.message.includes('rate limit')) {
    // Wait and retry
    await new Promise(r => setTimeout(r, 5000));
    return await llmClient.complete(prompt);
  } else if (error.message.includes('Invalid API key')) {
    logger.error('OpenAI API key invalid');
    return fallbackAnalysis();
  } else {
    throw error;
  }
}
```

### 5. Monitor Costs

```typescript
// Check before expensive operations
const monthCost = costTracker.getCostThisMonth();
const budget = 500;

if (monthCost >= budget * 0.9) {
  logger.warn(`90% of budget used: $${monthCost}/$${budget}`);
  // Consider using cheaper model
  process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
}
```

### 6. Batch Similar Requests

```typescript
// ✅ GOOD: Batch similar analyses
const analyses = await Promise.all(
  failures.map(f => analyzeFailure(f))
);

// ❌ BAD: Sequential (slow)
for (const failure of failures) {
  await analyzeFailure(failure);
}
```

---

## 📊 Pricing Reference

**GPT-4 Turbo (gpt-4-turbo-preview):**
- Input: $0.01 / 1K tokens
- Output: $0.03 / 1K tokens
- **Average analysis:** ~$0.02-0.05 per request

**GPT-4:**
- Input: $0.03 / 1K tokens
- Output: $0.06 / 1K tokens
- **Average analysis:** ~$0.05-0.10 per request

**GPT-3.5 Turbo:**
- Input: $0.0005 / 1K tokens
- Output: $0.0015 / 1K tokens
- **Average analysis:** ~$0.001-0.003 per request

**Typical Monthly Usage:**
- Small team (10 devs): ~$100-200/month
- Medium team (50 devs): ~$500-800/month
- Large team (200+ devs): ~$2,000-3,000/month

**With 70% caching:** Reduce costs by 70%!

---

## 🔐 Security

- **Never log API keys**: Use environment variables
- **Sanitize inputs**: Remove sensitive data before sending to API
- **Use HTTPS**: All API calls encrypted
- **Monitor usage**: Track for unusual activity

---

## 🆘 Troubleshooting

### "LLM client is not enabled"
**Solution:** Set `OPENAI_API_KEY` in `.env`

### "OpenAI rate limit exceeded"
**Solution:** Wait or reduce `RATE_LIMIT` setting

### "Invalid API key"
**Solution:** Check API key at https://platform.openai.com/api-keys

### High costs
**Solution:** 
- Enable Redis caching
- Use `gpt-3.5-turbo` for non-critical features
- Set lower `maxTokens` limits
- Review `costTracker.getSummary()`

---

**Ready to use AI-powered testing!** 🚀
