/**
 * Multi-Panel Autonomous Testing Types
 */

export type PanelType = 'landing' | 'user' | 'admin';

export interface MultiPanelTestingConfig {
  // Landing Page (Public)
  landingPage: {
    url: string;
  };
  
  // Login URL (Optional - if login page is separate from admin/user panel)
  loginUrl?: string;
  
  // Admin Panel (Required)
  adminPanel: {
    url: string;
    credentials: {
      username: string;
      password: string;
    };
  };
  
  // User Panel (Optional)
  userPanel?: {
    url?: string;  // Optional - defaults to landing page URL
    enabled: boolean;
    authStrategy: 'provided' | 'auto-register';
    credentials?: {
      username: string;
      password: string;
    };
  };
  
  // Test Configuration
  depth: 'shallow' | 'deep' | 'exhaustive';
  enableHealing: boolean;
  captureVideo: boolean;
  testRBAC: boolean;
  testDataConsistency: boolean;
  
  // Advanced Options
  parallelWorkers?: number;
  maxPagesPerPanel?: number;
  createJiraTickets?: boolean;
  headless?: boolean;
}

export interface PanelTestResult {
  panelType: PanelType;
  panelName: string;
  
  discovery: {
    pagesDiscovered: number;
    discoveryDuration: number;
    pages: any[];
  };
  
  testGeneration: {
    testsGenerated: number;
    testCategories: {
      navigation: number;
      forms: number;
      crud: number;
      permissions: number;
    };
  };
  
  execution: {
    testsPassed: number;
    testsFailed: number;
    testsHealed: number;
    executionDuration: number;
    coverage: number;
  };
  
  failures: FailureDetail[];
  screenshots: string[];
  video?: string;
}

export interface FailureDetail {
  testName: string;
  url: string;
  error: string;
  screenshot?: string;
  timestamp: string;
}

export interface MultiPanelTestReport {
  sessionId: string;
  timestamp: string;
  duration: number;
  
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalHealed: number;
    overallCoverage: number;
  };
  
  panels: {
    landing: PanelTestResult;
    user?: PanelTestResult;
    admin: PanelTestResult;
  };
  
  rbacTests?: RBACTestResult;
  dataConsistency?: DataConsistencyResult;
  
  files: {
    html: string;
    json: string;
    video?: string;
  };
}

export interface RBACTestResult {
  totalChecks: number;
  passed: number;
  failed: number;
  results: AccessControlResult[];
}

export interface AccessControlResult {
  testName: string;
  url: string;
  role: string;
  expectedAccess: boolean;
  actualAccess: boolean;
  passed: boolean;
  statusCode: number;
  message: string;
}

export interface DataConsistencyResult {
  totalChecks: number;
  passed: number;
  failed: number;
  issues: DataConsistencyIssue[];
}

export interface DataConsistencyIssue {
  checkName: string;
  expected: any;
  actual: any;
  panels: PanelType[];
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface ProgressUpdate {
  phase: string;
  progress: number;
  message: string;
  details?: any;
  timestamp?: string;
}
