import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(RedisService.name);
  private client: Redis | null = null;
  private connected = false;
  private lastError = '';

  url() {
    return process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  }

  status() {
    return { ok: this.connected, url: this.url(), lastError: this.lastError || undefined };
  }

  raw() {
    return this.client;
  }

  async onModuleInit() {
    try {
      this.client = new Redis(this.url(), { maxRetriesPerRequest: 1, lazyConnect: true, connectTimeout: 2500 });
      this.client.on('error', (err) => {
        this.connected = false;
        this.lastError = err.message;
      });
      await this.client.connect();
      await this.client.ping();
      this.connected = true;
      this.lastError = '';
      this.log.log('Redis connected');
    } catch (err) {
      this.connected = false;
      this.lastError = err instanceof Error ? err.message : 'Redis unreachable';
      this.log.warn('Redis offline — cache and jobs stay local: ' + this.lastError);
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit().catch(() => undefined);
  }

  async get(key: string) {
    if (!this.client || !this.connected) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSec = 60) {
    if (!this.client || !this.connected) return;
    try {
      await this.client.set(key, value, 'EX', ttlSec);
    } catch {
      /* cache is optional */
    }
  }
}
