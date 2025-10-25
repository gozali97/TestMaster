"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Report Generator
 *
 * Generates comprehensive test reports:
 * - HTML report with screenshots
 * - JSON data export
 * - PDF report (optional)
 * - Statistics and summaries
 */
class ReportGenerator {
    /**
     * Generate complete report
     */
    async generate(data) {
        console.log('📊 Generating report...');
        const summary = this.generateSummary(data);
        const htmlReport = this.generateHTML(data, summary);
        const jsonReport = this.generateJSON(data, summary);
        // Save reports to disk
        const reportsDir = './test-results/reports';
        if (!fs_1.default.existsSync(reportsDir)) {
            fs_1.default.mkdirSync(reportsDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const htmlPath = path_1.default.join(reportsDir, `report-${timestamp}.html`);
        const jsonPath = path_1.default.join(reportsDir, `report-${timestamp}.json`);
        fs_1.default.writeFileSync(htmlPath, htmlReport);
        fs_1.default.writeFileSync(jsonPath, jsonReport);
        console.log(`  ✅ HTML report: ${htmlPath}`);
        console.log(`  ✅ JSON report: ${jsonPath}`);
        return {
            summary,
            details: {
                tests: data.executionResults.passed.concat(data.executionResults.failed, data.executionResults.healed),
                failures: data.analysisResults,
            },
            files: {
                html: htmlPath,
                json: jsonPath,
            },
        };
    }
    /**
     * Generate summary statistics
     */
    generateSummary(data) {
        const { executionResults, applicationMap } = data;
        const total = executionResults.total;
        const passed = executionResults.passed.length;
        const failed = executionResults.failed.length;
        const healed = executionResults.healed.length;
        const duration = executionResults.totalDuration;
        const pagesDiscovered = applicationMap.website?.pages.length || 0;
        const apisDiscovered = applicationMap.api?.endpoints.length || 0;
        const coverage = Math.min(((pagesDiscovered + apisDiscovered) / Math.max(total, 1)) * 100, 100);
        return {
            total,
            passed,
            failed,
            healed,
            duration,
            coverage: Math.round(coverage),
        };
    }
    /**
     * Generate HTML report
     */
    generateHTML(data, summary) {
        const { executionResults, analysisResults, applicationMap, config } = data;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Autonomous Testing Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .stat-card h3 { 
      color: #666; 
      font-size: 14px; 
      font-weight: 500;
      margin-bottom: 8px;
    }
    .stat-card .value {
      font-size: 36px;
      font-weight: 700;
      color: #333;
    }
    .stat-card.passed .value { color: #10b981; }
    .stat-card.failed .value { color: #ef4444; }
    .stat-card.healed .value { color: #f59e0b; }
    .section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #333;
    }
    .test-list { list-style: none; }
    .test-item {
      padding: 16px;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .test-item:last-child { border-bottom: none; }
    .test-name { font-weight: 500; color: #333; }
    .test-status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .test-status.passed { background: #d1fae5; color: #059669; }
    .test-status.failed { background: #fee2e2; color: #dc2626; }
    .test-status.healed { background: #fef3c7; color: #d97706; }
    .failure-card {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .failure-card h4 { color: #dc2626; margin-bottom: 8px; }
    .failure-card p { color: #666; line-height: 1.6; }
    .failure-card .fix {
      background: white;
      padding: 12px;
      border-radius: 6px;
      margin-top: 8px;
      font-size: 14px;
    }
    .discovery-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    .discovery-item {
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .discovery-item strong { display: block; margin-bottom: 4px; color: #333; }
    .discovery-item span { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Autonomous Testing Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
      <p>Duration: ${this.formatDuration(summary.duration)}</p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <h3>Total Tests</h3>
        <div class="value">${summary.total}</div>
      </div>
      <div class="stat-card passed">
        <h3>Passed</h3>
        <div class="value">${summary.passed}</div>
      </div>
      <div class="stat-card failed">
        <h3>Failed</h3>
        <div class="value">${summary.failed}</div>
      </div>
      <div class="stat-card healed">
        <h3>Healed</h3>
        <div class="value">${summary.healed}</div>
      </div>
      <div class="stat-card">
        <h3>Coverage</h3>
        <div class="value">${summary.coverage}%</div>
      </div>
      <div class="stat-card">
        <h3>Success Rate</h3>
        <div class="value">${Math.round(((summary.passed + summary.healed) / summary.total) * 100)}%</div>
      </div>
    </div>

    <div class="section">
      <h2>📋 Discovery Summary</h2>
      <div class="discovery-info">
        <div class="discovery-item">
          <strong>Website URL</strong>
          <span>${config.websiteUrl || 'Not tested'}</span>
        </div>
        <div class="discovery-item">
          <strong>API URL</strong>
          <span>${config.apiUrl || 'Not tested'}</span>
        </div>
        <div class="discovery-item">
          <strong>Pages Discovered</strong>
          <span>${applicationMap.website?.pages.length || 0}</span>
        </div>
        <div class="discovery-item">
          <strong>APIs Discovered</strong>
          <span>${applicationMap.api?.endpoints.length || 0}</span>
        </div>
      </div>
    </div>

    ${analysisResults.length > 0 ? `
    <div class="section">
      <h2>🐛 Failures Analysis (${analysisResults.length})</h2>
      ${analysisResults.map(analysis => `
        <div class="failure-card">
          <h4>${analysis.category} (Confidence: ${Math.round(analysis.confidence * 100)}%)</h4>
          <p><strong>Root Cause:</strong> ${analysis.rootCause}</p>
          ${analysis.suggestedFix.forDeveloper ? `
            <div class="fix">
              <strong>💡 For Developer:</strong> ${analysis.suggestedFix.forDeveloper}
            </div>
          ` : ''}
          ${analysis.suggestedFix.forQA ? `
            <div class="fix">
              <strong>🧪 For QA:</strong> ${analysis.suggestedFix.forQA}
            </div>
          ` : ''}
          ${analysis.jiraTicket ? `
            <p><strong>📋 Jira Ticket:</strong> ${analysis.jiraTicket}</p>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="section">
      <h2>✅ Passed Tests (${summary.passed})</h2>
      <ul class="test-list">
        ${executionResults.passed.slice(0, 50).map(test => `
          <li class="test-item">
            <span class="test-name">Test ${test.testId.substring(0, 8)}...</span>
            <span class="test-status passed">PASSED</span>
          </li>
        `).join('')}
        ${executionResults.passed.length > 50 ? `<li class="test-item"><span>... and ${executionResults.passed.length - 50} more</span></li>` : ''}
      </ul>
    </div>

    ${executionResults.healed.length > 0 ? `
    <div class="section">
      <h2>🔧 Self-Healed Tests (${summary.healed})</h2>
      <ul class="test-list">
        ${executionResults.healed.map(test => `
          <li class="test-item">
            <span class="test-name">Test ${test.testId.substring(0, 8)}...</span>
            <span class="test-status healed">HEALED</span>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    ${executionResults.failed.length > 0 ? `
    <div class="section">
      <h2>❌ Failed Tests (${summary.failed})</h2>
      <ul class="test-list">
        ${executionResults.failed.map(test => `
          <li class="test-item">
            <span class="test-name">Test ${test.testId.substring(0, 8)}... - ${test.error?.substring(0, 100)}</span>
            <span class="test-status failed">FAILED</span>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
    }
    /**
     * Generate JSON report
     */
    generateJSON(data, summary) {
        return JSON.stringify({
            summary,
            discovery: {
                website: {
                    url: data.config.websiteUrl,
                    pagesFound: data.applicationMap.website?.pages.length || 0,
                    userFlows: data.applicationMap.website?.userFlows.length || 0,
                },
                api: {
                    url: data.config.apiUrl,
                    endpointsFound: data.applicationMap.api?.endpoints.length || 0,
                },
            },
            execution: {
                total: data.executionResults.total,
                passed: data.executionResults.passed.length,
                failed: data.executionResults.failed.length,
                healed: data.executionResults.healed.length,
                duration: data.executionResults.totalDuration,
            },
            failures: data.analysisResults.map(a => ({
                category: a.category,
                rootCause: a.rootCause,
                confidence: a.confidence,
                jiraTicket: a.jiraTicket,
            })),
            config: data.config,
            timestamp: new Date().toISOString(),
        }, null, 2);
    }
    /**
     * Format duration
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${seconds}s`;
    }
}
exports.ReportGenerator = ReportGenerator;
//# sourceMappingURL=ReportGenerator.js.map