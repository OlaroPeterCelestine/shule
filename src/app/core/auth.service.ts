import { Injectable, computed, signal } from '@angular/core';
import { DEMO_ACCOUNTS, type RoleKey, type SessionUser } from './models';

const KEY = 'littleroyals.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<SessionUser | null>(readSession());
  readonly user = this.session.asReadonly();
  readonly isLoggedIn = computed(() => this.session() !== null);

  initials(): string {
    const name = this.session()?.name ?? '';
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
  }

  demoLogin(role: RoleKey, remember = true) {
    const acct = DEMO_ACCOUNTS[role];
    this.setUser({ name: acct.name, email: acct.email, role: acct.role, label: acct.label }, remember);
  }

  login(email: string, remember = true): SessionUser {
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

  logout() {
    this.session.set(null);
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
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
    campus: 'Main campus — Ntinda',
    bio: 'Oversees school operations, admissions and staff at Little Royals.',
    language: 'English',
    dateFormat: '9 Sep 2026',
    notifyEmail: true,
    notifySms: true,
    notifyPush: true,
    twoFactor: false,
  },
  teacher: {
    phone: '+256 701 228 441',
    title: 'Physics Teacher',
    department: 'Sciences',
    staffId: 'LR-STF-018',
    campus: 'Main campus — Ntinda',
    bio: 'Teaches S4 and S6 Physics and supervises mock examinations.',
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
    campus: 'Main campus — Ntinda',
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
    department: 'S4 East — Nakiwala Faith',
    staffId: 'LR-PAR-2291',
    campus: 'Day scholar',
    bio: 'Guardian of Nakiwala Faith, S4 East.',
    language: 'English',
    dateFormat: '9 Sep 2026',
    notifyEmail: true,
    notifySms: true,
    notifyPush: true,
    twoFactor: false,
  },
};

function withDefaults(user: SessionUser): SessionUser {
  return { ...PROFILE_DEFAULTS[user.role], ...user };
}

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    return raw ? withDefaults(JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}
