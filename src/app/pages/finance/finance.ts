import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { DownloadService } from '../../core/download.service';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.html',
})
export class FinancePage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  private download = inject(DownloadService);

  protected readonly fin = signal('invoices');
  protected readonly prs = signal([
    { ref: 'PR-118', item: '40 chairs — Block C', by: 'B. Kato, HOD', cost: '2,400,000', stage: 'Awaiting approval', pending: true },
    { ref: 'PR-117', item: 'Lab reagents restock', by: 'Ssentongo B.', cost: '890,000', stage: 'PO issued — Chemtech Ltd', pending: false },
    { ref: 'PR-115', item: 'Printer toner ×6', by: 'Front office', cost: '420,000', stage: 'Goods received', pending: false },
  ]);
  protected readonly payrollDone = signal(false);

  runPayroll() {
    this.modal.open({
      title: 'Run payroll — September',
      message: 'This will process net pay for <strong>86 employees</strong> totalling <strong>UGX 148.6M</strong> and generate payslips.',
      confirmLabel: 'Run payroll',
      onConfirm: () => {
        this.payrollDone.set(true);
        this.toast.show('September payroll processed — payslips generated');
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
        this.prs.update((list) => [
          { ref, item: String(v['item']), by: 'Grace Nakato', cost: String(v['cost']), stage: 'Awaiting approval', pending: true },
          ...list,
        ]);
        this.toast.show('Purchase request ' + ref + ' submitted for approval');
      },
    });
  }

  exportLedger() {
    this.download.csv('chart-of-accounts-term2-2026.csv', [
      ['Account', 'Type', 'Balance'],
      ['Tuition income', 'Revenue', '812,000,000'],
      ['Transport income', 'Revenue', '64,500,000'],
      ['Salaries & wages', 'Expense', '148,600,000'],
      ['Utilities', 'Expense', '11,400,000'],
      ['Bank — Stanbic operating', 'Asset', '216,300,000'],
    ]);
  }
}
