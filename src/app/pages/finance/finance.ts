import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-finance',
  imports: [],
  templateUrl: './finance.html',
})
export class FinancePage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  protected readonly fin = signal('invoices');

  runPayroll() {
    this.modal.open({
      title: 'Run payroll — September',
      message: 'This will process net pay for <strong>86 employees</strong> totalling <strong>UGX 148.6M</strong> and generate payslips.',
      onConfirm: () => {
        this.toast.show('September payroll processed — payslips generated');
        return true;
      },
    });
  }

  newPR() {
    this.modal.open({
      title: 'New purchase request',
      fields: [
        { key: 'item', placeholder: 'Item / description *', required: true },
        { key: 'cost', placeholder: 'Estimated cost (UGX) *', required: true },
      ],
      onConfirm: (v) => {
        const ref = 'PR-' + Math.floor(100 + Math.random() * 899);
        const tbody = document.getElementById('prRows');
        if (tbody) {
          const tr = document.createElement('tr');
          tr.innerHTML = '<td class="px-4 py-3 font-mono text-xs">' + ref + '</td><td class="px-4 py-3">' + v['item'] + '</td><td class="px-4 py-3">Grace Nakato</td><td class="px-4 py-3">' + v['cost'] + '</td><td class="px-4 py-3 text-gold">Awaiting approval</td>';
          tbody.prepend(tr);
        }
        this.toast.show('Purchase request ' + ref + ' submitted for approval');
        return true;
      },
    });
  }

  exportLedger() {
    const table = document.getElementById('accountingTable');
    if (table) this.download.tableToCsv('chart-of-accounts-term2-2026.csv', table);
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
