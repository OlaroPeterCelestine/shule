import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AccessService } from '../../core/access.service';
import { AuthService } from '../../core/auth.service';
import { ClockService } from '../../core/clock.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

type Tab = 'details' | 'notifications' | 'security' | 'preferences';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, StatCards],
  templateUrl: './profile.html',
})
export class ProfilePage {
  protected auth = inject(AuthService);
  protected access = inject(AccessService);
  protected clock = inject(ClockService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  protected readonly tab = signal<Tab>('details');
  protected readonly saving = signal(false);
  protected readonly pwSaving = signal(false);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly phone = signal('');
  protected readonly title = signal('');
  protected readonly department = signal('');
  protected readonly campus = signal('');
  protected readonly bio = signal('');
  protected readonly language = signal('English');
  protected readonly dateFormat = signal('9 Sep 2026');
  protected readonly notifyEmail = signal(true);
  protected readonly notifySms = signal(true);
  protected readonly notifyPush = signal(true);
  protected readonly twoFactor = signal(false);

  protected readonly currentPw = signal('');
  protected readonly newPw = signal('');
  protected readonly confirmPw = signal('');
  protected readonly pwError = signal('');

  protected readonly sessions = signal([
    { device: 'This Mac · Safari', place: 'Kampala, Uganda', time: 'Active now', current: true },
    { device: 'iPhone 14', place: 'Kampala, Uganda', time: 'Yesterday, 7:14pm', current: false },
    { device: 'Chrome on Windows', place: 'Ntinda office', time: '2 Sep, 11:02am', current: false },
  ]);

  protected readonly stats = computed(() => {
    const u = this.auth.user();
    const on = [this.notifyEmail(), this.notifySms(), this.notifyPush()].filter(Boolean).length;
    return [
      { label: 'Role', value: u?.label ?? '—', change: u?.department || 'Little Royals', bars: [4, 5, 5, 6, 6, 7, 7] },
      { label: 'Last login', value: 'Today', change: '08:12 · Kampala', bars: [6, 7, 6, 8, 7, 8, 9] },
      { label: 'Alerts on', value: on + ' / 3', change: 'Email, SMS, push', bars: [3, 4, 4, 5, 5, 6, 5] },
      { label: 'Two-factor', value: this.twoFactor() ? 'On' : 'Off', change: this.twoFactor() ? 'Authenticator app' : 'Recommended', bars: [2, 3, 3, 4, 4, 5, 5] },
    ];
  });

  constructor() {
    this.hydrate();
    if (this.access.can('clock', 'create')) void this.clock.refreshMine();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const tab = params.get('tab');
      if (tab === 'security' || tab === 'notifications' || tab === 'preferences' || tab === 'details') {
        this.tab.set(tab);
      }
    });
  }

  private hydrate() {
    const u = this.auth.user();
    if (!u) return;
    this.name.set(u.name);
    this.email.set(u.email);
    this.phone.set(u.phone ?? '');
    this.title.set(u.title ?? '');
    this.department.set(u.department ?? '');
    this.campus.set(u.campus ?? '');
    this.bio.set(u.bio ?? '');
    this.language.set(u.language ?? 'English');
    this.dateFormat.set(u.dateFormat ?? '9 Sep 2026');
    this.notifyEmail.set(u.notifyEmail !== false);
    this.notifySms.set(!!u.notifySms);
    this.notifyPush.set(u.notifyPush !== false);
    this.twoFactor.set(!!u.twoFactor);
  }

  saveCurrent() {
    if (this.tab() === 'details') this.saveDetails();
    else if (this.tab() === 'notifications') this.saveNotifications();
    else if (this.tab() === 'preferences') this.savePreferences();
    else this.toast.show('Use the form on this tab to update security');
  }

  saveDetails() {
    const name = this.name().trim();
    const email = this.email().trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toast.show('Enter a full name and a valid email');
      return;
    }
    this.saving.set(true);
    this.auth.updateProfile({
      name,
      email,
      phone: this.phone().trim(),
      title: this.title().trim(),
      department: this.department().trim(),
      campus: this.campus().trim(),
      bio: this.bio().trim(),
    });
    setTimeout(() => {
      this.saving.set(false);
      this.toast.show('Profile details saved');
    }, 350);
  }

  saveNotifications() {
    this.auth.updateProfile({
      notifyEmail: this.notifyEmail(),
      notifySms: this.notifySms(),
      notifyPush: this.notifyPush(),
    });
    this.toast.show('Notification preferences saved');
  }

  savePreferences() {
    this.auth.updateProfile({
      language: this.language(),
      dateFormat: this.dateFormat(),
    });
    this.toast.show('Preferences saved');
  }

  toggle2fa() {
    this.twoFactor.update((v) => !v);
    this.auth.updateProfile({ twoFactor: this.twoFactor() });
    this.toast.show(this.twoFactor() ? 'Two-factor authentication turned on' : 'Two-factor authentication turned off');
  }

  changePassword() {
    this.pwError.set('');
    if (!this.currentPw()) {
      this.pwError.set('Enter your current password');
      return;
    }
    if (this.newPw().length < 6) {
      this.pwError.set('New password must be at least 6 characters');
      return;
    }
    if (this.newPw() !== this.confirmPw()) {
      this.pwError.set('New passwords do not match');
      return;
    }
    this.pwSaving.set(true);
    setTimeout(() => {
      this.pwSaving.set(false);
      this.currentPw.set('');
      this.newPw.set('');
      this.confirmPw.set('');
      this.toast.show('Password updated');
    }, 400);
  }

  endSession(device: string) {
    this.sessions.update((list) => list.filter((s) => s.device !== device));
    this.toast.show('Signed out of ' + device);
  }

  endOtherSessions() {
    this.sessions.update((list) => list.filter((s) => s.current));
    this.toast.show('Signed out of other devices');
  }

  async punch(kind: 'in' | 'out') {
    try {
      const row = kind === 'in' ? await this.clock.clockIn() : await this.clock.clockOut();
      this.toast.show(kind === 'in' ? 'Clocked in at ' + row.inAt : 'Clocked out at ' + (row.outAt || '') + (row.hours ? ' · ' + row.hours : ''));
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Could not update the clock');
    }
  }
}
