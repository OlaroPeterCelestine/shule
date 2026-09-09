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

  canView(path: string): boolean {
    const role = this.auth.user()?.role;
    if (!role) return false;
    if (role === 'admin' || OPEN_PATHS.has(path)) return true;
    const label = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.path === path)?.label;
    const row = this.os.perms().find((p) => p.role.toLowerCase() === role && p.module === label);
    if (row) return row.view;
    return ROLE_VIEW[role]?.has(path) ?? false;
  }
}
