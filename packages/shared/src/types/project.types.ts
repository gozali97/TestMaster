export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  settings: ProjectSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ProjectSettings {
  baseUrl?: string;
  defaultBrowser?: BrowserType;
  timeout?: number;
  retries?: number;
  screenshots?: boolean;
}

export type BrowserType = 'CHROMIUM' | 'FIREFOX' | 'WEBKIT' | 'CHROME' | 'EDGE';

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  baseUrl?: string;
  variables: Record<string, string>;
  credentials?: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionProfile {
  id: string;
  projectId: string;
  name: string;
  browser: BrowserType;
  device?: string;
  parallelSessions: number;
  timeoutSettings: Record<string, number>;
  headless: boolean;
  videoRecording: boolean;
  screenshotOnFailure: boolean;
  createdAt: string;
  updatedAt: string;
}
