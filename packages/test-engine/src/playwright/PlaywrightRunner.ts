import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';
import { ExecutionConfig, TestStep, ExecutionResult, ExecutionLog } from '../types';
import { StepExecutor } from './StepExecutor';

export class PlaywrightRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private logs: ExecutionLog[] = [];
  private screenshots: string[] = [];
  private stepExecutor: StepExecutor | null = null;

  async initialize(config: ExecutionConfig = {}): Promise<void> {
    const {
      browser = 'chromium',
      headless = false,
      viewport = null,  // null = use full window size
      timeout = 30000,
    } = config;

    this.log('INFO', `Initializing Playwright with ${browser} browser`);

    try {
      // Launch args for fullscreen/maximized window
      const launchArgs = [
        '--start-maximized',  // Start Chrome maximized
        '--disable-blink-features=AutomationControlled',  // Hide automation
      ];

      switch (browser) {
        case 'firefox':
          this.browser = await firefox.launch({ 
            headless,
            args: launchArgs 
          });
          break;
        case 'webkit':
          this.browser = await webkit.launch({ 
            headless,
            args: launchArgs 
          });
          break;
        default:
          this.browser = await chromium.launch({ 
            headless,
            args: launchArgs  // Maximize Chrome window
          });
      }

      // Setup video recording to Downloads folder
      let recordVideoConfig = undefined;
      if (config.captureVideo !== false) {
        const os = require('os');
        const path = require('path');
        const fs = require('fs');
        
        // Get Downloads folder path
        const downloadsPath = path.join(os.homedir(), 'Downloads', 'TestMaster-Videos');
        
        // Create folder if not exists
        if (!fs.existsSync(downloadsPath)) {
          fs.mkdirSync(downloadsPath, { recursive: true });
        }
        
        recordVideoConfig = {
          dir: downloadsPath,
          size: { width: 1920, height: 1080 }
        };
        
        this.log('INFO', `📹 Video will be saved to: ${downloadsPath}`);
      }

      this.context = await this.browser.newContext({
        viewport: viewport || null,  // null means no fixed viewport, use full window
        recordVideo: recordVideoConfig,
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(timeout);

      this.stepExecutor = new StepExecutor(this.page, this.log.bind(this));

      this.log('INFO', 'Browser initialized successfully');
    } catch (error: any) {
      this.log('ERROR', `Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  async executeTest(steps: TestStep[], config: ExecutionConfig = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.logs = [];
    this.screenshots = [];

    try {
      if (!this.stepExecutor || !this.page) {
        throw new Error('Playwright not initialized. Call initialize() first.');
      }

      this.log('INFO', `Starting test execution with ${steps.length} steps`);

      for (const step of steps) {
        this.log('INFO', `Executing step ${step.orderIndex}: ${step.actionType}`);

        try {
          await this.stepExecutor.executeStep(step);

          if (config.screenshots) {
            const screenshot = await this.captureScreenshot(`step-${step.orderIndex}`);
            this.screenshots.push(screenshot);
          }
        } catch (error: any) {
          this.log('ERROR', `Step ${step.orderIndex} failed: ${error.message}`);
          
          const screenshot = await this.captureScreenshot(`error-step-${step.orderIndex}`);
          this.screenshots.push(screenshot);

          const duration = Date.now() - startTime;
          return {
            status: 'FAILED',
            duration,
            errorMessage: error.message,
            errorStack: error.stack,
            screenshots: this.screenshots,
            logs: this.logs,
          };
        }
      }

      const duration = Date.now() - startTime;
      this.log('INFO', `Test execution completed successfully in ${duration}ms`);

      return {
        status: 'PASSED',
        duration,
        screenshots: this.screenshots,
        logs: this.logs,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.log('ERROR', `Test execution failed: ${error.message}`);

      return {
        status: 'ERROR',
        duration,
        errorMessage: error.message,
        errorStack: error.stack,
        screenshots: this.screenshots,
        logs: this.logs,
      };
    }
  }

  private async captureScreenshot(name: string): Promise<string> {
    if (!this.page) return '';

    try {
      const screenshot = await this.page.screenshot({
        path: `./screenshots/${name}-${Date.now()}.png`,
        fullPage: false,
      });
      return screenshot.toString('base64');
    } catch (error: any) {
      this.log('WARN', `Failed to capture screenshot: ${error.message}`);
      return '';
    }
  }

  private log(level: ExecutionLog['level'], message: string, metadata?: Record<string, any>): void {
    const logEntry: ExecutionLog = {
      timestamp: new Date(),
      level,
      message,
      metadata,
    };
    this.logs.push(logEntry);
    console.log(`[${level}] ${message}`);
  }

  async close(): Promise<string | undefined> {
    let videoPath: string | undefined;
    
    try {
      // Get video path before closing page
      if (this.page) {
        try {
          const video = this.page.video();
          if (video) {
            this.log('INFO', '📹 Finalizing video recording...');
            // Close page first to finalize video
            await this.page.close();
            this.page = null;
            
            // Then get the video path
            videoPath = await video.path();
            this.log('INFO', `📹 Video saved to: ${videoPath}`);
          } else {
            this.log('WARN', 'No video object found on page');
            await this.page.close();
            this.page = null;
          }
        } catch (error: any) {
          this.log('ERROR', `Error getting video path: ${error.message}`);
          if (this.page) {
            await this.page.close();
            this.page = null;
          }
        }
      }
      
      // Close context to finalize video recording
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      // Close browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      this.log('INFO', 'Browser closed successfully');
      
      if (videoPath) {
        this.log('INFO', `📹 Final video path: ${videoPath}`);
      }
    } catch (error: any) {
      this.log('ERROR', `Failed to close browser: ${error.message}`);
    }
    
    return videoPath;
  }

  getPage(): Page | null {
    return this.page;
  }

  getLogs(): ExecutionLog[] {
    return this.logs;
  }

  getScreenshots(): string[] {
    return this.screenshots;
  }
}
