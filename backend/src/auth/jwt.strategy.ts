import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'littleroyals-dev',
    });
  }

  validate(payload: { name?: string; email?: string; role?: string; label?: string }) {
    return { name: payload.name, email: payload.email, role: payload.role, label: payload.label };
  }
}
