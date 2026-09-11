import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { DownloadService } from '../../core/download.service';
import { paginate } from '../../core/page';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

interface Invoice {
  id: string;
  student: string;
  total: number | string;
  paid: number | string;
  balance: number | string;
  status: string;
}

const DEMO_INVOICES: Invoice[] = [
  { id: 'INV-4471', student: 'Nakiwala Faith', total: 1020000, paid: 1020000, balance: 0, status: 'Cleared' },
  { id: 'INV-4472', student: 'Namutebi Racheal', total: 980000, paid: 360000, balance: 620000, status: 'Overdue' },
  { id: 'INV-4473', student: 'Okello Derrick', total: 860000, paid: 320000, balance: 540000, status: 'Due 20 Sep' },
];

@Component({
  selector: 'app-finance',
  imports: [StatCards, Pager],
  templateUrl: './finance.html',
})
export class FinancePage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  private download = inject(DownloadService);
  private router = inject(Router);
  private api = inject(ApiService);

  protected readonly fin = signal('invoices');
  protected readonly page = signal(1);
  protected readonly invoices = signal<Invoice[]>(DEMO_INVOICES);
  protected readonly paged = computed(() => paginate(this.invoices(), this.page()));
  protected readonly prs = signal([
    { ref: 'PR-118', item: '24 nursery chairs — Baby class', by: 'Namutebi J.', cost: '1,200,000', stage: 'Awaiting approval', pending: true },
    { ref: 'PR-117', item: 'Exercise books & crayons', by: 'Ssentongo B.', cost: '890,000', stage: 'PO issued — Bic Uganda', pending: false },
    { ref: 'PR-115', item: 'Printer toner ×2', by: 'Front office', cost: '140,000', stage: 'Goods received', pending: false },
  ]);
  protected readonly payrollDone = signal(false);
  protected readonly stats = computed(() => [
    { label: 'Collected', value: 'UGX 142M', change: '76% of billed', bars: [5, 6, 7, 8, 8, 9, 11] },
    { label: 'Outstanding', value: 'UGX 44M', change: '24% still due', bars: [9, 8, 7, 7, 6, 6, 5] },
    { label: 'Purchase requests', value: String(this.prs().length), change: this.prs().filter((p) => p.pending).length + ' awaiting approval', bars: [3, 4, 3, 5, 4, 6, 5] },
    { label: 'Payroll', value: this.payrollDone() ? 'Done' : '3 days', change: this.payrollDone() ? 'September posted' : 'Until September run', bars: [4, 4, 5, 5, 6, 6, 7] },
  ]);

  constructor() {
    void this.load();
  }

  async load() {
    if (!this.api.token()) return;
    try {
      const rows = await this.api.get<Invoice[]>('/finance');
      if (Array.isArray(rows) && rows.length) this.invoices.set(rows);
    } catch {
      /* keep demo invoices if the API is down */
    }
  }

  owed(value: number | string) {
    const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
    return Number.isFinite(n) && n > 0;
  }

  money(value: number | string) {
    const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
    if (!Number.isFinite(n)) return String(value);
    return n.toLocaleString('en-UG');
  }

  statusClass(status: string) {
    const s = status.toLowerCase();
    if (s.includes('clear') || s.includes('paid')) return 'text-primary';
    if (s.includes('over')) return 'text-maroon';
    return 'text-gold';
  }

  open(id: string) {
    this.router.navigate(['/finance', id]);
  }

  runPayroll() {
    this.modal.open({
      title: 'Run payroll — September',
      message: 'This will process net pay for <strong>24 staff</strong> totalling <strong>UGX 18.4M</strong> and generate payslips.',
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
      ['Tuition income', 'Revenue', '142,000,000'],
      ['Transport income', 'Revenue', '8,400,000'],
      ['Salaries & wages', 'Expense', '18,400,000'],
      ['Utilities', 'Expense', '2,100,000'],
      ['Bank — Stanbic operating', 'Asset', '36,800,000'],
    ]);
  }
}
