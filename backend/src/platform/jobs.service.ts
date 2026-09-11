import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, type Job } from 'bullmq';
import { SearchService } from './search.service.js';

const QUEUE = process.env.JOBS_QUEUE || 'littleroyals.jobs';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(JobsService.name);
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private lastError = '';

  constructor(private readonly search: SearchService) {}

  status() {
    return {
      ok: !!this.queue,
      queue: QUEUE,
      driver: 'bullmq',
      lastError: this.lastError || undefined,
    };
  }

  async onModuleInit() {
    const url = new URL(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    try {
      const connection = { host: url.hostname, port: Number(url.port || 6379), maxRetriesPerRequest: null as null };
      this.queue = new Queue(QUEUE, { connection });
      this.worker = new Worker(QUEUE, (job) => this.handle(job), { connection, concurrency: 2 });
      this.worker.on('failed', (job, err) => this.log.warn((job?.name || 'job') + ' failed: ' + err.message));
      this.lastError = '';
      this.log.log('BullMQ ready · ' + QUEUE);
    } catch (err) {
      this.queue = null;
      this.lastError = err instanceof Error ? err.message : 'Queue unavailable';
      this.log.warn('BullMQ offline: ' + this.lastError);
    }
  }

  async onModuleDestroy() {
    await this.worker?.close().catch(() => undefined);
    await this.queue?.close().catch(() => undefined);
  }

  async enqueue(name: string, data: Record<string, unknown> = {}) {
    if (!this.queue) return { queued: false };
    try {
      await this.queue.add(name, data, { removeOnComplete: 100, removeOnFail: 50 });
      return { queued: true };
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : 'Enqueue failed';
      return { queued: false };
    }
  }

  private async handle(job: Job) {
    if (job.name === 'search.index') {
      await this.search.indexAll();
    }
  }
}
