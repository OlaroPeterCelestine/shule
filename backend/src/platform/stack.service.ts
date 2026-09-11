import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service.js';
import { FilesService } from './files.service.js';
import { JobsService } from './jobs.service.js';
import { PrismaService } from './prisma.service.js';
import { RedisService } from './redis.service.js';
import { SearchService } from './search.service.js';
import { SecretsService } from './secrets.service.js';

@Injectable()
export class StackService {
  constructor(
    private readonly redis: RedisService,
    private readonly jobs: JobsService,
    private readonly search: SearchService,
    private readonly files: FilesService,
    private readonly secrets: SecretsService,
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  snapshot() {
    return {
      http: 'express',
      database: 'postgresql',
      orm: 'prisma',
      events: this.kafka.status(),
      cache: this.redis.status(),
      jobs: this.jobs.status(),
      auth: 'jwt+passport',
      validation: 'class-validator',
      docs: '/api/docs',
      files: this.files.status(),
      search: this.search.status(),
      logs: 'pino',
      metrics: '/api/metrics',
      tracing: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ? 'opentelemetry' : 'off',
      secrets: this.secrets.status(),
      prisma: this.prisma.status(),
    };
  }
}
