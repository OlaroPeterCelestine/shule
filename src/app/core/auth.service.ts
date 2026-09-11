import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { DEMO_ACCOUNTS, type RoleKey, type SessionUser } from './models';

const KEY = 'littleroyals.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private readonly session = signal<SessionUser | null>(readSession());
  readonly user = this.session.asReadonly();
  readonly isLoggedIn = computed(() => this.session() !== null);

  initials(): string {
    const name = this.session()?.name ?? '';
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
  }

  async demoLogin(role: string, remember = true) {
    try {
      const res = await this.api.post<{ token: string; user: SessionUser }>('/auth/demo', { role });
      this.setUser(res.user, remember);
      this.api.setToken(res.token, remember);
      return res.user;
    } catch {
      const acct = DEMO_ACCOUNTS[role as RoleKey];
      if (acct) {
        this.setUser({ name: acct.name, email: acct.email, role: acct.role, label: acct.label }, remember);
      } else {
        const label = role.charAt(0).toUpperCase() + role.slice(1);
        this.setUser({ name: label, email: role + '@littleroyals.ac.ug', role, label }, remember);
      }
      return this.session()!;
    }
  }

  async login(email: string, password: string, remember = true): Promise<SessionUser> {
    try {
      const res = await this.api.post<{ token: string; user: SessionUser }>('/auth/login', { email, password });
      this.setUser(res.user, remember);
      this.api.setToken(res.token, remember);
      return res.user;
    } catch (err) {
      if (err instanceof Error && /required|password|invalid|expired/i.test(err.message)) throw err;
      const matched = (Object.values(DEMO_ACCOUNTS) as typeof DEMO_ACCOUNTS[RoleKey][]).find(
        (a) => a.email.toLowerCase() === email.toLowerCase(),
      );
      let user: SessionUser;
      if (matched) {
        user = { name: matched.name, email: matched.email, role: matched.role, label: matched.label };
      } else {
        const namePart = email.split('@')[0].replace(/[._]/g, ' ');
        const name = namePart.replace(/\b\w/g, (c) => c.toUpperCase());
        user = { name, email, role: 'admin', label: 'Admin' };
      }
      this.setUser(user, remember);
      return this.session()!;
    }
  }

  logout() {
    this.session.set(null);
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
    this.api.clearToken();
    void this.api.post('/auth/logout').catch(() => undefined);
  }

  updateProfile(patch: Partial<SessionUser>) {
    const current = this.session();
    if (!current) return;
    this.setUser({ ...current, ...patch }, localStorage.getItem(KEY) !== null);
  }

  private setUser(user: SessionUser, remember: boolean) {
    const next = withDefaults(user);
    this.session.set(next);
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(KEY, JSON.stringify(next));
  }
}

const PROFILE_DEFAULTS: Record<RoleKey, Partial<SessionUser>> = {
  admin: {
    phone: '+256 772 441 190',
    title: 'School Administrator',
    department: 'Administration',
    staffId: 'LR-STF-001',
    campus: 'Main campus — Seguku',
    bio: 'Oversees kindergarten and primary operations at Little Royals.',
    language: 'English',
    dateFormat: '9 Sep 2026',
    notifyEmail: true,
    notifySms: true,
    notifyPush: true,
    twoFactor: false,
  },
  teacher: {
    phone: '+256 701 228 441',
    title: 'Primary Teacher',
    department: 'Primary section',
    staffId: 'LR-STF-018',
    campus: 'Main campus — Seguku',
    bio: 'Teaches Primary Five Mathematics and Science.',
    language: 'English',
    dateFormat: '9 Sep 2026',
    notifyEmail: true,
    notifySms: false,
    notifyPush: true,
    twoFactor: false,
  },
  accountant: {
    phone: '+256 754 110 902',
    title: 'School Accountant',
    department: 'Finance',
    staffId: 'LR-STF-007',
    campus: 'Main campus — Seguku',
    bio: 'Manages fee collection, payroll and supplier payments.',
    language: 'English',
    dateFormat: '9 Sep 2026',
    notifyEmail: true,
    notifySms: true,
    notifyPush: false,
    twoFactor: true,
  },
  parent: {
    phone: '+256 778 334 210',
    title: 'Parent / Guardian',
    department: 'Primary Five — Nakiwala Faith',
    staffId: 'LR-PAR-2291',
    campus: 'Day scholar',
    bio: 'Guardian of Nakiwala Faith, Primary Five.',
    language: 'English',
    dateFormat: '9 Sep 2026',
    notifyEmail: true,
    notifySms: true,
    notifyPush: true,
    twoFactor: false,
  },
};

function withDefaults(user: SessionUser): SessionUser {
  const preset = PROFILE_DEFAULTS[user.role as RoleKey] ?? {
    title: user.label || 'Staff',
    department: 'Little Royals',
    campus: 'Main campus — Seguku',
    language: 'English',
    dateFormat: '9 Sep 2026',
    notifyEmail: true,
    notifySms: false,
    notifyPush: true,
    twoFactor: false,
  };
  return { ...preset, ...user };
}

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    return raw ? withDefaults(JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}
