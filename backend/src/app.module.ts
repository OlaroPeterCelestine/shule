import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { SchoolModule } from './school/school.module.js';

@Module({
  imports: [AuthModule, SchoolModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
