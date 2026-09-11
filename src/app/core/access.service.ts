import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { NAV_SECTIONS, OPEN_PATHS, ROLE_VIEW } from './nav';
import { SchoolOsStore } from './school-os.store';

@Injectable({ providedIn: 'root' })
export class AccessService {
  private auth = inject(AuthService);
  private os = inject(SchoolOsStore);

  readonly sections = computed(() =>
    NAV_SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter((i) => this.canView(i.path)),
    })).filter((s) => s.items.length > 0),
  );

  can(module: string, action: 'view' | 'create' | 'edit' | 'approve' = 'view'): boolean {
    const role = this.auth.user()?.role;
    if (!role) return false;
    if (role === 'admin') return true;
    if (action === 'view' && OPEN_PATHS.has(module)) return true;
    const row = this.os.perms().find((p) => p.role === role && p.module === module);
    if (row) return row[action];
    if (action === 'view') return ROLE_VIEW[role]?.has(module) ?? false;
    return false;
  }

  canView(path: string): boolean {
    return this.can(path, 'view');
  }
}
