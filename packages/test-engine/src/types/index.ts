export interface ExecutionConfig {
  browser?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  viewport?: { width: number; height: number };
  timeout?: number;
  retries?: number;
  screenshots?: boolean;
  video?: boolean;
}

export interface TestStep {
  id: string;
  orderIndex: number;
  actionType: string;
  parameters: Record<string, any>;
  expectedResult?: string;
  timeout?: number;
}

export interface ExecutionResult {
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';
  duration: number;
  errorMessage?: string;
  errorStack?: string;
  screenshots: string[];
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  metadata?: Record<string, any>;
}

export interface StepResult {
  stepId: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  error?: string;
  screenshot?: string;
}
