// Local Playwright executor running inside the Electron main process.
// This lets the packaged desktop app run automation using the BUNDLED
// Chromium (via PLAYWRIGHT_BROWSERS_PATH) without a separate API server
// or a system-wide Playwright install.

import { transformTestSteps, getStepDescription, EngineTestStep } from './stepTransformer';

// test-engine is a CommonJS build; require keeps resolution simple.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PlaywrightRunner } = require('@testmaster/test-engine');

export interface LocalExecutionPayload {
  steps: any[];
  config?: {
    browser?: 'chromium' | 'firefox' | 'webkit';
    headless?: boolean;
    captureVideo?: boolean;
    captureScreenshots?: boolean;
    slowMo?: number;
    timeout?: number;
  };
  name?: string;
}

export interface LocalExecutionResult {
  success: boolean;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  duration?: number;
  errorMessage?: string;
  errorStack?: string;
  screenshots?: string[];
  logs: string[];
  video?: string;
}

export async function runLocalExecution(
  payload: LocalExecutionPayload
): Promise<LocalExecutionResult> {
  const logs: string[] = [];
  const push = (m: string) => logs.push(m);

  const cfg = payload.config || {};
  const runnerConfig = {
    browser: cfg.browser || 'chromium',
    headless: cfg.headless !== undefined ? cfg.headless : true,
    viewport: null,
    timeout: cfg.timeout || 30000,
    slowMo: cfg.slowMo || 0,
    // Runner reads `screenshots` in executeTest and `captureVideo` in initialize
    screenshots: cfg.captureScreenshots !== false,
    captureScreenshots: cfg.captureScreenshots !== false,
    captureVideo: cfg.captureVideo === true,
    enableHealing: false,
  };

  push(`🚀 Starting local execution${payload.name ? `: ${payload.name}` : ''}`);

  let transformed: EngineTestStep[];
  try {
    transformed = transformTestSteps(payload.steps);
  } catch (err: any) {
    push(`❌ Failed to prepare steps: ${err.message}`);
    return { success: false, status: 'ERROR', errorMessage: err.message, logs };
  }

  push(`📊 Steps to execute: ${transformed.length}`);
  transformed.forEach((s, i) => push(`   ${i + 1}. ${getStepDescription(s)}`));

  const runner = new PlaywrightRunner();
  let video: string | undefined;

  try {
    push(`🌐 Launching ${runnerConfig.browser} (headless: ${runnerConfig.headless})...`);
    await runner.initialize(runnerConfig);

    push('▶️ Executing test...');
    const result = await runner.executeTest(transformed, runnerConfig);

    if (Array.isArray(result.logs)) {
      result.logs.forEach((l: any) =>
        push(typeof l === 'string' ? l : l.message || JSON.stringify(l))
      );
    }

    try {
      video = await runner.close();
      if (video) push(`📹 Video saved: ${video}`);
    } catch (closeErr: any) {
      push(`⚠️ Error closing browser: ${closeErr.message}`);
    }

    const status = result.status === 'PASSED' ? 'PASSED' : 'FAILED';
    push(`🏁 Completed: ${status} (${result.duration}ms)`);

    return {
      success: true,
      status,
      duration: result.duration,
      errorMessage: result.errorMessage,
      errorStack: result.errorStack,
      screenshots: result.screenshots || [],
      logs,
      video,
    };
  } catch (err: any) {
    push(`❌ Execution error: ${err.message}`);
    try {
      video = await runner.close();
    } catch {
      /* ignore */
    }
    return {
      success: false,
      status: 'ERROR',
      errorMessage: err.message,
      errorStack: err.stack,
      logs,
      video,
    };
  }
}
