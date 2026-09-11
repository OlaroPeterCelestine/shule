import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { OsSyncService } from '../../core/os-sync.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class LoginPage {
  private auth = inject(AuthService);
  private sync = inject(OsSyncService);
  private router = inject(Router);
  protected toast = inject(ToastService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly remember = signal(true);
  protected readonly showPw = signal(false);
  protected readonly busy = signal(false);
  protected readonly emailError = signal(false);
  protected readonly pwError = signal(false);
  protected readonly formError = signal('');

  async demo(role: string) {
    this.busy.set(true);
    const user = await this.auth.demoLogin(role, this.remember());
    await this.sync.load();
    this.busy.set(false);
    this.toast.show('Signed in as ' + (user?.name ?? '') + ' (' + (user?.label ?? '') + ')');
    this.router.navigate(['/dashboard']);
  }

  async submit() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim());
    const pwOk = this.password().length > 0;
    this.emailError.set(!emailOk);
    this.pwError.set(!pwOk);
    if (!emailOk || !pwOk) {
      this.formError.set('Please fix the highlighted fields before continuing.');
      return;
    }
    this.formError.set('');
    this.busy.set(true);
    try {
      const user = await this.auth.login(this.email().trim(), this.password(), this.remember());
      await this.sync.load();
      this.toast.show('Signed in as ' + user.name + ' (' + user.label + ')');
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.formError.set(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      this.busy.set(false);
    }
  }
}
