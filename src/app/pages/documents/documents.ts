import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import type { Student } from '../../core/models';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { reportsFor } from '../../core/report-cards';
import { StudentsStore } from '../../core/students.store';
import { ToastService } from '../../core/toast.service';
import { paginate } from '../../core/page';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';
import { DOC_TEMPLATES } from './doc-templates';

export interface DocType {
  key: string;
  title: string;
  description: string;
  pick: 'student' | 'staff' | 'applicant' | 'visit' | 'none';
  group: string;
}

const FALLBACK: DocType[] = [
  { key: 'report-card', title: 'Report card', description: 'End-of-term pupil progress report', pick: 'student', group: 'Reports' },
  { key: 'fee-statement', title: 'Fee statement', description: 'Balance and payment status', pick: 'student', group: 'Money' },
  { key: 'student-id', title: 'Student ID card', description: 'Admission number, class and validity', pick: 'student', group: 'Pupils' },
  { key: 'admission-letter', title: 'Admission letter', description: 'Offer of a place for an applicant', pick: 'applicant', group: 'Pupils' },
  { key: 'transfer-certificate', title: 'Transfer certificate', description: 'Release letter when a pupil leaves', pick: 'student', group: 'Pupils' },
  { key: 'completion-certificate', title: 'Completion certificate', description: 'Issued at the end of Primary Seven', pick: 'student', group: 'Pupils' },
  { key: 'sick-leave', title: 'Sickbay / sick leave note', description: 'Nurse note for a pupil sent home or resting', pick: 'visit', group: 'Campus' },
  { key: 'staff-leave', title: 'Staff leave letter', description: 'Approved leave letter for a staff member', pick: 'staff', group: 'Staff' },
  { key: 'payslip', title: 'Staff payslip', description: 'Latest payroll line', pick: 'staff', group: 'Staff' },
  { key: 'visitor-badge', title: 'Visitor badge', description: 'Day pass for a campus visitor', pick: 'none', group: 'Campus' },
  { key: 'feedback', title: 'Feedback form', description: 'Parent, teacher or visitor form you can print blank or filled', pick: 'none', group: 'Campus' },
];

const SAMPLE_HTML: Record<string, string> = {
  'student-id': DOC_TEMPLATES['Student ID card'],
  'admission-letter': DOC_TEMPLATES['Admission letter'],
  'transfer-certificate': DOC_TEMPLATES['Transfer certificate'],
  'completion-certificate': DOC_TEMPLATES['Completion certificate'],
  payslip: DOC_TEMPLATES['Staff payslip'],
  'visitor-badge': DOC_TEMPLATES['Visitor badge'],
  feedback: DOC_TEMPLATES['Feedback form'],
};

@Component({
  selector: 'app-documents',
  imports: [RouterLink, StatCards, Pager],
  templateUrl: './documents.html',
})
export class DocumentsPage {
  private api = inject(ApiService);
  private pdf = inject(PdfViewerService);
  private toast = inject(ToastService);
  protected pupils = inject(StudentsStore);

  protected readonly types = signal<DocType[]>(FALLBACK);
  protected readonly students = signal<{ adm: string; name: string; cls: string }[]>([]);
  protected readonly staff = signal<{ id: string; name: string; role: string }[]>([]);
  protected readonly applicants = signal<{ id: number; name: string; cls: string }[]>([]);
  protected readonly visits = signal<{ id: number; name: string; reason: string; adm: string }[]>([]);
  protected readonly live = signal(false);
  protected readonly busyKey = signal('');
  protected readonly previewKey = signal('');
  protected readonly tab = signal<'all' | 'letters' | 'reports'>('all');
  protected readonly page = signal(1);
  protected readonly selectedAdm = signal('');
  protected readonly selectedStaff = signal('');
  protected readonly selectedApplicant = signal('');

  protected readonly cards = computed(() => reportsFor(this.pupils.students()));
  protected readonly paged = computed(() => paginate(this.cards(), this.page()));
  protected readonly groups = computed(() => {
    const list = this.types();
    const order = ['Reports', 'Pupils', 'Money', 'Staff', 'Campus'];
    return order
      .map((group) => ({ group, items: list.filter((t) => t.group === group) }))
      .filter((g) => g.items.length);
  });
  protected readonly selectedPupil = computed(() => {
    const adm = this.selectedAdm();
    return this.pupils.students().find((s) => s.adm === adm) || this.pupils.students()[0] || null;
  });
  protected readonly addressee = computed(() => addresseeFor(this.selectedPupil()));
  protected readonly previewHtml = computed(() => SAMPLE_HTML[this.previewKey()] || '');
  protected readonly stats = computed(() => [
    { label: 'Official PDFs', value: String(this.types().length), change: this.live() ? 'From the API' : 'Sample list', bars: [4, 5, 5, 6, 6, 6, 6] },
    { label: 'Report cards', value: String(this.cards().length), change: 'One per pupil', bars: [5, 6, 6, 7, 8, 8, 9] },
    { label: 'Paper layouts', value: String(Object.keys(SAMPLE_HTML).length), change: 'On-screen samples', bars: [2, 3, 3, 4, 4, 5, 5] },
    { label: 'Staff letters', value: String(this.staff().length || 4), change: 'Leave & payslips', bars: [6, 6, 7, 7, 7, 8, 8] },
  ]);

  constructor() {
    void this.load();
  }

  async load() {
    if (!this.api.token()) {
      this.students.set(this.pupils.students());
      const first = this.pupils.students()[0];
      if (first) this.selectedAdm.set(first.adm);
      return;
    }
    try {
      const [types, students, staff, applicants, visits] = await Promise.all([
        this.api.get<Omit<DocType, 'group'>[]>('/documents'),
        this.api.get<{ adm: string; name: string; cls: string }[]>('/students'),
        this.api.get<{ id: string; name: string; role: string }[]>('/staff'),
        this.api.get<{ id: number; name: string; cls: string }[]>('/admissions'),
        this.api.get<{ id: number; name: string; reason: string; adm: string }[]>('/health'),
      ]);
      if (Array.isArray(types) && types.length) {
        this.types.set(types.map((t) => ({ ...t, group: FALLBACK.find((f) => f.key === t.key)?.group || 'Campus' })));
      }
      this.students.set(students);
      this.staff.set(staff);
      this.applicants.set(applicants);
      this.visits.set(visits);
      this.live.set(true);
      if (!this.selectedAdm() && students[0]) this.selectedAdm.set(students[0].adm);
      if (!this.selectedStaff() && staff[0]) this.selectedStaff.set(String(staff[0].id));
      if (!this.selectedApplicant() && applicants[0]) this.selectedApplicant.set(String(applicants[0].id));
    } catch {
      this.students.set(this.pupils.students());
      const first = this.pupils.students()[0];
      if (first && !this.selectedAdm()) this.selectedAdm.set(first.adm);
    }
  }

  pickPupil(adm: string) {
    this.selectedAdm.set(adm);
  }

  hasLayout(key: string) {
    return Boolean(SAMPLE_HTML[key]);
  }

  preview(key: string) {
    this.previewKey.set(this.previewKey() === key ? '' : key);
  }

  async openPdf(type: DocType) {
    const q = this.sampleQuery(type);
    this.busyKey.set(type.key);
    try {
      await this.pdf.open(type.title, '/documents/' + type.key + '/pdf' + q);
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Start the API to open the official PDF');
      if (SAMPLE_HTML[type.key]) this.previewKey.set(type.key);
    } finally {
      this.busyKey.set('');
    }
  }

  async openCardPdf(adm: string, name: string) {
    this.busyKey.set('card-' + adm);
    try {
      await this.pdf.open('Report card — ' + name, '/documents/report-card/pdf?adm=' + encodeURIComponent(adm));
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Could not generate that report card');
    } finally {
      this.busyKey.set('');
    }
  }

  private sampleQuery(type: DocType) {
    const params = new URLSearchParams();
    const pupil = this.selectedPupil();
    if (type.pick === 'student' || type.key === 'feedback') {
      params.set('adm', this.selectedAdm() || pupil?.adm || this.pupils.students()[0]?.adm || '');
    }
    if (type.pick === 'staff') params.set('staff', this.selectedStaff() || String(this.staff()[0]?.id ?? 'LR-ST-014'));
    if (type.pick === 'applicant') params.set('applicant', this.selectedApplicant() || String(this.applicants()[0]?.id ?? '1'));
    if (type.pick === 'visit') {
      const visit = this.visits().find((v) => v.adm === this.selectedAdm()) || this.visits()[0];
      if (visit) params.set('visit', String(visit.id));
      if (this.selectedAdm()) params.set('adm', this.selectedAdm());
    }
    if (pupil?.guardian) params.set('to', pupil.guardian);
    if (pupil?.address) params.set('address', pupil.address);
    const q = params.toString();
    return q ? '?' + q : '';
  }
}

function addresseeFor(s: Student | null) {
  if (!s) return { name: 'Choose a pupil', lines: ['The letter will be addressed once you pick someone.'] };
  return {
    name: s.guardian || 'Parent / guardian of ' + s.name,
    lines: [
      s.guardianRelation ? s.guardianRelation : 'Guardian',
      s.address || 'Home address not on file',
      s.guardianPhone || '',
      s.name + ' · ' + s.adm + ' · ' + s.cls,
    ].filter(Boolean),
  };
}
