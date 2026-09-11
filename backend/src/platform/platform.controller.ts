import { Controller, Get, Header, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard.js';
import { FilesService } from './files.service.js';
import { JobsService } from './jobs.service.js';
import { MetricsService } from './metrics.service.js';
import { SearchService } from './search.service.js';

@Controller()
export class PlatformController {
  constructor(
    private readonly jobs: JobsService,
    private readonly search: SearchService,
    private readonly files: FilesService,
    private readonly metrics: MetricsService,
  ) {}

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  metricsText() {
    return this.metrics.text();
  }

  @Get('search')
  @UseGuards(AuthGuard)
  find(@Query('q') q: string) {
    return this.search.find(q);
  }

  @Post('search/reindex')
  @UseGuards(AuthGuard)
  async reindex() {
    const queued = await this.jobs.enqueue('search.index');
    if (!queued.queued) return this.search.indexAll();
    return queued;
  }

  @Post('files')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file?: { originalname?: string; buffer?: Buffer; mimetype?: string }) {
    const name = file?.originalname || 'upload.bin';
    const key = 'uploads/' + Date.now() + '-' + name.replace(/[^\w.-]+/g, '_');
    return this.files.put(key, file?.buffer || Buffer.from(''), file?.mimetype || 'application/octet-stream');
  }
}
