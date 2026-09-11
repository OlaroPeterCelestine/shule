import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Role } from '../data/seed.js';

const WRITE = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const WRITE_PREFIX: Record<Role, string[]> = {
  admin: ['*'],
  teacher: ['/api/students', '/api/admissions', '/api/attendance', '/api/health'],
  accountant: ['/api/finance'],
  parent: [],
};

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url: string;
      user?: { role?: Role };
    }>();
    if (!WRITE.has(req.method)) return true;
    const role = req.user?.role;
    if (!role) throw new ForbiddenException('Sign in required');
    const allowed = WRITE_PREFIX[role] ?? [];
    if (allowed.includes('*')) return true;
    const path = (req.originalUrl ?? req.url).split('?')[0];
    if (allowed.some((prefix) => path === prefix || path.startsWith(prefix + '/'))) return true;
    throw new ForbiddenException('This role cannot change that record');
  }
}
