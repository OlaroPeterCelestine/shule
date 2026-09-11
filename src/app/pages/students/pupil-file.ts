import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccessService } from '../../core/access.service';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { MODULE_DEFS } from '../../core/records.catalog';
import { buildPupilReport } from '../../core/report-cards';
import { SchoolOsStore } from '../../core/school-os.store';
import { StudentsStore } from '../../core/students.store';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

export type FilePane =
  | 'overview'
  | 'guardian'
  | 'medical'
  | 'campus'
  | 'fees'
  | 'attendance'
  | 'health'
  | 'reports'
  | 'behaviour'
  | 'documents';

interface BehaviourNote {
  adm: string;
  name: string;
  title: string;
  when: string;
  action: string;
  status: string;
  kind: string;
}

const SAMPLE_BEHAVIOUR: BehaviourNote[] = [
  { adm: 'LR-0894', name: 'Okello Derrick', title: 'Late to assembly ×3', when: 'This week', action: 'Talk with class teacher', status: 'Open', kind: 'Discipline' },
  { adm: 'LR-1402', name: 'Kato Brian', title: 'Uniform reminder', when: '2 Sep', action: 'Resolved with parent', status: 'Closed', kind: 'Discipline' },
  { adm: 'LR-1187', name: 'Namutebi Racheal', title: 'Counselling follow-up', when: 'Ongoing', action: 'Weekly check-in', status: 'Watch', kind: 'Pastoral' },
  { adm: 'LR-2291', name: 'Nakiwala Faith', title: 'Reading at home — praise', when: '4 Sep', action: 'Noted by class teacher', status: 'Closed', kind: 'Pastoral' },
];

const PANES: { key: FilePane; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'guardian', label: 'Guardian' },
  { key: 'medical', label: 'Medical' },
  { key: 'campus', label: 'Campus' },
  { key: 'fees', label: 'Fees' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'health', label: 'Health' },
  { key: 'reports', label: 'Reports' },
  { key: 'behaviour', label: 'Behaviour' },
  { key: 'documents', label: 'Documents' },
];

@Component({
  selector: 'app-pupil-file',
  imports: [RouterLink, StatCards],
  templateUrl: './pupil-file.html',
})
export class PupilFilePage {
  protected access = inject(AccessService);
  private students = inject(StudentsStore);
  private os = inject(SchoolOsStore);
  private pdf = inject(PdfViewerService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private params = toSignal(this.route.paramMap, { requireSync: true });
  private query = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly panes = PANES;
  protected readonly pane = signal<FilePane>('overview');
  protected readonly busy = signal('');

  constructor() {
    const tab = this.query()?.get('tab') as FilePane | null;
    if (tab && PANES.some((p) => p.key === tab)) this.pane.set(tab);
  }

  protected readonly adm = computed(() => this.params()?.get('id') ?? '');
  protected readonly student = computed(() => this.students.students().find((s) => s.adm === this.adm()) ?? null);
  protected readonly mark = computed(() => this.os.register().find((r) => r.adm === this.adm()) ?? null);
  protected readonly visits = computed(() => this.os.visits().filter((v) => v.adm === this.adm()));
  protected readonly exams = computed(() => {
    const s = this.student();
    return s ? this.os.exams().filter((e) => e.cls === s.cls) : [];
  });
  protected readonly report = computed(() => {
    const s = this.student();
    if (!s) return null;
    const size = this.students.students().filter((x) => x.cls === s.cls).length;
    return buildPupilReport(s, size);
  });
  protected readonly behaviour = computed(() => {
    const s = this.student();
    if (!s) return [];
    const fromFile = SAMPLE_BEHAVIOUR.filter((n) => n.adm === s.adm);
    const fromCatalog = (MODULE_DEFS['welfare']?.rows ?? [])
      .filter((r) => (r.cells['student'] || '').toLowerCase() === s.name.toLowerCase())
      .filter((r) => !fromFile.some((n) => n.title === r.title))
      .map((r) => ({
        adm: s.adm,
        name: s.name,
        title: r.title,
        when: r.cells['when'] || '',
        action: r.cells['action'] || r.notes || '',
        status: r.status,
        kind: 'Welfare',
      }));
    return [...fromFile, ...fromCatalog];
  });

  protected readonly stats = computed(() => {
    const s = this.student();
    const card = this.report();
    return [
      { label: 'Attendance', value: s?.attendance || '—', change: this.mark() ? 'Today: ' + this.markLabel() : 'Term rate', bars: [7, 8, 8, 9, 8, 9, 10] },
      { label: 'Fees', value: s?.fee === 'cleared' ? 'Cleared' : 'Due', change: s?.feeLabel || '—', bars: [5, 5, 6, 6, 7, 6, 7] },
      { label: 'Sickbay', value: String(this.visits().length), change: this.visits().length ? 'On this file' : 'No visits', bars: [1, 2, 1, 2, 2, 1, 2] },
      { label: 'Report', value: card ? card.grade : '—', change: card ? 'Avg ' + card.average : 'No card', bars: [6, 7, 7, 8, 8, 8, 9] },
    ];
  });

  setPane(key: FilePane) {
    this.pane.set(key);
  }

  markLabel() {
    const m = this.mark()?.status;
    return m === 'P' ? 'Present' : m === 'A' ? 'Absent' : m === 'L' ? 'Late' : m === 'E' ? 'Excused' : '—';
  }

  async openDoc(title: string, path: string) {
    this.busy.set(path);
    try {
      await this.pdf.open(title, path);
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Start the API to open that PDF');
    } finally {
      this.busy.set('');
    }
  }

  openReportPdf() {
    return this.openDoc('Report card', '/documents/report-card/pdf?adm=' + encodeURIComponent(this.adm()));
  }

  openIdPdf() {
    return this.openDoc('Student ID', '/documents/student-id/pdf?adm=' + encodeURIComponent(this.adm()));
  }

  openFeePdf() {
    return this.openDoc('Fee statement', '/documents/fee-statement/pdf?adm=' + encodeURIComponent(this.adm()));
  }

  openSickPdf(id: number) {
    return this.openDoc('Sickbay note', '/documents/sick-leave/pdf?visit=' + id);
  }

  openFeedbackPdf() {
    const s = this.student();
    const q = new URLSearchParams({ kind: 'parent', event: 'Parents’ day', adm: this.adm() });
    if (s?.cls) q.set('cls', s.cls);
    return this.openDoc('Parent feedback', '/documents/feedback/pdf?' + q.toString());
  }
}
