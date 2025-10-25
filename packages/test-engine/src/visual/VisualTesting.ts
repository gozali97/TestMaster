import { Page } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface VisualComparisonResult {
  match: boolean;
  diffPercentage: number;
  diffPixels: number;
  totalPixels: number;
  diffImagePath?: string;
}

export interface VisualTestConfig {
  threshold?: number; // 0-1, default 0.1 (10% difference allowed)
  ignoreRegions?: Array<{ x: number; y: number; width: number; height: number }>;
  baselineDir?: string;
  diffDir?: string;
}

export class VisualTesting {
  private baselineDir: string;
  private diffDir: string;
  private threshold: number;

  constructor(config: VisualTestConfig = {}) {
    this.baselineDir = config.baselineDir || './visual-baselines';
    this.diffDir = config.diffDir || './visual-diffs';
    this.threshold = config.threshold || 0.1;
  }

  async captureBaseline(page: Page, name: string): Promise<string> {
    const screenshotPath = join(this.baselineDir, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  async compareWithBaseline(
    page: Page, 
    name: string, 
    config?: VisualTestConfig
  ): Promise<VisualComparisonResult> {
    const baselinePath = join(this.baselineDir, `${name}.png`);
    
    if (!existsSync(baselinePath)) {
      // First run - create baseline
      await this.captureBaseline(page, name);
      return {
        match: true,
        diffPercentage: 0,
        diffPixels: 0,
        totalPixels: 0,
      };
    }

    // Capture current screenshot
    const currentPath = join(this.diffDir, `${name}-current.png`);
    await page.screenshot({ path: currentPath, fullPage: true });

    // Load images
    const baseline = PNG.sync.read(readFileSync(baselinePath));
    const current = PNG.sync.read(readFileSync(currentPath));

    // Ensure same dimensions
    if (baseline.width !== current.width || baseline.height !== current.height) {
      return {
        match: false,
        diffPercentage: 100,
        diffPixels: baseline.width * baseline.height,
        totalPixels: baseline.width * baseline.height,
      };
    }

    // Create diff image
    const diff = new PNG({ width: baseline.width, height: baseline.height });

    // Apply ignore regions if specified
    let baselineData = baseline.data;
    let currentData = current.data;

    if (config?.ignoreRegions) {
      baselineData = Buffer.from(baseline.data);
      currentData = Buffer.from(current.data);
      
      config.ignoreRegions.forEach(region => {
        this.maskRegion(baselineData, currentData, baseline.width, region);
      });
    }

    // Compare images
    const diffPixels = pixelmatch(
      baselineData,
      currentData,
      diff.data,
      baseline.width,
      baseline.height,
      { threshold: 0.1 }
    );

    const totalPixels = baseline.width * baseline.height;
    const diffPercentage = (diffPixels / totalPixels) * 100;
    const threshold = (config?.threshold || this.threshold) * 100;

    // Save diff image if there are differences
    let diffImagePath: string | undefined;
    if (diffPixels > 0) {
      diffImagePath = join(this.diffDir, `${name}-diff.png`);
      writeFileSync(diffImagePath, PNG.sync.write(diff));
    }

    return {
      match: diffPercentage <= threshold,
      diffPercentage,
      diffPixels,
      totalPixels,
      diffImagePath,
    };
  }

  async compareScreenshots(
    screenshot1: Buffer,
    screenshot2: Buffer
  ): Promise<VisualComparisonResult> {
    const img1 = PNG.sync.read(screenshot1);
    const img2 = PNG.sync.read(screenshot2);

    if (img1.width !== img2.width || img1.height !== img2.height) {
      return {
        match: false,
        diffPercentage: 100,
        diffPixels: img1.width * img1.height,
        totalPixels: img1.width * img1.height,
      };
    }

    const diff = new PNG({ width: img1.width, height: img1.height });

    const diffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      img1.width,
      img1.height,
      { threshold: 0.1 }
    );

    const totalPixels = img1.width * img1.height;
    const diffPercentage = (diffPixels / totalPixels) * 100;

    return {
      match: diffPercentage <= this.threshold * 100,
      diffPercentage,
      diffPixels,
      totalPixels,
    };
  }

  async updateBaseline(name: string): Promise<void> {
    const currentPath = join(this.diffDir, `${name}-current.png`);
    const baselinePath = join(this.baselineDir, `${name}.png`);

    if (existsSync(currentPath)) {
      const data = readFileSync(currentPath);
      writeFileSync(baselinePath, data);
    }
  }

  private maskRegion(
    baseline: Buffer,
    current: Buffer,
    width: number,
    region: { x: number; y: number; width: number; height: number }
  ): void {
    for (let y = region.y; y < region.y + region.height; y++) {
      for (let x = region.x; x < region.x + region.width; x++) {
        const idx = (width * y + x) * 4;
        // Set both images to same color in ignore region
        baseline[idx] = 128;
        baseline[idx + 1] = 128;
        baseline[idx + 2] = 128;
        current[idx] = 128;
        current[idx + 1] = 128;
        current[idx + 2] = 128;
      }
    }
  }
}
