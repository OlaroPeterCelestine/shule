import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
})
export class DashboardPage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  protected readonly role = signal<string>(this.auth.user()?.role ?? 'admin');
  protected readonly paid = signal(false);
  protected readonly firstName = computed(() => (this.auth.user()?.name ?? 'Grace').split(' ')[0]);

  setRole(role: string) { this.role.set(role); }

  payNow() {
    this.modal.open({
      title: 'Confirm payment',
      message: 'Pay the outstanding Term 2 balance of <strong>UGX 260,000</strong> for Nakiwala Faith via mobile money.',
      select: { key: 'method', options: ['MTN Mobile Money', 'Airtel Money', 'Bank transfer'] },
      onConfirm: () => {
        this.paid.set(true);
        this.toast.show('Payment of UGX 260,000 recorded — balance cleared');
        return true;
      },
    });
  }

  go(path: string) { this.router.navigate(['/', path]); }

  fade(ev: Event, msg: string) {
    this.toast.show(msg);
    const row = (ev.target as HTMLElement).closest('.btn-fade, .leave-item');
    if (!row) return;
    row.classList.add('gone');
    setTimeout(() => {
      row.remove();
      const el = document.getElementById('leaveCount');
      if (el) el.textContent = String(document.querySelectorAll('#leaveList .leave-item').length);
    }, 320);
  }
}
