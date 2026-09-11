import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FilesService } from './files.service.js';
import { JobsService } from './jobs.service.js';
import { MetricsService } from './metrics.service.js';
import { PlatformController } from './platform.controller.js';
import { PrismaService } from './prisma.service.js';
import { RedisService } from './redis.service.js';
import { SearchService } from './search.service.js';
import { SecretsService } from './secrets.service.js';
import { StackService } from './stack.service.js';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [PlatformController],
  providers: [SecretsService, RedisService, SearchService, JobsService, FilesService, MetricsService, PrismaService, StackService],
  exports: [SecretsService, RedisService, SearchService, JobsService, FilesService, MetricsService, PrismaService, StackService],
})
export class PlatformModule {}
