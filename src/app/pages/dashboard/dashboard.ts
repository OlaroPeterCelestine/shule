import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AccessService } from '../../core/access.service';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ClockService } from '../../core/clock.service';
import { ModalService } from '../../core/modal.service';
import { OsSyncService } from '../../core/os-sync.service';
import { RELEASES, type Release } from '../../core/releases';
import { SCHOOL_CLASSES } from '../../core/report-cards';
import { SchoolOsStore } from '../../core/school-os.store';
import { StudentsStore } from '../../core/students.store';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-dashboard',
  imports: [StatCards],
  templateUrl: './dashboard.html',
})
export class DashboardPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  protected auth = inject(AuthService);
  protected access = inject(AccessService);
  protected clock = inject(ClockService);
  private api = inject(ApiService);
  private sync = inject(OsSyncService);
  protected router = inject(Router);
  protected students = inject(StudentsStore);
  protected os = inject(SchoolOsStore);
  protected readonly release = signal<Release>(RELEASES[0]);
  protected readonly newsOpen = signal(false);

  protected readonly role = computed(() => this.auth.user()?.role ?? '');
  protected readonly isParent = computed(() => this.role() === 'parent');
  protected readonly demoRoles = [
    { key: 'admin', label: 'Admin' },
    { key: 'teacher', label: 'Teacher' },
    { key: 'accountant', label: 'Accountant' },
    { key: 'parent', label: 'Parent' },
    { key: 'nurse', label: 'Nurse' },
    { key: 'registrar', label: 'Registrar' },
  ];
  protected readonly paid = signal(false);
  protected readonly firstName = computed(() => (this.auth.user()?.name ?? 'Grace').split(' ')[0]);
  protected readonly approvals = signal([
    { id: 1, ref: 'EXP-2291', type: 'Supplier — Maama Foods Ltd', amount: '3,200,000' },
    { id: 2, ref: 'REF-0182', type: 'Fee refund — Okello D.', amount: '150,000' },
  ]);
  protected readonly marked = signal(false);

  protected readonly schoolLine = computed(() => {
    const s = this.os.school();
    return [s.name, s.term, s.year, s.motto].filter(Boolean).join(' · ');
  });

  protected readonly kpis = computed(() => {
    const pupils = this.students.students();
    const register = this.os.register();
    const present = register.filter((r) => r.status === 'P' || r.status === 'L').length;
    const rate = register.length ? Math.round((present / register.length) * 1000) / 10 : 0;
    const pipeline = this.os.applicants().filter((a) => a.stage !== 'enrolled').length;
    const due = pupils.filter((s) => s.fee === 'due').length;
    const open = this.clock.open();
    const papers = this.os.exams().filter((e) => e.status === 'Scheduled' || e.status === 'Running').length;
    const cards = [];
    if (this.access.canView('students')) {
      cards.push({ label: 'Pupils on roll', value: String(pupils.length), change: 'Baby class through Primary Seven', bars: [4, 6, 5, 8, 7, 9, 10] });
    }
    if (this.access.canView('attendance')) {
      cards.push({ label: 'Present today', value: String(present), change: rate + '% of the morning register', bars: [8, 9, 7, 8, 9, 10, 9] });
    }
    if (this.access.canView('admissions')) {
      cards.push({ label: 'Admissions open', value: String(pipeline), change: 'Applications not yet enrolled', bars: [3, 4, 5, 4, 6, 7, 8] });
    }
    if (this.access.canView('finance')) {
      cards.push({ label: 'Fees still due', value: String(due), change: due ? 'Open Fees & Payroll' : 'All cleared on the roll', bars: [5, 4, 6, 8, 7, 9, 11] });
    }
    if (this.access.can('clock', 'create')) {
      cards.push({
        label: 'On campus',
        value: open ? 'In' : 'Out',
        change: open ? 'Since ' + open.inAt : 'Clock in to start the day',
        bars: open ? [6, 7, 8, 8, 9, 9, 10] : [3, 3, 4, 3, 4, 3, 3],
      });
    }
    if (this.access.canView('academics')) {
      cards.push({ label: 'Exam papers', value: String(papers), change: 'Scheduled or running', bars: [3, 4, 4, 5, 4, 5, 4] });
    }
    if (this.access.canView('health')) {
      cards.push({ label: 'Sickbay', value: String(this.os.visits().length), change: 'Visits on the log', bars: [2, 2, 3, 2, 3, 3, 2] });
    }
    if (this.access.canView('inventory')) {
      const low = this.os.stock().filter((i) => i.qty < 20).length;
      cards.push({ label: 'Low stock', value: String(low), change: this.os.stock().length + ' items in stores', bars: [2, 3, 2, 3, 3, 2, 2] });
    }
    return cards.slice(0, 4);
  });

  protected readonly classes = computed(() =>
    SCHOOL_CLASSES.map((cls) => {
      const n = this.students.students().filter((s) => s.cls === cls).length;
      const rows = this.os.register().filter((r) => r.cls === cls);
      const here = rows.filter((r) => r.status === 'P' || r.status === 'L').length;
      return { cls, n, here, rows: rows.length };
    }).filter((c) => c.n || c.rows),
  );

  protected readonly admissionsQueue = computed(() =>
    this.os
      .applicants()
      .filter((a) => a.stage === 'applied' || a.stage === 'review' || a.stage === 'interview' || a.stage === 'offered')
      .slice(0, 5),
  );

  protected readonly absents = computed(() => this.os.register().filter((r) => r.status === 'A').slice(0, 5));
  protected readonly sickbay = computed(() => this.os.visits().slice(0, 3));
  protected readonly duePupils = computed(() => this.students.students().filter((s) => s.fee === 'due').slice(0, 5));
  protected readonly papers = computed(() => this.os.exams().slice(0, 5));
  protected readonly events = computed(() => this.os.events().slice(0, 4));
  protected readonly lowStock = computed(() => this.os.stock().filter((i) => i.qty < 20).slice(0, 5));

  protected readonly shortcuts = computed(() =>
    [
      { path: 'admissions', title: 'Enrol', detail: 'Applications and new numbers' },
      { path: 'students', title: 'Pupils', detail: 'Class lists and guardians' },
      { path: 'attendance', title: 'Roll call', detail: 'Mark Baby–P7 present' },
      { path: 'academics', title: 'Exams', detail: 'End-of-term sittings' },
      { path: 'documents', title: 'Documents', detail: 'Letters, IDs and report samples' },
      { path: 'finance', title: 'Fees', detail: 'Balances and payroll' },
      { path: 'health', title: 'Sickbay', detail: 'Log a visit' },
      { path: 'inventory', title: 'Stores', detail: 'Stock in and issue' },
      { path: 'calendar', title: 'Calendar', detail: 'Term dates and PTM' },
      { path: 'feedback', title: 'Feedback', detail: 'Print parent, teacher or visitor forms' },
    ].filter((s) => this.access.canView(s.path)),
  );

  protected readonly parentKpis = computed(() => [
    { label: 'Attendance', value: '96%', change: 'Faith · Primary Five', bars: [8, 9, 8, 9, 10, 9, 10] },
    { label: 'Class position', value: '4th', change: 'Of her class', bars: [5, 6, 6, 7, 7, 8, 8] },
    { label: 'Fees balance', value: this.paid() ? 'UGX 0' : '260,000', change: this.paid() ? 'Cleared today' : 'Due 20 Sep', bars: [7, 6, 6, 5, 5, 4, 3] },
    { label: 'Messages', value: '1', change: 'Reports released', bars: [2, 2, 3, 2, 3, 3, 2] },
  ]);

  constructor() {
    if (this.access.can('clock', 'create')) void this.clock.refreshMine();
    void this.api
      .get<Release[]>('/releases')
      .then((rows) => {
        if (rows?.[0]) this.release.set(rows[0]);
      })
      .catch(() => undefined);
  }

  async setRole(role: string) {
    await this.auth.demoLogin(role);
    await this.sync.load();
    if (this.access.can('clock', 'create')) void this.clock.refreshMine();
  }

  async punch(kind: 'in' | 'out') {
    try {
      const row = kind === 'in' ? await this.clock.clockIn() : await this.clock.clockOut();
      this.toast.show(kind === 'in' ? 'Clocked in at ' + row.inAt : 'Clocked out at ' + (row.outAt || '') + (row.hours ? ' · ' + row.hours : ''));
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Could not update the clock');
    }
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

  go(path: string, query?: Record<string, string>) {
    this.router.navigate(['/', path], query ? { queryParams: query } : {});
  }

  markAttendance() {
    this.marked.set(true);
    this.router.navigate(['/attendance']);
  }

  decide(id: number, msg: string) {
    this.approvals.update((list) => list.filter((a) => a.id !== id));
    this.toast.show(msg);
  }

  stageLabel(stage: string) {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  }
}
