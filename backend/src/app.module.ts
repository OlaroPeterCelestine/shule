import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DbModule } from './db/db.module.js';
import { PdfModule } from './pdf/pdf.module.js';
import { SchoolModule } from './school/school.module.js';

@Module({
  imports: [DbModule, AuthModule, SchoolModule, PdfModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
