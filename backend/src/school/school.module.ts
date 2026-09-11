import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolStore } from '../store/school.store.js';
import { SchoolController } from './school.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [SchoolController],
  providers: [SchoolStore],
})
export class SchoolModule {}
