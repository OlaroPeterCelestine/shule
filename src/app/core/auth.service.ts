import { Injectable, computed, signal } from '@angular/core';
import { DEMO_ACCOUNTS, type RoleKey, type SessionUser } from './models';

const KEY = 'shule.session';

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
    return user;
  }

  logout() {
    this.session.set(null);
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  }

  private setUser(user: SessionUser, remember: boolean) {
    this.session.set(user);
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(KEY, JSON.stringify(user));
  }
}

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}
