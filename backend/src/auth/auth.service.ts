import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DEMO_ACCOUNTS, type Role, type SessionUser } from '../data/seed.js';
import { isEmail } from '../util/form-safe.js';

const TOKEN_HOURS = 12;

interface TokenUser extends SessionUser {
  exp: number;
}

@Injectable()
export class AuthService {
  login(email: string, password: string) {
    const clean = String(email ?? '').trim().toLowerCase();
    if (!isEmail(clean) || !password) {
      throw new UnauthorizedException('Email and password are required');
    }
    if (String(password).length < 4) {
      throw new UnauthorizedException('Password must be at least 4 characters');
    }
    const matched = Object.values(DEMO_ACCOUNTS).find((a) => a.email.toLowerCase() === clean);
    const user: SessionUser = matched ?? {
      name: titleCase(clean.split('@')[0].replace(/[._]/g, ' ')),
      email: clean,
      role: 'admin',
      label: 'Admin',
    };
    return { token: this.encodeToken(user), user };
  }

  demo(role: Role) {
    const user = DEMO_ACCOUNTS[role];
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
    const payload: TokenUser = { ...user, exp: Date.now() + TOKEN_HOURS * 60 * 60 * 1000 };
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase()) || 'User';
}
