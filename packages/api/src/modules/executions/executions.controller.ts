import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { TestRun, TestCase, Project } from '../../database/models';
import { PlaywrightRunner } from '@testmaster/test-engine';
import { transformTestSteps, validateTestSteps, getStepDescription } from '../../utils/testStepTransformer';
import MetricsCollector from '../../services/MetricsCollector';
import PrometheusMetrics from '../../services/PrometheusMetrics';
import { Logger } from '../../utils/logger';

export class ExecutionsController {
  private logger = new Logger('ExecutionsController');
  private metricsCollector = MetricsCollector;
  private prometheusMetrics = PrometheusMetrics;

  async startExecution(req: AuthRequest, res: Response) {
    try {
      const { projectId, testCaseIds, config } = req.body;

      const project = await Project.findOne({
        where: { id: projectId, organizationId: req.user.organizationId },
      });

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const testRun = await TestRun.create({
        projectId,
        status: 'PENDING',
        triggeredBy: req.user.id,
        executionConfig: config || {},
        totalTests: testCaseIds.length,
      });

      res.status(201).json({
        success: true,
        data: {
          runId: testRun.id,
          status: testRun.status,
          message: 'Test execution queued',
        },
      });

      this.executeTests(testRun.id, testCaseIds, config).catch(async (error) => {
        this.logger.error('Execution failed', error);
        await TestRun.update(
          {
            status: 'ERROR',
            completedAt: new Date(),
          },
          { where: { id: testRun.id } }
        );
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  private async executeTests(
    runId: number,
    testCaseIds: string[],
    config: any
  ): Promise<void> {
    this.logger.info('Starting test execution', { runId, testCaseIds: testCaseIds.length, config });
    const startTime = Date.now();
    
    // Initialize arrays to collect execution details
    const allLogs: string[] = [];
    const allScreenshots: string[] = [];
    const allVideos: string[] = []; // Collect all video paths
    let lastError: string | undefined;
    let lastErrorStack: string | undefined;

    try {
      await TestRun.update({ status: 'RUNNING', startedAt: new Date(), logs: ['🚀 Starting test execution...'] }, { where: { id: runId } });
      this.logger.info('Test run status updated to RUNNING');

      // Update Prometheus metrics
      this.prometheusMetrics.incrementActiveTestRuns();
      
      // Configure for manual testing - disable advanced features to avoid errors
      const runnerConfig = {
        ...config,
        headless: config.headless !== undefined ? config.headless : false, // Default visible for manual testing
        viewport: null, // ✅ FORCE NULL VIEWPORT for fullscreen/maximized window
        enableHealing: false, // Disable self-healing to avoid strategy errors
        slowMo: config.slowMo || 100, // Slow down for visibility
        captureVideo: config.captureVideo !== undefined ? config.captureVideo : true, // Enable video by default
        captureScreenshots: config.captureScreenshots !== undefined ? config.captureScreenshots : true, // Enable screenshots by default
      };
      
      this.logger.info('Runner config:', runnerConfig);
      allLogs.push('🔧 Browser configuration ready');
      if (runnerConfig.captureVideo) {
        allLogs.push('📹 Video recording: ENABLED (will be saved to Downloads/TestMaster-Videos)');
      }

      let passed = 0;
      let failed = 0;

      for (const testCaseId of testCaseIds) {
        this.logger.info(`Processing test case: ${testCaseId}`);
        const testCase = await TestCase.findByPk(testCaseId);
        
        if (!testCase) {
          this.logger.warn(`Test case not found: ${testCaseId}`);
          failed++;
          continue;
        }

        this.logger.info('Test case loaded', {
          id: testCase.id,
          name: testCase.name,
          type: testCase.type,
          stepsCount: testCase.steps?.length || 0
        });

        // Create a NEW runner for EACH test case to get individual videos
        const runner = new PlaywrightRunner();
        let testVideoPath: string | undefined;

        // Validate and transform steps
        try {
          if (!testCase.steps || !Array.isArray(testCase.steps)) {
            this.logger.error(`Invalid steps for test case ${testCase.id}`, { type: typeof testCase.steps });
            failed++;
            
            // Log failed test execution to metrics
            await this.logTestExecution(runId, testCase, 'FAILED', 0, 'Invalid test steps', config);
            continue;
          }

          if (testCase.steps.length === 0) {
            this.logger.warn(`Test case "${testCase.name}" has no steps`);
            failed++;
            
            // Log failed test execution to metrics
            await this.logTestExecution(runId, testCase, 'FAILED', 0, 'No test steps', config);
            continue;
          }

          this.logger.debug('Transforming test steps...');
          const transformedSteps = transformTestSteps(testCase.steps);
          this.logger.debug(`Transformed ${transformedSteps.length} steps`);

          // Validate steps
          this.logger.debug('Validating test steps...');
          const validation = validateTestSteps(transformedSteps);
          if (!validation.valid) {
            this.logger.error(`Step validation failed for "${testCase.name}"`, validation.errors);
            failed++;
            
            // Log failed test execution to metrics
            await this.logTestExecution(runId, testCase, 'FAILED', 0, `Validation failed: ${validation.errors.join(', ')}`, config);
            continue;
          }
          this.logger.debug('All steps validated');

          // Log steps to execute
          this.logger.debug('Steps to execute:', transformedSteps.map((step, idx) => 
            `${idx + 1}. ${getStepDescription(step)}`
          ));

          // Initialize runner for this specific test
          this.logger.info('Initializing browser for test...');
          allLogs.push(`🔧 Initializing browser for: ${testCase.name}`);
          await runner.initialize(runnerConfig);
          
          // Execute test
          this.logger.info(`Executing test: "${testCase.name}"`);
          allLogs.push(`▶️ Executing: ${testCase.name}`);
          const testStartTime = Date.now();
          const result = await runner.executeTest(transformedSteps, runnerConfig);
          const testDuration = Date.now() - testStartTime;
          
          // Collect logs from test execution
          if (result.logs && result.logs.length > 0) {
            allLogs.push(...result.logs.map(log => 
              typeof log === 'string' ? log : log.message || JSON.stringify(log)
            ));
          }
          
          // Collect screenshots
          if (result.screenshots && result.screenshots.length > 0) {
            allScreenshots.push(...result.screenshots);
          }
          
          // Close runner to finalize video for THIS test
          this.logger.info(`Closing browser to finalize video for "${testCase.name}"...`);
          try {
            testVideoPath = await runner.close();
            
            if (testVideoPath) {
              this.logger.info(`📹 Video saved: ${testVideoPath}`);
              allLogs.push(`📹 Video saved: ${testVideoPath}`);
              allVideos.push(testVideoPath);
            } else {
              this.logger.warn('No video path returned for this test');
              if (runnerConfig.captureVideo) {
                allLogs.push(`⚠️ Video recording was enabled but no video was captured for ${testCase.name}`);
              }
            }
          } catch (closeError: any) {
            this.logger.error(`Error closing browser for "${testCase.name}":`, closeError);
            allLogs.push(`⚠️ Error closing browser: ${closeError.message}`);
          }
          
          this.logger.info('Execution result', {
            testName: testCase.name,
            status: result.status,
            duration: result.duration || testDuration,
            screenshots: result.screenshots.length,
            logs: result.logs.length,
            video: testVideoPath || 'Not recorded'
          });

          // Log test execution to metrics
          await this.logTestExecution(
            runId, 
            testCase, 
            result.status, 
            result.duration || testDuration,
            result.errorMessage,
            config,
            result.errorStack,
            result.logs,
            result.screenshots
          );

          if (result.status === 'PASSED') {
            passed++;
            this.logger.info(`Test PASSED: "${testCase.name}" (${result.duration || testDuration}ms)`);
            allLogs.push(`✅ Test PASSED: ${testCase.name} (${testDuration}ms)`);
          } else {
            failed++;
            this.logger.error(`Test FAILED: "${testCase.name}"`, {
              error: result.errorMessage,
              stack: result.errorStack?.split('\n').slice(0, 3).join('\n')
            });
            allLogs.push(`❌ Test FAILED: ${testCase.name}`);
            if (result.errorMessage) {
              allLogs.push(`   Error: ${result.errorMessage}`);
              lastError = result.errorMessage;
              lastErrorStack = result.errorStack;
            }
          }
        } catch (stepError: any) {
          failed++;
          this.logger.error(`Error processing test "${testCase.name}"`, stepError);
          allLogs.push(`❌ Error processing test: ${stepError.message}`);
          
          // Close runner even on error
          try {
            testVideoPath = await runner.close();
            if (testVideoPath) {
              allLogs.push(`📹 Video saved (with error): ${testVideoPath}`);
              allVideos.push(testVideoPath);
            }
          } catch (closeError: any) {
            this.logger.error('Error closing browser after test error:', closeError);
          }
          
          // Log failed test execution to metrics
          await this.logTestExecution(runId, testCase, 'FAILED', 0, stepError.message, config, stepError.stack);
        }
      }

      const finalStatus = failed > 0 ? 'FAILED' : 'PASSED';
      const totalDuration = Date.now() - startTime;

      allLogs.push(`🏁 Execution completed: ${finalStatus}`);
      allLogs.push(`📊 Results: ${passed} passed, ${failed} failed (${totalDuration}ms)`);
      
      if (allVideos.length > 0) {
        allLogs.push(`📹 Total videos recorded: ${allVideos.length}`);
        allVideos.forEach((video, index) => {
          allLogs.push(`   ${index + 1}. ${video}`);
        });
      }

      this.logger.info('Execution completed', {
        status: finalStatus,
        passed,
        failed,
        total: testCaseIds.length,
        duration: totalDuration,
        screenshots: allScreenshots.length,
        videos: allVideos.length
      });

      // Record completion metrics
      await this.metricsCollector.recordMetric({
        metricName: 'test_run_duration',
        metricValue: totalDuration,
        tags: {
          runId: runId.toString(),
          status: finalStatus,
          totalTests: testCaseIds.length,
          passed,
          failed
        },
        timestamp: new Date()
      });

      // Update TestRun with all collected data
      // Store the first video path in the video field for backward compatibility
      // All video paths are also included in logs
      await TestRun.update(
        {
          status: finalStatus,
          completedAt: new Date(),
          passedTests: passed,
          failedTests: failed,
          logs: allLogs,
          screenshots: allScreenshots,
          video: allVideos.length > 0 ? allVideos[0] : null,
          errorMessage: lastError || null,
          errorStack: lastErrorStack || null,
        },
        { where: { id: runId } }
      );

      this.logger.info('Test run status updated to', finalStatus);
    } catch (error: any) {
      this.logger.error('Fatal error during execution', error);
      await TestRun.update(
        { status: 'ERROR', completedAt: new Date() },
        { where: { id: runId } }
      );
    } finally {
      // Decrement active test runs
      this.prometheusMetrics.decrementActiveTestRuns();
    }
  }

  /**
   * Helper method to log test execution to metrics collectors
   */
  private async logTestExecution(
    runId: number,
    testCase: any,
    status: any,  // Accept any status from test execution
    duration: number,
    errorMessage?: string,
    config?: any,
    errorStack?: string,
    logs?: any[],
    screenshots?: string[]
  ): Promise<void> {
    try {
      await this.metricsCollector.logTestExecution({
        testRunId: runId,
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        status: status as any,  // Cast to match interface
        duration,
        errorMessage,
        errorStack,
        logs,
        screenshots,
        environment: config?.environment || 'unknown',
        browser: config?.browserName || config?.browser || 'chromium',
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Failed to log test execution to metrics', error);
    }
  }

  async getExecutionStatus(req: AuthRequest, res: Response) {
    try {
      const { runId } = req.params;

      const testRun = await TestRun.findOne({
        where: { id: runId },
        include: [{ model: Project, where: { organizationId: req.user.organizationId } }],
      });

      if (!testRun) {
        return res.status(404).json({ success: false, error: 'Test run not found' });
      }

      res.json({ success: true, data: testRun });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listExecutions(req: AuthRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows } = await TestRun.findAndCountAll({
        where: { projectId },
        include: [{ model: Project, where: { organizationId: req.user.organizationId } }],
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: rows,
        meta: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async stopExecution(req: AuthRequest, res: Response) {
    try {
      const { runId } = req.params;

      const testRun = await TestRun.findOne({
        where: { id: runId },
        include: [{ model: Project, where: { organizationId: req.user.organizationId } }],
      });

      if (!testRun) {
        return res.status(404).json({ success: false, error: 'Test run not found' });
      }

      await testRun.update({ status: 'STOPPED', completedAt: new Date() });

      res.json({ success: true, message: 'Test execution stopped' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
