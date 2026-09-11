import { Controller, Get, Param, Query, Req, Res, StreamableFile, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { DbService } from '../db/db.service.js';
import { PdfService, type PdfQuery } from './pdf.service.js';

@Controller('documents')
@UseGuards(AuthGuard)
export class PdfController {
  constructor(
    private readonly pdf: PdfService,
    private readonly db: DbService,
  ) {}

  @Get()
  catalog() {
    return this.pdf.catalog();
  }

  @Get(':key/pdf')
  async file(
    @Param('key') key: string,
    @Query() query: PdfQuery,
    @Req() req: { user?: { name?: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, filename, title } = await this.pdf.build(key, query);
    await this.db.logChange(
      req.user?.name || 'Staff',
      'Generated PDF',
      'Documents',
      title + ' · ' + filename,
    );
    const attachment = query.download === '1' || query.download === 'true';
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': String(buffer.length),
      'Content-Disposition': `${attachment ? 'attachment' : 'inline'}; filename="${filename}"`,
      'Cache-Control': 'no-store',
    });
    return new StreamableFile(buffer);
  }
}
