import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RbacService } from '../rbac/rbac.service.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly rbac: RbacService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url: string;
      user?: { role?: string };
    }>();
    const path = (req.originalUrl ?? req.url).split('?')[0];
    const ok = await this.rbac.canWrite(req.user?.role, path, req.method);
    if (!ok) throw new ForbiddenException('This role cannot change that record');
    return true;
  }
}
