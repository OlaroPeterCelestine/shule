import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import type { RoleKey } from '../../core/models';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected toast = inject(ToastService);

  protected email = '';
  protected password = '';
  protected remember = true;
  protected readonly showPw = signal(false);
  protected readonly busy = signal(false);
  protected readonly emailError = signal(false);
  protected readonly pwError = signal(false);
  protected readonly formError = signal('');

  demo(role: string) {
    this.auth.demoLogin(role as RoleKey, this.remember);
    const user = this.auth.user();
    this.toast.show('Signed in as ' + (user?.name ?? '') + ' (' + (user?.label ?? '') + ')');
    this.router.navigate(['/dashboard']);
  }

  submit() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
    const pwOk = this.password.length > 0;
    this.emailError.set(!emailOk);
    this.pwError.set(!pwOk);
    if (!emailOk || !pwOk) {
      this.formError.set('Please fix the highlighted fields before continuing.');
      return;
    }
    this.formError.set('');
    this.busy.set(true);
    setTimeout(() => {
      const user = this.auth.login(this.email.trim(), this.remember);
      this.busy.set(false);
      this.toast.show('Signed in as ' + user.name + ' (' + user.label + ')');
      this.router.navigate(['/dashboard']);
    }, 500);
  }
}
