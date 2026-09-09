import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class DashboardPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  protected auth = inject(AuthService);
  protected router = inject(Router);

  protected readonly role = signal<string>(this.auth.user()?.role ?? 'admin');
  protected readonly paid = signal(false);
  protected readonly firstName = computed(() => (this.auth.user()?.name ?? 'Grace').split(' ')[0]);
  protected readonly approvals = signal([
    { id: 1, ref: 'EXP-2291', type: 'Supplier — Maama Foods Ltd', amount: '3,200,000' },
    { id: 2, ref: 'REF-0182', type: 'Fee refund — Okello D.', amount: '150,000' },
  ]);
  protected readonly marked = signal(false);

  setRole(role: string) {
    this.role.set(role);
  }

  payNow() {
    this.modal.open({
      title: 'Confirm payment',
      message: 'Pay the outstanding Term 2 balance of <strong>UGX 260,000</strong> for Nakiwala Faith via mobile money.',
      select: { key: 'method', options: ['MTN Mobile Money', 'Airtel Money', 'Bank transfer'] },
      confirmLabel: 'Pay now',
      onConfirm: () => {
        this.paid.set(true);
        this.toast.show('Payment of UGX 260,000 recorded — balance cleared');
      },
    });
  }

  go(path: string) {
    this.router.navigate(['/', path]);
  }

  notify(msg: string) {
    this.toast.show(msg);
  }

  markAttendance() {
    this.marked.set(true);
    this.toast.show('Attendance sheet opened for S4A Physics');
  }

  decide(id: number, msg: string) {
    this.approvals.update((list) => list.filter((a) => a.id !== id));
    this.toast.show(msg);
  }
}
