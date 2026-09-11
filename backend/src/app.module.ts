import { Module, OnModuleInit } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DbModule } from './db/db.module.js';
import { PdfModule } from './pdf/pdf.module.js';
import { RbacModule } from './rbac/rbac.module.js';
import { RbacService } from './rbac/rbac.service.js';
import { KafkaModule } from './kafka/kafka.module.js';
import { PlatformModule } from './platform/platform.module.js';
import { SchoolModule } from './school/school.module.js';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty', options: { singleLine: true } },
      },
    }),
    DbModule,
    KafkaModule,
    PlatformModule,
    RbacModule,
    AuthModule,
    SchoolModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly rbac: RbacService) {}

  async onModuleInit() {
    await this.rbac.ensure();
  }
}
