import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ClockService } from '../../core/clock.service';
import { DownloadService } from '../../core/download.service';
import { ModalService } from '../../core/modal.service';
import { AuthService } from '../../core/auth.service';
import type { RoleKey } from '../../core/models';
import { RELEASES, type Release } from '../../core/releases';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

type Trend = 'weekly' | 'monthly' | 'yearly';
type TxnStatus = 'Success' | 'Pending' | 'Refunded';

interface Txn {
  id: string;
  name: string;
  initials: string;
  product: string;
  status: TxnStatus;
  qty: number;
  unit: string;
  total: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, StatCards],
  templateUrl: './dashboard.html',
})
export class DashboardPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  private download = inject(DownloadService);
  protected auth = inject(AuthService);
  protected clock = inject(ClockService);
  private api = inject(ApiService);
  protected router = inject(Router);
  protected readonly release = signal<Release>(RELEASES[0]);

  protected readonly role = signal<string>(this.auth.user()?.role ?? 'admin');
  protected readonly paid = signal(false);
  protected readonly firstName = computed(() => (this.auth.user()?.name ?? 'Grace').split(' ')[0]);
  protected readonly approvals = signal([
    { id: 1, ref: 'EXP-2291', type: 'Supplier — Maama Foods Ltd', amount: '3,200,000' },
    { id: 2, ref: 'REF-0182', type: 'Fee refund — Okello D.', amount: '150,000' },
  ]);
  protected readonly marked = signal(false);
  protected readonly trend = signal<Trend>('monthly');
  protected readonly hover = signal<string | null>(null);
  protected readonly txnQuery = signal('');
  protected readonly frequency = signal('Daily');
  protected readonly menuFor = signal<string | null>(null);

  protected readonly kpis = [
    { label: 'Total students', value: '1,284', change: '+34 this term', bars: [4, 6, 5, 8, 7, 9, 10] },
    { label: 'Fees collected', value: 'UGX 812M', change: '+2.1 last year', bars: [5, 4, 6, 8, 7, 9, 11] },
    { label: 'Attendance today', value: '94.2%', change: '+0.4 this week', bars: [8, 9, 7, 8, 9, 10, 9] },
    { label: 'Applications', value: '37', change: '9 awaiting interview', bars: [3, 4, 5, 4, 6, 7, 8] },
  ];

  protected readonly teacherKpis = computed(() => {
    const open = this.clock.open();
    return [
      {
        label: 'On campus',
        value: open ? 'In' : 'Out',
        change: open ? 'Since ' + open.inAt : 'Clock in to start the day',
        bars: open ? [6, 7, 8, 8, 9, 9, 10] : [3, 3, 4, 3, 4, 3, 3],
      },
      { label: "Today's classes", value: '4', change: '1 remaining', bars: [3, 4, 4, 5, 4, 5, 4] },
      { label: 'Attendance marked', value: '1 / 4', change: 'S4A still open', bars: [6, 7, 7, 8, 8, 9, 8] },
      { label: 'Marking queue', value: '37', change: 'Papers left', bars: [8, 7, 6, 6, 5, 5, 4] },
    ];
  });
  protected readonly accountantKpis = [
    { label: 'Collected today', value: '14.2M', change: '+1.1M vs yesterday', bars: [5, 6, 7, 6, 8, 9, 10] },
    { label: 'Outstanding fees', value: '258M', change: '76% collected', bars: [9, 8, 8, 7, 7, 6, 6] },
    { label: 'Expenses (MTD)', value: '61.4M', change: 'Within budget', bars: [4, 5, 5, 6, 6, 7, 6] },
    { label: 'Payroll run', value: '3 days', change: 'Next Friday', bars: [3, 3, 4, 4, 5, 5, 6] },
  ];
  protected readonly parentKpis = computed(() => [
    { label: 'Attendance', value: '96%', change: 'Faith · Primary Five', bars: [8, 9, 8, 9, 10, 9, 10] },
    { label: 'Class position', value: '4th', change: 'Of 58 students', bars: [5, 6, 6, 7, 7, 8, 8] },
    { label: 'Fees balance', value: this.paid() ? 'UGX 0' : '260,000', change: this.paid() ? 'Cleared today' : 'Due 20 Sep', bars: [7, 6, 6, 5, 5, 4, 3] },
    { label: 'Messages', value: '1', change: 'Reports released', bars: [2, 2, 3, 2, 3, 3, 2] },
  ]);

  protected readonly months = [
    { label: 'Jan', blocks: 7, neu: '18k', exi: '9k' },
    { label: 'Feb', blocks: 6, neu: '16k', exi: '8k' },
    { label: 'Mar', blocks: 9, neu: '22k', exi: '11k' },
    { label: 'Apr', blocks: 8, neu: '20k', exi: '10k' },
    { label: 'May', blocks: 11, neu: '28k', exi: '14k' },
    { label: 'Jun', blocks: 14, neu: '38k', exi: '18k' },
    { label: 'Jul', blocks: 10, neu: '24k', exi: '13k' },
    { label: 'Aug', blocks: 12, neu: '30k', exi: '15k' },
    { label: 'Sep', blocks: 13, neu: '34k', exi: '16k' },
    { label: 'Oct', blocks: 9, neu: '21k', exi: '12k' },
    { label: 'Nov', blocks: 8, neu: '19k', exi: '10k' },
    { label: 'Dec', blocks: 7, neu: '17k', exi: '9k' },
  ];

  protected readonly categories = [
    { name: 'Tuition', h: 86 },
    { name: 'Transport', h: 54 },
    { name: 'Meals', h: 40 },
    { name: 'Boarding', h: 62 },
    { name: 'Other', h: 28 },
  ];

  protected readonly txns = signal<Txn[]>([
    { id: '#04910', name: 'Nakiwala Faith', initials: 'NF', product: 'Term 2 tuition', status: 'Success', qty: 1, unit: '1,020,000', total: '1,020,000' },
    { id: '#04911', name: 'Namutebi Racheal', initials: 'NR', product: 'Term 2 tuition', status: 'Pending', qty: 1, unit: '980,000', total: '360,000' },
    { id: '#04912', name: 'Okello Derrick', initials: 'OD', product: 'Transport levy', status: 'Success', qty: 1, unit: '180,000', total: '180,000' },
    { id: '#04908', name: 'Achieng Patricia', initials: 'AP', product: 'Term 2 tuition', status: 'Refunded', qty: 1, unit: '860,000', total: '150,000' },
    { id: '#04907', name: 'Byaruhanga Tom', initials: 'BT', product: 'Boarding fees', status: 'Success', qty: 1, unit: '450,000', total: '450,000' },
  ]);

  protected readonly filteredTxns = computed(() => {
    const q = this.txnQuery().trim().toLowerCase();
    if (!q) return this.txns();
    return this.txns().filter((t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.product.toLowerCase().includes(q));
  });

  constructor() {
    void this.clock.refreshMine();
    void this.api
      .get<Release[]>('/releases')
      .then((rows) => {
        if (rows?.[0]) this.release.set(rows[0]);
      })
      .catch(() => undefined);
  }

  blocks(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  setRole(role: string) {
    const next = role as RoleKey;
    this.role.set(next);
    void this.auth.demoLogin(next).then(() => this.clock.refreshMine());
  }

  async punch(kind: 'in' | 'out') {
    try {
      const row = kind === 'in' ? await this.clock.clockIn() : await this.clock.clockOut();
      this.toast.show(kind === 'in' ? 'Clocked in at ' + row.inAt : 'Clocked out at ' + (row.outAt || '') + (row.hours ? ' · ' + row.hours : ''));
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Could not update the clock');
    }
  }

  setTrend(t: Trend) {
    this.trend.set(t);
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
    this.toast.show('Attendance sheet opened for Primary Five');
  }

  decide(id: number, msg: string) {
    this.approvals.update((list) => list.filter((a) => a.id !== id));
    this.toast.show(msg);
  }

  exportCsv() {
    const rows: string[][] = [['ID', 'Student', 'Item', 'Status', 'Qty', 'Unit price', 'Total']];
    for (const t of this.filteredTxns()) {
      rows.push([t.id, t.name, t.product, t.status, String(t.qty), t.unit, t.total]);
    }
    this.download.csv('little-royals-recent-payments.csv', rows);
  }

  addTxn() {
    this.modal.open({
      title: 'Add payment',
      fields: [
        { key: 'name', placeholder: 'Student name *', required: true },
        { key: 'product', placeholder: 'Item (e.g. Term 2 tuition) *', required: true },
        { key: 'total', placeholder: 'Amount (UGX) *', required: true },
      ],
      onConfirm: (v) => {
        const name = String(v['name']);
        const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
        this.txns.update((list) => [
          { id: '#' + Math.floor(4900 + Math.random() * 99), name, initials, product: String(v['product']), status: 'Pending', qty: 1, unit: String(v['total']), total: String(v['total']) },
          ...list,
        ]);
        this.toast.show('Payment recorded for ' + name);
      },
    });
  }

  toggleMenu(ev: Event, id: string) {
    ev.stopPropagation();
    this.menuFor.update((cur) => (cur === id ? null : id));
  }

  aiInsight() {
    this.router.navigate(['/ai']);
    this.toast.show('Opening AI insight for fee collection');
  }

  @HostListener('document:click')
  closeMenus() {
    this.menuFor.set(null);
  }
}
