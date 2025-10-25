import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Logger } from '../utils/logger';
import crypto from 'crypto';

const logger = new Logger('StorageClient');

export class StorageClient {
  private static instance: StorageClient;
  private s3Client: S3Client | null = null;
  private enabled: boolean;
  private readonly bucketScreenshots: string;
  private readonly bucketVideos: string;
  private readonly bucketBaselines: string;
  private readonly bucketReports: string;

  private constructor() {
    this.enabled = !!(process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY);
    this.bucketScreenshots = process.env.S3_BUCKET || 'testmaster-screenshots';
    this.bucketVideos = process.env.S3_BUCKET_VIDEOS || 'testmaster-videos';
    this.bucketBaselines = process.env.S3_BUCKET_BASELINES || 'testmaster-baselines';
    this.bucketReports = process.env.S3_BUCKET_REPORTS || 'testmaster-reports';

    if (this.enabled) {
      this.initializeS3();
    } else {
      logger.warn('S3 storage not configured. File uploads disabled.');
    }
  }

  private initializeS3(): void {
    try {
      this.s3Client = new S3Client({
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_KEY!,
        },
        forcePathStyle: true, // Required for MinIO
      });
      logger.info('S3 storage client initialized');
    } catch (error) {
      logger.error('Failed to initialize S3 client', error);
      this.enabled = false;
    }
  }

  public static getInstance(): StorageClient {
    if (!StorageClient.instance) {
      StorageClient.instance = new StorageClient();
    }
    return StorageClient.instance;
  }

  /**
   * Upload screenshot
   */
  public async uploadScreenshot(testId: string, image: Buffer): Promise<string> {
    if (!this.enabled || !this.s3Client) {
      throw new Error('S3 storage not enabled');
    }

    try {
      const fileName = `${testId}-${crypto.randomBytes(8).toString('hex')}.png`;
      const key = `screenshots/${testId}/${fileName}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketScreenshots,
          Key: key,
          Body: image,
          ContentType: 'image/png',
        })
      );

      const url = `${process.env.S3_ENDPOINT}/${this.bucketScreenshots}/${key}`;
      logger.debug(`Screenshot uploaded: ${url}`);
      return url;
    } catch (error) {
      logger.error('Failed to upload screenshot', error);
      throw error;
    }
  }

  /**
   * Get baseline image
   */
  public async getBaseline(testId: string, screenName: string): Promise<Buffer> {
    if (!this.enabled || !this.s3Client) {
      throw new Error('S3 storage not enabled');
    }

    try {
      const key = `baselines/${testId}/${screenName}.png`;

      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketBaselines,
          Key: key,
        })
      );

      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw new Error('Baseline not found');
      }
      logger.error('Failed to get baseline', error);
      throw error;
    }
  }

  /**
   * Save baseline image
   */
  public async saveBaseline(
    testId: string,
    screenName: string,
    image: Buffer
  ): Promise<void> {
    if (!this.enabled || !this.s3Client) {
      throw new Error('S3 storage not enabled');
    }

    try {
      const key = `baselines/${testId}/${screenName}.png`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketBaselines,
          Key: key,
          Body: image,
          ContentType: 'image/png',
        })
      );

      logger.debug(`Baseline saved: ${key}`);
    } catch (error) {
      logger.error('Failed to save baseline', error);
      throw error;
    }
  }

  /**
   * Upload video recording
   */
  public async uploadVideo(testId: string, video: Buffer): Promise<string> {
    if (!this.enabled || !this.s3Client) {
      throw new Error('S3 storage not enabled');
    }

    try {
      const fileName = `${testId}-${Date.now()}.webm`;
      const key = `videos/${testId}/${fileName}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketVideos,
          Key: key,
          Body: video,
          ContentType: 'video/webm',
        })
      );

      const url = `${process.env.S3_ENDPOINT}/${this.bucketVideos}/${key}`;
      logger.debug(`Video uploaded: ${url}`);
      return url;
    } catch (error) {
      logger.error('Failed to upload video', error);
      throw error;
    }
  }

  /**
   * Upload test report
   */
  public async uploadReport(testId: string, report: string): Promise<string> {
    if (!this.enabled || !this.s3Client) {
      throw new Error('S3 storage not enabled');
    }

    try {
      const fileName = `${testId}-${Date.now()}.html`;
      const key = `reports/${testId}/${fileName}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketReports,
          Key: key,
          Body: report,
          ContentType: 'text/html',
        })
      );

      const url = `${process.env.S3_ENDPOINT}/${this.bucketReports}/${key}`;
      logger.debug(`Report uploaded: ${url}`);
      return url;
    } catch (error) {
      logger.error('Failed to upload report', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  public async fileExists(bucket: string, key: string): Promise<boolean> {
    if (!this.enabled || !this.s3Client) {
      return false;
    }

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if storage is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}

export default StorageClient.getInstance();
