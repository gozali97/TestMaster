import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import sharp from 'sharp';
import { Logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

const logger = new Logger('ComputerVisionClient');

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComparisonResult {
  match: boolean;
  similarity: number; // 0-1 (1 = identical)
  mismatchedPixels: number;
  totalPixels: number;
  diffPercentage: number;
  diffImageBuffer?: Buffer;
}

export interface TemplateMatchResult {
  found: boolean;
  confidence: number;
  location?: BoundingBox;
  matches: Array<{
    location: BoundingBox;
    confidence: number;
  }>;
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
}

export class ComputerVisionClient {
  private static instance: ComputerVisionClient;
  private enabled: boolean = true;

  private constructor() {
    logger.info('Computer Vision client initialized');
  }

  public static getInstance(): ComputerVisionClient {
    if (!ComputerVisionClient.instance) {
      ComputerVisionClient.instance = new ComputerVisionClient();
    }
    return ComputerVisionClient.instance;
  }

  /**
   * Compare two images pixel by pixel
   */
  public async compareImages(
    image1: Buffer | string,
    image2: Buffer | string,
    options: {
      threshold?: number; // 0-1, default 0.1
      includeAA?: boolean; // Include anti-aliasing
      generateDiff?: boolean; // Generate diff image
    } = {}
  ): Promise<ComparisonResult> {
    try {
      logger.debug('Comparing images...');

      // Load images
      const img1 = await this.loadImage(image1);
      const img2 = await this.loadImage(image2);

      // Ensure same dimensions
      if (img1.width !== img2.width || img1.height !== img2.height) {
        logger.warn('Images have different dimensions, resizing...');
        const maxWidth = Math.max(img1.width, img2.width);
        const maxHeight = Math.max(img1.height, img2.height);

        const resized1 = await this.resizeImage(
          await this.imageToBuffer(img1),
          maxWidth,
          maxHeight
        );
        const resized2 = await this.resizeImage(
          await this.imageToBuffer(img2),
          maxWidth,
          maxHeight
        );

        return this.compareImages(resized1, resized2, options);
      }

      const { width, height } = img1;
      const totalPixels = width * height;

      // Create diff image if requested
      const diff = options.generateDiff ? new PNG({ width, height }) : null;

      // Compare using pixelmatch
      const threshold = options.threshold ?? 0.1;
      const mismatchedPixels = pixelmatch(
        img1.data,
        img2.data,
        diff ? diff.data : null,
        width,
        height,
        {
          threshold,
          includeAA: options.includeAA ?? false,
        }
      );

      const diffPercentage = (mismatchedPixels / totalPixels) * 100;
      const similarity = 1 - diffPercentage / 100;
      const match = diffPercentage < 1; // Less than 1% difference = match

      const result: ComparisonResult = {
        match,
        similarity,
        mismatchedPixels,
        totalPixels,
        diffPercentage,
      };

      // Generate diff image buffer
      if (diff && options.generateDiff) {
        result.diffImageBuffer = PNG.sync.write(diff);
      }

      logger.info('Image comparison complete', {
        match,
        similarity: `${(similarity * 100).toFixed(2)}%`,
        diffPercentage: `${diffPercentage.toFixed(2)}%`,
      });

      return result;
    } catch (error) {
      logger.error('Image comparison failed', error);
      throw error;
    }
  }

  /**
   * Find a template image within a larger image (template matching)
   * Simplified version using image comparison at multiple positions
   */
  public async findSimilarRegion(
    haystackImage: Buffer | string,
    needleImage: Buffer | string,
    options: {
      threshold?: number; // 0-1, default 0.8
      maxMatches?: number; // Max number of matches to return
    } = {}
  ): Promise<TemplateMatchResult> {
    try {
      logger.debug('Searching for template in image...');

      // Get image dimensions
      const haystackBuffer = typeof haystackImage === 'string' ? fs.readFileSync(haystackImage) : haystackImage;
      const needleBuffer = typeof needleImage === 'string' ? fs.readFileSync(needleImage) : needleImage;

      const haystackInfo = await sharp(haystackBuffer).metadata();
      const needleInfo = await sharp(needleBuffer).metadata();

      const haystackWidth = haystackInfo.width || 0;
      const haystackHeight = haystackInfo.height || 0;
      const needleWidth = needleInfo.width || 0;
      const needleHeight = needleInfo.height || 0;

      if (needleWidth > haystackWidth || needleHeight > haystackHeight) {
        logger.warn('Template is larger than search image');
        return {
          found: false,
          confidence: 0,
          matches: [],
        };
      }

      const threshold = options.threshold ?? 0.8;
      const maxMatches = options.maxMatches ?? 10;
      const matches: Array<{ location: BoundingBox; confidence: number }> = [];

      // Simplified sliding window search (check every 10% of needle width)
      const stepSize = Math.max(10, Math.floor(needleWidth / 10));

      for (let y = 0; y <= haystackHeight - needleHeight; y += stepSize) {
        for (let x = 0; x <= haystackWidth - needleWidth; x += stepSize) {
          // Extract region from haystack
          const region = await sharp(haystackBuffer)
            .extract({ left: x, top: y, width: needleWidth, height: needleHeight })
            .png()
            .toBuffer();

          // Compare region with needle
          const comparison = await this.compareImages(region, needleBuffer, {
            threshold: 0.1,
            generateDiff: false
          });

          if (comparison.similarity >= threshold) {
            matches.push({
              location: { x, y, width: needleWidth, height: needleHeight },
              confidence: comparison.similarity,
            });

            if (matches.length >= maxMatches) {
              break;
            }
          }
        }

        if (matches.length >= maxMatches) {
          break;
        }
      }

      // Sort by confidence
      matches.sort((a, b) => b.confidence - a.confidence);

      const bestMatch = matches[0];
      const result: TemplateMatchResult = {
        found: matches.length > 0,
        confidence: bestMatch?.confidence || 0,
        location: bestMatch?.location,
        matches: matches.slice(0, maxMatches),
      };

      logger.info('Template search complete', {
        found: result.found,
        matches: matches.length,
        bestConfidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error('Template matching failed', error);
      throw error;
    }
  }

  /**
   * Detect objects in image (placeholder for future ML integration)
   */
  public async detectObjects(image: Buffer | string): Promise<
    Array<{
      label: string;
      confidence: number;
      boundingBox: BoundingBox;
    }>
  > {
    logger.warn('Object detection not yet implemented. Use Google Cloud Vision API.');
    // Placeholder for future integration with:
    // - Google Cloud Vision API
    // - AWS Rekognition
    // - TensorFlow.js models
    return [];
  }

  /**
   * Extract text from image (OCR)
   */
  public async extractText(image: Buffer | string): Promise<string> {
    logger.warn('OCR not yet implemented. Use Google Cloud Vision API or Tesseract.js');
    // Placeholder for future integration with:
    // - Google Cloud Vision API
    // - Tesseract.js
    // - AWS Textract
    return '';
  }

  /**
   * Resize image to specific dimensions
   */
  public async resizeImage(
    image: Buffer | string,
    width: number,
    height: number
  ): Promise<Buffer> {
    try {
      const imageBuffer = typeof image === 'string' ? fs.readFileSync(image) : image;

      return await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'fill',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toBuffer();
    } catch (error) {
      logger.error('Image resize failed', error);
      throw error;
    }
  }

  /**
   * Get image information
   */
  public async getImageInfo(image: Buffer | string): Promise<ImageInfo> {
    try {
      const imageBuffer = typeof image === 'string' ? fs.readFileSync(image) : image;
      const metadata = await sharp(imageBuffer).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: imageBuffer.length,
      };
    } catch (error) {
      logger.error('Failed to get image info', error);
      throw error;
    }
  }

  /**
   * Crop image to bounding box
   */
  public async cropImage(
    image: Buffer | string,
    boundingBox: BoundingBox
  ): Promise<Buffer> {
    try {
      const imageBuffer = typeof image === 'string' ? fs.readFileSync(image) : image;

      return await sharp(imageBuffer)
        .extract({
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        })
        .png()
        .toBuffer();
    } catch (error) {
      logger.error('Image crop failed', error);
      throw error;
    }
  }

  /**
   * Convert image to grayscale
   */
  public async toGrayscale(image: Buffer | string): Promise<Buffer> {
    try {
      const imageBuffer = typeof image === 'string' ? fs.readFileSync(image) : image;
      return await sharp(imageBuffer).grayscale().png().toBuffer();
    } catch (error) {
      logger.error('Grayscale conversion failed', error);
      throw error;
    }
  }

  /**
   * Load PNG image
   */
  private async loadImage(image: Buffer | string): Promise<PNG> {
    try {
      const imageBuffer = typeof image === 'string' ? fs.readFileSync(image) : image;

      // Convert to PNG if needed
      const pngBuffer = await sharp(imageBuffer).png().toBuffer();

      return PNG.sync.read(pngBuffer);
    } catch (error) {
      logger.error('Failed to load image', error);
      throw error;
    }
  }

  /**
   * Convert PNG to buffer
   */
  private async imageToBuffer(png: PNG): Promise<Buffer> {
    return PNG.sync.write(png);
  }

  /**
   * Save image to file
   */
  public async saveImage(image: Buffer, filePath: string): Promise<void> {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, image);
      logger.debug(`Image saved to ${filePath}`);
    } catch (error) {
      logger.error('Failed to save image', error);
      throw error;
    }
  }

  /**
   * Create side-by-side comparison image
   */
  public async createComparisonImage(
    image1: Buffer | string,
    image2: Buffer | string,
    diffImage?: Buffer
  ): Promise<Buffer> {
    try {
      const img1Buffer = typeof image1 === 'string' ? fs.readFileSync(image1) : image1;
      const img2Buffer = typeof image2 === 'string' ? fs.readFileSync(image2) : image2;

      const img1Info = await sharp(img1Buffer).metadata();
      const width = img1Info.width || 800;
      const height = img1Info.height || 600;

      const images = [
        { input: img1Buffer, top: 0, left: 0 },
        { input: img2Buffer, top: 0, left: width },
      ];

      if (diffImage) {
        images.push({ input: diffImage, top: 0, left: width * 2 });
      }

      const compositeWidth = width * (diffImage ? 3 : 2);

      return await sharp({
        create: {
          width: compositeWidth,
          height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .composite(images)
        .png()
        .toBuffer();
    } catch (error) {
      logger.error('Failed to create comparison image', error);
      throw error;
    }
  }

  /**
   * Check if client is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}

export default ComputerVisionClient.getInstance();
