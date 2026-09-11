import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface ClockPunch {
  id: number;
  email: string;
  who: string;
  role: string;
  clockIn: string;
  clockOut: string | null;
  inAt: string;
  outAt: string | null;
  hours: string | null;
  open: boolean;
}

export interface ClockMine {
  open: ClockPunch | null;
  today: ClockPunch[];
  recent: ClockPunch[];
}

const KEY = 'littleroyals.clock';

@Injectable({ providedIn: 'root' })
export class ClockService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  readonly mine = signal<ClockMine>({ open: null, today: [], recent: [] });
  readonly today = signal<ClockPunch[]>([]);
  readonly busy = signal(false);
  readonly open = computed(() => this.mine().open);

  async refreshMine() {
    try {
      const data = await this.api.get<ClockMine>('/clock/me');
      this.mine.set({
        open: data.open ?? null,
        today: data.today ?? [],
        recent: data.recent ?? [],
      });
      this.persist(this.mine());
    } catch {
      this.mine.set(this.localMine());
    }
  }

  async refreshToday() {
    try {
      this.today.set(await this.api.get<ClockPunch[]>('/clock/today'));
    } catch {
      this.today.set(this.localMine().today);
    }
  }

  async clockIn() {
    this.busy.set(true);
    try {
      try {
        const row = await this.api.post<ClockPunch>('/clock/in');
        await this.refreshMine();
        return row;
      } catch (err) {
        if (isApiRule(err)) throw err;
        return this.localIn();
      }
    } finally {
      this.busy.set(false);
    }
  }

  async clockOut() {
    this.busy.set(true);
    try {
      try {
        const row = await this.api.post<ClockPunch>('/clock/out');
        await this.refreshMine();
        return row;
      } catch (err) {
        if (isApiRule(err)) throw err;
        return this.localOut();
      }
    } finally {
      this.busy.set(false);
    }
  }

  private localMine(): ClockMine {
    const email = this.auth.user()?.email?.toLowerCase() ?? '';
    const all = this.readAll().filter((p) => p.email === email);
    const today = all.filter((p) => sameKampalaDay(p.clockIn));
    const open = all.find((p) => p.open) ?? null;
    return { open, today, recent: all.slice(0, 12) };
  }

  private localIn(): ClockPunch {
    const user = this.auth.user();
    const email = user?.email?.toLowerCase() ?? '';
    const all = this.readAll();
    const open = all.find((p) => p.email === email && p.open);
    if (open) {
      this.mine.set(this.localMine());
      return open;
    }
    const now = new Date();
    const row: ClockPunch = {
      id: Date.now(),
      email,
      who: user?.name || 'Staff',
      role: user?.role || 'teacher',
      clockIn: now.toISOString(),
      clockOut: null,
      inAt: kampalaTime(now),
      outAt: null,
      hours: null,
      open: true,
    };
    this.writeAll([row, ...all]);
    this.mine.set(this.localMine());
    return row;
  }

  private localOut(): ClockPunch {
    const email = this.auth.user()?.email?.toLowerCase() ?? '';
    const all = this.readAll();
    const idx = all.findIndex((p) => p.email === email && p.open);
    if (idx < 0) throw new Error('Clock in first');
    const now = new Date();
    const row = {
      ...all[idx],
      clockOut: now.toISOString(),
      outAt: kampalaTime(now),
      hours: hoursBetween(all[idx].clockIn, now.toISOString()),
      open: false,
    };
    all[idx] = row;
    this.writeAll(all);
    this.mine.set(this.localMine());
    return row;
  }

  private persist(mine: ClockMine) {
    const email = this.auth.user()?.email?.toLowerCase() ?? '';
    const others = this.readAll().filter((p) => p.email !== email);
    this.writeAll([...mine.recent, ...others]);
  }

  private readAll(): ClockPunch[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as ClockPunch[]) : [];
    } catch {
      return [];
    }
  }

  private writeAll(rows: ClockPunch[]) {
    localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 40)));
  }
}

function isApiRule(err: unknown) {
  const msg = err instanceof Error ? err.message : '';
  return /clock in first|already clocked|sign in required|cannot change/i.test(msg);
}

function kampalaTime(d: Date) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Kampala' });
}

function sameKampalaDay(iso: string) {
  const day = new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Africa/Kampala' });
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Kampala' });
  return day === today;
}

function hoursBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h ? h + 'h ' + m + 'm' : m + 'm';
}
