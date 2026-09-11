import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(PrismaService.name);
  private ready = false;
  private lastError = '';

  status() {
    return { ok: this.ready, orm: 'prisma', lastError: this.lastError || undefined };
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.ready = true;
      this.log.log('Prisma connected');
    } catch (err) {
      this.ready = false;
      this.lastError = err instanceof Error ? err.message : 'Prisma unreachable';
      this.log.warn('Prisma offline — pg pool still serves school routes: ' + this.lastError);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => undefined);
  }
}
