import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import type { Role } from '../data/seed.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    return this.auth.login(body.email ?? '', body.password ?? '');
  }

  @Post('demo')
  demo(@Body() body: { role?: Role }) {
    return this.auth.demo(body.role ?? 'admin');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: { user: unknown }) {
    return { user: req.user };
  }

  @Post('logout')
  logout() {
    return { ok: true };
  }
}
