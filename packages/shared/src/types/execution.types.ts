export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR',
}

export enum TestResultStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  ERROR = 'ERROR',
}

export interface TestRun {
  id: string;
  projectId: string;
  suiteId?: string;
  environment: string;
  status: ExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  triggeredBy: string;
  executionConfig: Record<string, any>;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  createdAt: string;
}

export interface TestResult {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: TestResultStatus;
  duration: number;
  errorMessage?: string;
  errorStack?: string;
  screenshots: string[];
  videoUrl?: string;
  logsUrl?: string;
  retryCount: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ExecutionLog {
  id: string;
  testResultId: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  metadata?: Record<string, any>;
}

export interface ExecutionConfig {
  browser?: string;
  headless?: boolean;
  device?: string;
  viewport?: { width: number; height: number };
  timeout?: number;
  retries?: number;
  parallelSessions?: number;
  videoRecording?: boolean;
  screenshotOnFailure?: boolean;
}
