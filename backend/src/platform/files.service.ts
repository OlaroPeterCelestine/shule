import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly log = new Logger(FilesService.name);
  private client: S3Client | null = null;
  private connected = false;
  private lastError = '';

  bucket() {
    return process.env.S3_BUCKET || 'littleroyals';
  }

  status() {
    return {
      ok: this.connected,
      endpoint: process.env.S3_ENDPOINT || undefined,
      bucket: this.bucket(),
      lastError: this.lastError || undefined,
    };
  }

  async onModuleInit() {
    const endpoint = process.env.S3_ENDPOINT;
    if (!endpoint) return;
    try {
      this.client = new S3Client({
        region: process.env.S3_REGION || 'us-east-1',
        endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || 'littleroyals',
          secretAccessKey: process.env.S3_SECRET_KEY || 'littleroyals',
        },
      });
      try {
        await this.client.send(new HeadBucketCommand({ Bucket: this.bucket() }));
      } catch {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket() }));
      }
      this.connected = true;
      this.lastError = '';
      this.log.log('S3 connected · ' + this.bucket());
    } catch (err) {
      this.connected = false;
      this.lastError = err instanceof Error ? err.message : 'S3 unreachable';
      this.log.warn('Object storage offline: ' + this.lastError);
    }
  }

  async put(key: string, body: Buffer, contentType: string) {
    if (!this.client || !this.connected) return { stored: false, key };
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket(), Key: key, Body: body, ContentType: contentType }),
    );
    return { stored: true, key, bucket: this.bucket() };
  }
}
