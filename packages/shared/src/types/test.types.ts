import { Priority, Status } from './common.types';

export enum TestType {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  API = 'API',
  DESKTOP = 'DESKTOP',
}

export interface TestCase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: TestType;
  steps: TestStep[];
  dataBindings?: Record<string, any>;
  tags: string[];
  priority: Priority;
  status: Status;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TestStep {
  id: string;
  orderIndex: number;
  actionType: string;
  parameters: Record<string, any>;
  expectedResult?: string;
  timeout?: number;
  screenshotUrl?: string;
}

export interface TestSuite {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  testCaseIds: string[];
  executionOrder: 'SEQUENTIAL' | 'PARALLEL';
  createdAt: string;
  updatedAt: string;
}

export interface TestObject {
  id: string;
  projectId: string;
  name: string;
  type: 'WEB_ELEMENT' | 'MOBILE_ELEMENT' | 'API_ENDPOINT';
  locators: LocatorStrategy[];
  properties: Record<string, any>;
  screenshotUrl?: string;
  parentId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LocatorStrategy {
  id: string;
  strategy: LocatorType;
  value: string;
  priority: number;
  isPrimary: boolean;
}

export type LocatorType =
  | 'XPATH'
  | 'CSS'
  | 'ID'
  | 'NAME'
  | 'CLASS'
  | 'TAG_NAME'
  | 'LINK_TEXT'
  | 'PARTIAL_LINK_TEXT'
  | 'ROLE'
  | 'TEST_ID';
