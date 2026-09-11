import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { DbService } from '../db/db.service.js';
import type { Role } from '../data/seed.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly db: DbService,
  ) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    const res = await this.auth.login(body.email ?? '', body.password ?? '');
    await this.db.logChange(res.user.name, 'Signed in', 'Auth', res.user.email);
    return res;
  }

  @Post('demo')
  async demo(@Body() body: { role?: Role }) {
    const res = await this.auth.demo(body.role ?? 'admin');
    await this.db.logChange(res.user.name, 'Signed in', 'Auth', 'Demo · ' + res.user.role);
    return res;
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
