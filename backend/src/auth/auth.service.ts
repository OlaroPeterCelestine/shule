import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { DbService } from '../db/db.service.js';
import { DEMO_ACCOUNTS, type Role, type SessionUser } from '../data/seed.js';
import { isRoleKey, roleKey } from '../rbac/activities.js';
import { RbacService } from '../rbac/rbac.service.js';
import { isEmail } from '../util/form-safe.js';

function jwtSecret() {
  return process.env.JWT_SECRET || 'littleroyals-dev';
}

function tokenHours() {
  const n = Number(process.env.AUTH_TOKEN_HOURS || 12);
  return Number.isFinite(n) && n > 0 ? n : 12;
}

interface TokenUser extends SessionUser {
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly rbac: RbacService,
  ) {}

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
    return this.session(user);
  }

  async demo(role: Role) {
    const key = roleKey(String(role || 'admin'));
    const row = await this.db.one<SessionUser>(
      'SELECT name, email, role, label FROM users WHERE role = $1 ORDER BY id LIMIT 1',
      [key],
    );
    const named = await this.db.one<{ key: string; label: string }>('SELECT key, label FROM roles WHERE key = $1', [key]);
    const user =
      row ??
      DEMO_ACCOUNTS[key as keyof typeof DEMO_ACCOUNTS] ??
      (named
        ? { name: named.label, email: key + '@littleroyals.ac.ug', role: named.key, label: named.label }
        : null);
    if (!user) throw new UnauthorizedException('Unknown demo role');
    return this.session(user);
  }

  fromToken(token?: string): SessionUser {
    if (!token) throw new UnauthorizedException('Sign in required');
    try {
      const payload = jwt.verify(token, jwtSecret()) as TokenUser;
      return this.asUser(payload);
    } catch {
      /* older demo tokens were base64url JSON */
    }
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as TokenUser;
      if (payload.exp && payload.exp < Date.now()) throw new UnauthorizedException('Session expired');
      return this.asUser(payload);
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }

  private asUser(payload: TokenUser): SessionUser {
    if (!payload?.email || !payload.role) throw new UnauthorizedException('Invalid session');
    if (!isRoleKey(String(payload.role))) throw new UnauthorizedException('Invalid session');
    return { name: payload.name, email: payload.email, role: payload.role, label: payload.label };
  }

  async whoami(user: SessionUser) {
    return { user, perms: await this.rbac.forRole(user.role) };
  }

  private async session(user: SessionUser) {
    return {
      token: this.encodeToken(user),
      tokenType: 'Bearer' as const,
      expiresIn: tokenHours() * 60 * 60,
      user,
      perms: await this.rbac.forRole(user.role),
    };
  }

  private encodeToken(user: SessionUser) {
    return jwt.sign({ ...user }, jwtSecret(), { expiresIn: tokenHours() * 60 * 60 });
  }
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase()) || 'User';
}
