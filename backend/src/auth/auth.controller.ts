import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { DemoDto, LoginDto } from './dto/login.dto.js';
import { DbService } from '../db/db.service.js';
import type { Role } from '../data/seed.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly db: DbService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const res = await this.auth.login(body.email || body.username || '', body.password ?? '');
    await this.db.logChange(res.user.name, 'Signed in', 'Auth', res.user.email);
    return res;
  }

  @Post('demo')
  async demo(@Body() body: DemoDto) {
    const res = await this.auth.demo((body.role as Role) ?? 'admin');
    await this.db.logChange(res.user.name, 'Signed in', 'Auth', 'Demo · ' + res.user.role);
    return res;
  }

  @Get('oidc')
  oidc() {
    const issuer = process.env.OIDC_ISSUER;
    if (!issuer) return { ok: false, message: 'Set OIDC_ISSUER, OIDC_CLIENT_ID and OIDC_CLIENT_SECRET' };
    const url = new URL(issuer.replace(/\/+$/, '') + '/protocol/openid-connect/auth');
    url.searchParams.set('client_id', process.env.OIDC_CLIENT_ID || '');
    url.searchParams.set('redirect_uri', process.env.OIDC_REDIRECT_URI || 'http://localhost:3000/api/auth/oidc/callback');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid profile email');
    return { ok: true, authorizeUrl: url.toString() };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: { user: { name: string; email: string; role: string; label: string } }) {
    return this.auth.whoami(req.user);
  }

  @Post('logout')
  logout() {
    return { ok: true };
  }
}
