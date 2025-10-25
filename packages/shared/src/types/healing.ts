/**
 * Self-Healing Types
 * Shared types for autonomous test healing functionality
 */

export type HealingStrategy = 'FALLBACK' | 'SIMILARITY' | 'VISUAL' | 'HISTORICAL';

export interface HealingResult {
  strategy: HealingStrategy;
  newLocator: string;
  confidence: number;
  metadata?: {
    reason?: string;
    alternativeLocators?: string[];
    executionTime?: number;
    [key: string]: any;
  };
}

export interface HealingContext {
  failedLocator: string;
  objectId?: number;
  stepIndex: number;
  testCaseId: number;
  pageSnapshot?: string;
  errorMessage?: string;
  previousSuccessfulLocator?: string;
}

export interface HealingEventData {
  testResultId: number;
  testCaseId: number;
  objectId?: number;
  stepIndex: number;
  failedLocator: string;
  healedLocator: string;
  strategy: HealingStrategy;
  confidence: number;
  autoApplied: boolean;
  metadata?: Record<string, any>;
}

export interface HealingStatistics {
  totalAttempts: number;
  successfulHeals: number;
  successRate: number;
  byStrategy: {
    [key in HealingStrategy]: {
      attempts: number;
      successes: number;
      avgConfidence: number;
      avgExecutionTime: number;
    };
  };
  mostHealedObjects: Array<{
    objectId: number;
    objectName: string;
    healCount: number;
  }>;
  recentHeals: HealingEventData[];
}

export interface LocatorOption {
  type: 'id' | 'css' | 'xpath' | 'text' | 'role' | 'testId' | 'ariaLabel';
  value: string;
  priority: number;
  successRate?: number;
}

export interface HealingTestObject {
  id: number;
  name: string;
  locators: LocatorOption[];
  createdAt: Date;
  updatedAt: Date;
}
