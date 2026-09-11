import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolModule } from '../school/school.module.js';
import { PdfController } from './pdf.controller.js';
import { PdfService } from './pdf.service.js';

@Module({
  imports: [AuthModule, SchoolModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
