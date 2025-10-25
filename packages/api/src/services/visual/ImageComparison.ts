import { ComputerVisionClient, ComparisonResult } from './ComputerVisionClient';
import { Logger } from '../../utils/logger';
import StorageClient from '../StorageClient';

const logger = new Logger('ImageComparison');

export interface VisualTestResult {
  passed: boolean;
  similarity: number;
  diffPercentage: number;
  baselineUrl?: string;
  actualUrl?: string;
  diffUrl?: string;
  reason?: string;
}

export class ImageComparison {
  private static instance: ImageComparison;
  private cvClient: ComputerVisionClient;
  private storageClient: typeof StorageClient;

  private constructor() {
    this.cvClient = ComputerVisionClient.getInstance();
    this.storageClient = StorageClient;
  }

  public static getInstance(): ImageComparison {
    if (!ImageComparison.instance) {
      ImageComparison.instance = new ImageComparison();
    }
    return ImageComparison.instance;
  }

  /**
   * Compare screenshot with baseline
   */
  public async compareWithBaseline(
    testId: string,
    screenName: string,
    actualScreenshot: Buffer,
    options: {
      threshold?: number;
      createBaseline?: boolean;
      updateBaseline?: boolean;
    } = {}
  ): Promise<VisualTestResult> {
    try {
      logger.info(`Comparing visual test: ${testId}/${screenName}`);

      // Try to get baseline
      let baseline: Buffer | null = null;
      try {
        baseline = await this.storageClient.getBaseline(testId, screenName);
      } catch (error) {
        logger.warn(`No baseline found for ${testId}/${screenName}`);
      }

      // Create baseline if requested and doesn't exist
      if (!baseline && options.createBaseline) {
        logger.info('Creating new baseline...');
        await this.storageClient.saveBaseline(testId, screenName, actualScreenshot);

        // Upload actual screenshot
        const actualUrl = await this.storageClient.uploadScreenshot(
          testId,
          actualScreenshot
        );

        return {
          passed: true,
          similarity: 1.0,
          diffPercentage: 0,
          actualUrl,
          reason: 'Baseline created',
        };
      }

      // No baseline and not creating one
      if (!baseline) {
        return {
          passed: false,
          similarity: 0,
          diffPercentage: 100,
          reason: 'No baseline available',
        };
      }

      // Compare with baseline
      const comparison = await this.cvClient.compareImages(baseline, actualScreenshot, {
        threshold: options.threshold || 0.1,
        generateDiff: true,
      });

      // Upload images to storage
      const [baselineUrl, actualUrl, diffUrl] = await Promise.all([
        this.storageClient.uploadScreenshot(testId, baseline),
        this.storageClient.uploadScreenshot(testId, actualScreenshot),
        comparison.diffImageBuffer
          ? this.storageClient.uploadScreenshot(testId, comparison.diffImageBuffer)
          : Promise.resolve(undefined),
      ]);

      // Update baseline if requested and test passed
      if (options.updateBaseline && comparison.match) {
        await this.storageClient.saveBaseline(testId, screenName, actualScreenshot);
      }

      const result: VisualTestResult = {
        passed: comparison.match,
        similarity: comparison.similarity,
        diffPercentage: comparison.diffPercentage,
        baselineUrl,
        actualUrl,
        diffUrl,
        reason: comparison.match
          ? `Visual match (${(comparison.similarity * 100).toFixed(2)}% similar)`
          : `Visual mismatch (${comparison.diffPercentage.toFixed(2)}% difference)`,
      };

      logger.info('Visual comparison complete', {
        passed: result.passed,
        similarity: `${(result.similarity * 100).toFixed(2)}%`,
      });

      return result;
    } catch (error) {
      logger.error('Visual comparison failed', error);
      throw error;
    }
  }

  /**
   * Batch compare multiple screenshots
   */
  public async batchCompare(
    comparisons: Array<{
      testId: string;
      screenName: string;
      screenshot: Buffer;
    }>,
    options: {
      threshold?: number;
      parallel?: boolean;
    } = {}
  ): Promise<VisualTestResult[]> {
    logger.info(`Batch comparing ${comparisons.length} screenshots...`);

    if (options.parallel) {
      return await Promise.all(
        comparisons.map((c) =>
          this.compareWithBaseline(c.testId, c.screenName, c.screenshot, {
            threshold: options.threshold,
          })
        )
      );
    } else {
      const results: VisualTestResult[] = [];
      for (const comparison of comparisons) {
        const result = await this.compareWithBaseline(
          comparison.testId,
          comparison.screenName,
          comparison.screenshot,
          { threshold: options.threshold }
        );
        results.push(result);
      }
      return results;
    }
  }

  /**
   * Calculate visual regression score
   */
  public calculateRegressionScore(results: VisualTestResult[]): {
    totalTests: number;
    passed: number;
    failed: number;
    averageSimilarity: number;
    score: number;
  } {
    const totalTests = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = totalTests - passed;
    const averageSimilarity =
      results.reduce((sum, r) => sum + r.similarity, 0) / totalTests;
    const score = (passed / totalTests) * 100;

    return {
      totalTests,
      passed,
      failed,
      averageSimilarity,
      score,
    };
  }

  /**
   * Find visual elements in screenshot
   */
  public async findElement(
    screenshot: Buffer,
    elementTemplate: Buffer,
    threshold: number = 0.8
  ): Promise<{
    found: boolean;
    confidence: number;
    location?: { x: number; y: number; width: number; height: number };
  }> {
    try {
      const result = await this.cvClient.findSimilarRegion(
        screenshot,
        elementTemplate,
        { threshold }
      );

      return {
        found: result.found,
        confidence: result.confidence,
        location: result.location,
      };
    } catch (error) {
      logger.error('Element search failed', error);
      throw error;
    }
  }
}

export default ImageComparison.getInstance();
