import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from '../db/db.service.js';
import { DEMO_ACCOUNTS, type Role, type SessionUser } from '../data/seed.js';
import { isEmail } from '../util/form-safe.js';

function tokenHours() {
  const n = Number(process.env.AUTH_TOKEN_HOURS || 12);
  return Number.isFinite(n) && n > 0 ? n : 12;
}

interface TokenUser extends SessionUser {
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly db: DbService) {}

  async login(email: string, password: string) {
    const clean = String(email ?? '').trim().toLowerCase();
    if (!isEmail(clean) || !password) {
      throw new UnauthorizedException('Email and password are required');
    }
    if (String(password).length < 4) {
      throw new UnauthorizedException('Password must be at least 4 characters');
    }
    const row = await this.db.one<SessionUser>(
      'SELECT name, email, role, label FROM users WHERE lower(email) = $1',
      [clean],
    );
    const user = row ?? {
      name: titleCase(clean.split('@')[0].replace(/[._]/g, ' ')),
      email: clean,
      role: 'admin' as const,
      label: 'Admin',
    };
    if (!row) {
      await this.db
        .query(
          'INSERT INTO users (email, name, role, label) SELECT $1,$2,$3,$4 WHERE NOT EXISTS (SELECT 1 FROM users WHERE lower(email) = $1)',
          [user.email, user.name, user.role, user.label],
        )
        .catch(() => undefined);
    }
    return { token: this.encodeToken(user), user };
  }

  async demo(role: Role) {
    const row = await this.db.one<SessionUser>(
      'SELECT name, email, role, label FROM users WHERE role = $1 ORDER BY id LIMIT 1',
      [role],
    );
    const user = row ?? DEMO_ACCOUNTS[role];
    if (!user) throw new UnauthorizedException('Unknown demo role');
    return { token: this.encodeToken(user), user };
  }

  fromToken(token?: string): SessionUser {
    if (!token) throw new UnauthorizedException('Sign in required');
    let payload: TokenUser;
    try {
      payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as TokenUser;
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
    if (!payload?.email || !payload.role || !payload.exp) {
      throw new UnauthorizedException('Invalid session');
    }
    if (payload.exp < Date.now()) throw new UnauthorizedException('Session expired');
    if (!['admin', 'teacher', 'accountant', 'parent'].includes(payload.role)) {
      throw new UnauthorizedException('Invalid session');
    }
    return {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      label: payload.label,
    };
  }

  private encodeToken(user: SessionUser) {
    const payload: TokenUser = { ...user, exp: Date.now() + tokenHours() * 60 * 60 * 1000 };
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase()) || 'User';
}
