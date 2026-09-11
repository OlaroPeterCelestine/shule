import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DbModule } from './db/db.module.js';
import { PdfModule } from './pdf/pdf.module.js';
import { RbacModule } from './rbac/rbac.module.js';
import { RbacService } from './rbac/rbac.service.js';
import { SchoolModule } from './school/school.module.js';

@Module({
  imports: [DbModule, RbacModule, AuthModule, SchoolModule, PdfModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly rbac: RbacService) {}

  async onModuleInit() {
    await this.rbac.ensure();
  }
}
