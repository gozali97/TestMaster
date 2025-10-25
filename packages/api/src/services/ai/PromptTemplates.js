"use strict";
/**
 * Prompt templates for AI-powered features
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplates = void 0;
class PromptTemplates {
    /**
     * Failure Analysis Prompt
     */
    static failureAnalysis(context) {
        return `You are an expert QA automation engineer analyzing a test failure.

**Test Information:**
- Test Name: ${context.testName}
- Error: ${context.errorMessage}

**Stack Trace:**
\`\`\`
${context.stackTrace || 'Not available'}
\`\`\`

${context.testCode ? `**Test Code:**
\`\`\`typescript
${context.testCode}
\`\`\`
` : ''}

${context.logs && context.logs.length > 0 ? `**Recent Logs:**
${context.logs.slice(-10).join('\n')}
` : ''}

${context.previousFailures ? `**Similar Previous Failures:**
${context.previousFailures}
` : ''}

**Task:** Analyze this test failure and provide:

1. **Category** (choose ONE):
   - APPLICATION_BUG: The application has a defect
   - TEST_SCRIPT_ISSUE: The test code needs fixing
   - ENVIRONMENT_ISSUE: Infrastructure/environment problem
   - FLAKY_TEST: Non-deterministic behavior
   - TEST_DATA_ISSUE: Problem with test data

2. **Root Cause**: A clear, specific explanation of what caused the failure

3. **Suggested Fix for Developer**: Concrete steps a developer should take to fix this (if APPLICATION_BUG)

4. **Suggested Fix for QA**: Concrete steps a QA engineer should take (if TEST_SCRIPT_ISSUE)

5. **Priority**: LOW, MEDIUM, HIGH, or CRITICAL

6. **Confidence**: Your confidence level (0.0 to 1.0)

Respond in this JSON format:
\`\`\`json
{
  "category": "APPLICATION_BUG",
  "confidence": 0.95,
  "rootCause": "...",
  "suggestedFixDev": "...",
  "suggestedFixQA": "...",
  "priority": "HIGH"
}
\`\`\``;
    }
    /**
     * Test Generation from Specification
     */
    static testGeneration(context) {
        return `You are an expert QA automation engineer creating test cases.

**Feature:** ${context.feature}

${context.userStory ? `**User Story:**
${context.userStory}
` : ''}

${context.acceptanceCriteria && context.acceptanceCriteria.length > 0 ? `**Acceptance Criteria:**
${context.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join('\n')}
` : ''}

${context.existingObjects && context.existingObjects.length > 0 ? `**Available Test Objects:**
${context.existingObjects.map(obj => `- ${obj.name}: ${obj.locator}`).join('\n')}
` : ''}

**Task:** Generate comprehensive test cases for this feature.

For each test case, provide:
1. **Test Name**: Clear, descriptive name
2. **Test Steps**: Array of steps with action, locator, and value
3. **Expected Result**: What should happen
4. **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)

Respond in this JSON format:
\`\`\`json
{
  "testCases": [
    {
      "name": "User can login with valid credentials",
      "priority": "P0",
      "steps": [
        { "action": "navigate", "url": "/login" },
        { "action": "type", "locator": "#username", "value": "testuser" },
        { "action": "type", "locator": "#password", "value": "password123" },
        { "action": "click", "locator": "button[type='submit']" },
        { "action": "assert", "locator": ".dashboard", "assertion": "visible" }
      ],
      "expectedResult": "User is redirected to dashboard"
    }
  ]
}
\`\`\`

Generate 3-5 test cases covering positive, negative, and edge cases.`;
    }
    /**
     * Code Analysis for Test Impact
     */
    static testImpactAnalysis(context) {
        return `You are analyzing code changes to determine test impact.

**Changed Files:**
${context.changedFiles.map(f => `- ${f}`).join('\n')}

**Changed Functions:**
${context.changedFunctions.map(f => `- ${f}`).join('\n')}

**Test to Evaluate:**
Name: ${context.testName}

Code:
\`\`\`typescript
${context.testCode}
\`\`\`

**Task:** Determine if this test is likely to be affected by the code changes.

Consider:
1. Does the test directly use any changed functions?
2. Does the test interact with UI elements that might be affected?
3. Are there indirect dependencies?

Respond in JSON:
\`\`\`json
{
  "impacted": true,
  "confidence": 0.85,
  "reason": "Test uses LoginForm which was modified",
  "riskLevel": "HIGH"
}
\`\`\``;
    }
    /**
     * Locator Healing Suggestion
     */
    static locatorHealing(context) {
        return `You are helping fix a broken test locator.

**Failed Locator:** \`${context.failedLocator}\`

**Current Page Structure:**
\`\`\`html
${context.pageSnapshot}
\`\`\`

${context.elementContext ? `**Element Context:**
${context.elementContext}
` : ''}

**Task:** Suggest alternative locators that would work.

Prioritize:
1. Stable locators (data-testid, aria-label)
2. Semantic locators (role, accessible name)
3. CSS selectors (only if needed)

Respond in JSON:
\`\`\`json
{
  "suggestions": [
    {
      "locator": "[data-testid='submit-button']",
      "confidence": 0.95,
      "reasoning": "Found stable data-testid attribute"
    },
    {
      "locator": "button[aria-label='Submit']",
      "confidence": 0.85,
      "reasoning": "Accessible aria-label present"
    }
  ]
}
\`\`\``;
    }
    /**
     * Test Flakiness Analysis
     */
    static flakinessAnalysis(context) {
        return `Analyze test flakiness patterns.

**Test:** ${context.testName}

**Failure History (last 10 runs):**
${context.failureHistory.map((f, i) => `${i + 1}. ${f.date}: ${f.error} (${f.duration}ms)`).join('\n')}

**Task:** Identify the root cause of flakiness.

Common causes:
- Race conditions
- Timing issues
- External dependencies
- Test data conflicts
- Environment instability

Respond in JSON:
\`\`\`json
{
  "isFlaky": true,
  "confidence": 0.90,
  "rootCause": "Race condition - test doesn't wait for API response",
  "suggestedFix": "Add explicit wait for API response before asserting",
  "pattern": "Fails intermittently after 2-3 seconds"
}
\`\`\``;
    }
    /**
     * Bug Report Generation
     */
    static bugReportGeneration(context) {
        return `Generate a detailed bug report.

**Test:** ${context.testName}
**Environment:** ${context.environment}
**Error:** ${context.errorMessage}

${context.stackTrace ? `**Stack Trace:**
\`\`\`
${context.stackTrace}
\`\`\`
` : ''}

${context.screenshots && context.screenshots.length > 0 ? `**Screenshots:** ${context.screenshots.length} available
` : ''}

${context.logs && context.logs.length > 0 ? `**Logs:**
${context.logs.slice(-5).join('\n')}
` : ''}

**Task:** Create a comprehensive bug report for JIRA.

Include:
1. **Title**: Clear, specific bug title
2. **Description**: Detailed description with steps to reproduce
3. **Expected vs Actual**: What should happen vs what happened
4. **Severity**: Blocker, Critical, Major, Minor, Trivial
5. **Components**: Affected system components
6. **Labels**: Relevant labels

Respond in JSON:
\`\`\`json
{
  "title": "Login fails with 500 error when...",
  "description": "Detailed description...",
  "expectedBehavior": "User should be logged in",
  "actualBehavior": "500 error returned",
  "stepsToReproduce": [
    "1. Navigate to /login",
    "2. Enter credentials",
    "3. Click submit"
  ],
  "severity": "Critical",
  "components": ["Authentication", "API"],
  "labels": ["bug", "backend", "api"]
}
\`\`\``;
    }
}
exports.PromptTemplates = PromptTemplates;
exports.default = PromptTemplates;
//# sourceMappingURL=PromptTemplates.js.map