/**
 * Visual Testing Services Module
 * 
 * Provides computer vision capabilities for TestMaster:
 * - ComputerVisionClient: Image comparison and template matching
 * - ImageComparison: Visual regression testing with baselines
 */

export { ComputerVisionClient } from './ComputerVisionClient';
export { ImageComparison } from './ImageComparison';

export type {
  BoundingBox,
  ComparisonResult,
  TemplateMatchResult,
  ImageInfo,
} from './ComputerVisionClient';

export type { VisualTestResult } from './ImageComparison';

// Re-export singleton instances
import ComputerVisionClient from './ComputerVisionClient';
import ImageComparison from './ImageComparison';

export { ComputerVisionClient as cvClient, ImageComparison as imageComparison };
