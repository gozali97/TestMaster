"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutonomousTestingOrchestrator = void 0;
const playwright_1 = require("playwright");
const WebsiteCrawler_1 = require("../discovery/WebsiteCrawler");
const APICrawler_1 = require("../discovery/APICrawler");
const TestGenerator_1 = require("../generator/TestGenerator");
const TestExecutor_1 = require("../executor/TestExecutor");
const FailureAnalyzer_1 = require("../ai/FailureAnalyzer");
const ReportGenerator_1 = require("../reporter/ReportGenerator");
/**
 * Main orchestrator for Autonomous Testing
 *
 * This is the brain that coordinates all phases:
 * 1. Discovery - Crawl website & API
 * 2. Generation - Generate tests automatically
 * 3. Execution - Run tests with self-healing
 * 4. Analysis - AI analyzes failures
 * 5. Reporting - Generate comprehensive report
 */
class AutonomousTestingOrchestrator {
    browser;
    sessionId;
    progressCallback;
    constructor(sessionId, onProgress) {
        this.sessionId = sessionId;
        this.progressCallback = onProgress;
    }
    /**
     * Main entry point - run full autonomous testing
     */
    async runAutonomousTesting(config) {
        console.log(`\n🤖 Starting Autonomous Testing Session: ${this.sessionId}\n`);
        try {
            // Initialize browser with detailed logging
            console.log('🌐 [BROWSER] Launching browser...');
            console.log('🌐 [BROWSER] Headless mode:', config.headless ?? true);
            // Launch args for fullscreen/maximized window
            const launchArgs = [
                '--start-maximized', // Start Chrome maximized
                '--disable-blink-features=AutomationControlled', // Hide automation
            ];
            this.browser = await playwright_1.chromium.launch({
                headless: config.headless ?? true,
                timeout: 60000, // Increase launch timeout to 60s
                args: launchArgs, // Maximize browser window
            });
            console.log('✅ [BROWSER] Browser launched successfully');
            console.log('🌐 [BROWSER] Browser version:', this.browser.version());
            // PHASE 1: Discovery
            this.updateProgress({
                phase: 'discovery',
                progress: 0,
                message: 'Starting discovery phase...',
            });
            const applicationMap = await this.discoverApplication(config);
            // PHASE 1.5: Auto-Registration Testing (if no auth provided)
            if (!config.authentication && this.hasRegistrationForms(applicationMap)) {
                this.updateProgress({
                    phase: 'registration',
                    progress: 0,
                    message: 'Testing registration flow...',
                });
                await this.testRegistration(applicationMap, config);
            }
            // PHASE 2: Test Generation
            this.updateProgress({
                phase: 'generation',
                progress: 0,
                message: 'Generating test cases...',
            });
            const generatedTests = await this.generateTests(applicationMap, config);
            // PHASE 3: Test Execution
            this.updateProgress({
                phase: 'execution',
                progress: 0,
                message: `Executing ${generatedTests.length} tests...`,
            });
            const executionResults = await this.executeTests(generatedTests, config);
            // PHASE 4: Failure Analysis
            this.updateProgress({
                phase: 'analysis',
                progress: 0,
                message: 'Analyzing failures...',
            });
            const analysisResults = await this.analyzeFailures(executionResults, config);
            // PHASE 5: Report Generation
            this.updateProgress({
                phase: 'report',
                progress: 0,
                message: 'Generating report...',
            });
            const report = await this.generateReport({
                applicationMap,
                generatedTests,
                executionResults,
                analysisResults,
                config,
            });
            this.updateProgress({
                phase: 'completed',
                progress: 100,
                message: 'Autonomous testing completed!',
            });
            return {
                sessionId: this.sessionId,
                success: true,
                applicationMap,
                testsGenerated: generatedTests.length,
                testsPassed: executionResults.passed.length,
                testsFailed: executionResults.failed.length,
                testsHealed: executionResults.healed.length,
                duration: executionResults.totalDuration,
                report,
            };
        }
        catch (error) {
            console.error('❌❌❌ Autonomous testing failed:', error);
            console.error('Error Type:', error.constructor.name);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            this.updateProgress({
                phase: 'error',
                progress: 0,
                message: `Error: ${error.message}`,
            });
            throw error;
        }
        finally {
            // Cleanup - close browser only after everything is done
            if (this.browser) {
                console.log('🌐 [BROWSER] Closing browser...');
                try {
                    await this.browser.close();
                    console.log('✅ [BROWSER] Browser closed successfully');
                }
                catch (closeError) {
                    console.error('❌ [BROWSER] Error closing browser:', closeError.message);
                }
            }
        }
    }
    /**
     * Phase 1: Discover application structure
     */
    async discoverApplication(config) {
        console.log('🔍 Phase 1: Discovery');
        console.log('📄 [DISCOVERY] Creating new page for discovery...');
        const page = await this.browser.newPage();
        console.log('✅ [DISCOVERY] Page created successfully');
        try {
            // Discover website structure
            let websiteMap = null;
            if (config.websiteUrl) {
                const websiteCrawler = new WebsiteCrawler_1.WebsiteCrawler(page, (progress) => {
                    this.updateProgress({
                        phase: 'discovery',
                        progress: progress.progress * 0.6, // Website is 60% of discovery
                        message: `Crawling website: ${progress.message}`,
                        details: {
                            pagesFound: progress.pagesFound,
                            linksFound: progress.linksFound,
                        },
                    });
                });
                websiteMap = await websiteCrawler.crawl(config.websiteUrl, config.depth);
            }
            // Discover API structure
            let apiMap = null;
            if (config.apiUrl) {
                const apiCrawler = new APICrawler_1.APICrawler(page, (progress) => {
                    this.updateProgress({
                        phase: 'discovery',
                        progress: 60 + (progress.progress * 0.4), // API is 40% of discovery
                        message: `Discovering APIs: ${progress.message}`,
                        details: {
                            endpointsFound: progress.endpointsFound,
                        },
                    });
                });
                apiMap = await apiCrawler.discover(config.apiUrl);
            }
            this.updateProgress({
                phase: 'discovery',
                progress: 100,
                message: 'Discovery completed',
                details: {
                    pagesFound: websiteMap?.pages.length || 0,
                    endpointsFound: apiMap?.endpoints.length || 0,
                },
            });
            return {
                website: websiteMap,
                api: apiMap,
            };
        }
        catch (discoveryError) {
            console.error('❌ [DISCOVERY] Discovery phase failed:', discoveryError.message);
            throw discoveryError;
        }
        finally {
            console.log('🧹 [DISCOVERY] Closing discovery page...');
            try {
                if (!page.isClosed()) {
                    await page.close();
                    console.log('✅ [DISCOVERY] Discovery page closed');
                }
            }
            catch (closeError) {
                console.error('❌ [DISCOVERY] Error closing page:', closeError.message);
            }
        }
    }
    /**
     * Phase 2: Generate tests from application map
     */
    async generateTests(appMap, config) {
        console.log('🧪 Phase 2: Test Generation');
        const generator = new TestGenerator_1.TestGenerator((progress) => {
            this.updateProgress({
                phase: 'generation',
                progress: progress.progress,
                message: progress.message,
                details: {
                    testsGenerated: progress.testsGenerated,
                },
            });
        });
        const tests = await generator.generateTests(appMap, config);
        this.updateProgress({
            phase: 'generation',
            progress: 100,
            message: `Generated ${tests.length} test cases`,
        });
        return tests;
    }
    /**
     * Phase 3: Execute generated tests
     */
    async executeTests(tests, config) {
        console.log('▶️  Phase 3: Test Execution');
        const executor = new TestExecutor_1.TestExecutor(this.browser, (progress) => {
            this.updateProgress({
                phase: 'execution',
                progress: progress.progress,
                message: progress.message,
                details: {
                    total: progress.total,
                    completed: progress.completed,
                    passed: progress.passed,
                    failed: progress.failed,
                    healed: progress.healed,
                    currentTest: progress.currentTest,
                },
            });
        });
        const results = await executor.executeTests(tests, {
            parallelWorkers: config.parallelWorkers || 5,
            enableHealing: config.enableHealing ?? true,
            captureVideo: config.captureVideo ?? true,
            captureScreenshots: config.captureScreenshots ?? true,
        });
        this.updateProgress({
            phase: 'execution',
            progress: 100,
            message: `Execution completed: ${results.passed.length}/${tests.length} passed`,
        });
        return results;
    }
    /**
     * Phase 4: Analyze failures with AI
     */
    async analyzeFailures(results, config) {
        console.log('🧠 Phase 4: Failure Analysis');
        if (results.failed.length === 0) {
            this.updateProgress({
                phase: 'analysis',
                progress: 100,
                message: 'No failures to analyze - all tests passed!',
            });
            return [];
        }
        const analyzer = new FailureAnalyzer_1.FailureAnalyzer((progress) => {
            this.updateProgress({
                phase: 'analysis',
                progress: progress.progress,
                message: progress.message,
            });
        });
        const analyses = await analyzer.analyzeFailures(results.failed, config);
        this.updateProgress({
            phase: 'analysis',
            progress: 100,
            message: `Analyzed ${results.failed.length} failures`,
        });
        return analyses;
    }
    /**
     * Phase 5: Generate comprehensive report
     */
    async generateReport(data) {
        console.log('📊 Phase 5: Report Generation');
        const reportGenerator = new ReportGenerator_1.ReportGenerator();
        const report = await reportGenerator.generate(data);
        this.updateProgress({
            phase: 'report',
            progress: 100,
            message: 'Report generated successfully',
        });
        return report;
    }
    /**
     * Update progress and notify callback
     */
    updateProgress(update) {
        if (this.progressCallback) {
            this.progressCallback(update);
        }
    }
    /**
     * Check if application has registration forms
     */
    hasRegistrationForms(appMap) {
        if (!appMap.website)
            return false;
        const hasRegisterFlow = appMap.website.userFlows?.some(flow => flow.name.toLowerCase().includes('registration') ||
            flow.name.toLowerCase().includes('register') ||
            flow.name.toLowerCase().includes('signup'));
        const hasRegisterPage = appMap.website.pages.some(page => page.url.toLowerCase().includes('register') ||
            page.url.toLowerCase().includes('signup') ||
            page.title.toLowerCase().includes('sign up') ||
            page.title.toLowerCase().includes('register'));
        return hasRegisterFlow || hasRegisterPage;
    }
    /**
     * Test registration flow with auto-generated data
     */
    async testRegistration(appMap, _config) {
        console.log('📝 Testing Registration Flow...');
        // Import FakeDataGenerator
        const { FakeDataGenerator } = await Promise.resolve().then(() => __importStar(require('../utils/FakeDataGenerator')));
        // Find registration page
        const registerPages = appMap.website.pages.filter(page => page.url.toLowerCase().includes('register') ||
            page.url.toLowerCase().includes('signup') ||
            page.title.toLowerCase().includes('sign up') ||
            page.title.toLowerCase().includes('register'));
        if (registerPages.length === 0) {
            console.log('⚠️  No registration page found');
            return;
        }
        const registerPage = registerPages[0];
        console.log(`📄 Found registration page: ${registerPage.url}`);
        // Generate fake registration data
        const fakeData = FakeDataGenerator.generateRegistrationData();
        console.log('🎭 Generated fake user data:', {
            email: fakeData.email,
            username: fakeData.username,
            name: fakeData.fullName
        });
        this.updateProgress({
            phase: 'registration',
            progress: 30,
            message: 'Filling registration form with test data...',
            details: {
                email: fakeData.email,
                username: fakeData.username,
            },
        });
        try {
            // Create new page for registration test
            const page = await this.browser.newPage();
            // Navigate to registration page
            console.log(`🌐 Navigating to: ${registerPage.url}`);
            await page.goto(registerPage.url, { waitUntil: 'networkidle', timeout: 30000 });
            this.updateProgress({
                phase: 'registration',
                progress: 50,
                message: 'Auto-filling registration form...',
            });
            // Find and fill all input fields
            const inputs = registerPage.elements.filter(el => el.type === 'input');
            console.log(`📝 Found ${inputs.length} input fields`);
            for (const input of inputs) {
                try {
                    const fieldName = input.name || input.id || input.placeholder || '';
                    // Auto-generate appropriate data based on field name
                    const value = FakeDataGenerator.autoFill(fieldName, input.placeholder, input.type);
                    console.log(`  Filling ${fieldName}: ${value.substring(0, 20)}...`);
                    // Try multiple locator strategies
                    let filled = false;
                    if (input.id) {
                        try {
                            await page.fill(`#${input.id}`, value, { timeout: 5000 });
                            filled = true;
                        }
                        catch (e) { }
                    }
                    if (!filled && input.name) {
                        try {
                            await page.fill(`[name="${input.name}"]`, value, { timeout: 5000 });
                            filled = true;
                        }
                        catch (e) { }
                    }
                    if (!filled && input.placeholder) {
                        try {
                            await page.fill(`[placeholder="${input.placeholder}"]`, value, { timeout: 5000 });
                            filled = true;
                        }
                        catch (e) { }
                    }
                    if (filled) {
                        console.log(`  ✅ Filled ${fieldName}`);
                    }
                    else {
                        console.log(`  ⚠️  Could not fill ${fieldName}`);
                    }
                }
                catch (error) {
                    console.log(`  ❌ Error filling field: ${error.message}`);
                }
            }
            this.updateProgress({
                phase: 'registration',
                progress: 70,
                message: 'Submitting registration form...',
            });
            // Find and click submit button
            const buttons = registerPage.elements.filter(el => el.type === 'button');
            const submitButton = buttons.find(btn => btn.text?.toLowerCase().includes('submit') ||
                btn.text?.toLowerCase().includes('register') ||
                btn.text?.toLowerCase().includes('sign up') ||
                btn.text?.toLowerCase().includes('create'));
            if (submitButton) {
                console.log(`🔘 Clicking submit button: ${submitButton.text}`);
                // Try multiple locator strategies for button
                let clicked = false;
                if (submitButton.id) {
                    try {
                        await page.click(`#${submitButton.id}`, { timeout: 5000 });
                        clicked = true;
                    }
                    catch (e) { }
                }
                if (!clicked && submitButton.text) {
                    try {
                        await page.click(`button:has-text("${submitButton.text}")`, { timeout: 5000 });
                        clicked = true;
                    }
                    catch (e) { }
                }
                if (!clicked) {
                    try {
                        await page.click('button[type="submit"]', { timeout: 5000 });
                        clicked = true;
                    }
                    catch (e) { }
                }
                if (clicked) {
                    console.log('✅ Submit button clicked');
                    // Wait for navigation or response
                    await Promise.race([
                        page.waitForNavigation({ timeout: 10000 }),
                        page.waitForTimeout(5000)
                    ]).catch(() => { });
                    console.log(`📍 Current URL after submit: ${page.url()}`);
                    // Check if registration succeeded
                    const pageContent = await page.content();
                    const success = page.url() !== registerPage.url || // URL changed
                        pageContent.toLowerCase().includes('success') ||
                        pageContent.toLowerCase().includes('welcome') ||
                        pageContent.toLowerCase().includes('verify');
                    if (success) {
                        console.log('✅ Registration appears successful!');
                        this.updateProgress({
                            phase: 'registration',
                            progress: 100,
                            message: 'Registration test completed successfully!',
                            details: {
                                status: 'success',
                                redirectUrl: page.url(),
                            },
                        });
                    }
                    else {
                        console.log('⚠️  Registration result unclear');
                        this.updateProgress({
                            phase: 'registration',
                            progress: 100,
                            message: 'Registration test completed (result unclear)',
                            details: {
                                status: 'uncertain',
                            },
                        });
                    }
                }
                else {
                    console.log('⚠️  Could not click submit button');
                }
            }
            else {
                console.log('⚠️  No submit button found');
            }
            // Close page
            await page.close();
        }
        catch (error) {
            console.error('❌ Registration test failed:', error.message);
            this.updateProgress({
                phase: 'registration',
                progress: 100,
                message: `Registration test failed: ${error.message}`,
                details: {
                    status: 'failed',
                    error: error.message,
                },
            });
        }
        console.log('✅ Registration testing phase completed');
    }
    /**
     * Get current session ID
     */
    getSessionId() {
        return this.sessionId;
    }
}
exports.AutonomousTestingOrchestrator = AutonomousTestingOrchestrator;
//# sourceMappingURL=AutonomousTestingOrchestrator.js.map