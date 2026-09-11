import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessService } from '../../core/access.service';
import { ApiService } from '../../core/api.service';
import { ModalService } from '../../core/modal.service';
import { SCHOOL_CLASSES } from '../../core/report-cards';
import { SchoolOsStore, type ExamSitting } from '../../core/school-os.store';
import { ToastService } from '../../core/toast.service';
import { paginate } from '../../core/page';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

const KINDS = ['End of term', 'Mid-term', 'Continuous'];
const SCOPES = ['Whole school', 'Kindergarten', 'Primary', ...SCHOOL_CLASSES];

@Component({
  selector: 'app-academics',
  imports: [FormsModule, StatCards, Pager],
  templateUrl: './academics.html',
})
export class AcademicsPage {
  protected os = inject(SchoolOsStore);
  protected access = inject(AccessService);
  private modal = inject(ModalService);
  private toast = inject(ToastService);
  private api = inject(ApiService);

  protected readonly kinds = KINDS;
  protected readonly scopes = SCOPES;
  protected readonly classes = SCHOOL_CLASSES;
  protected readonly sitting = signal({
    kind: 'End of term',
    cls: 'Primary',
    startDate: '2026-11-02',
    startTime: '08:00',
    duration: '90',
    room: 'Hall A',
    invigilator: 'B. Ssentongo',
  });
  protected readonly saving = signal(false);
  protected readonly filter = signal('');
  protected readonly page = signal(1);

  protected readonly papers = computed(() => {
    const cls = this.filter();
    return this.os.exams().filter((e) => !cls || e.cls === cls);
  });
  protected readonly paged = computed(() => paginate(this.papers(), this.page()));

  setFilter(value: string) {
    this.filter.set(value);
    this.page.set(1);
  }

  protected readonly stats = computed(() => {
    const register = this.os.register();
    const present = register.filter((r) => r.status === 'P' || r.status === 'L').length;
    const absent = register.filter((r) => r.status === 'A').length;
    const rate = register.length ? Math.round((present / register.length) * 1000) / 10 : 0;
    const exams = this.os.exams();
    const endTerm = exams.filter((e) => e.kind === 'End of term').length;
    return [
      { label: 'Present today', value: String(present), change: rate + '% of the register', bars: [8, 9, 8, 9, 10, 9, 10] },
      { label: 'Absent', value: String(absent), change: 'Morning roll call', bars: [4, 5, 4, 3, 4, 3, 2] },
      { label: 'Exam papers', value: String(exams.length), change: endTerm + ' end of term', bars: [2, 3, 3, 4, 4, 5, 4] },
      { label: 'Term', value: this.os.school().term, change: this.os.school().year + ' · Seguku', bars: [3, 2, 2, 1, 1, 1, 0] },
    ];
  });

  patchSitting(key: 'kind' | 'cls' | 'startDate' | 'startTime' | 'duration' | 'room' | 'invigilator', value: string) {
    this.sitting.update((s) => ({ ...s, [key]: value }));
  }

  async createSitting() {
    if (!this.access.can('academics', 'create')) {
      this.toast.show('This role cannot schedule exams');
      return;
    }
    const form = this.sitting();
    this.saving.set(true);
    if (this.api.token()) {
      try {
        const rows = await this.api.post<ExamSitting[]>('/exams/sitting', {
          kind: form.kind,
          cls: form.cls,
          startDate: form.startDate,
          startTime: form.startTime,
          duration: Number(form.duration) || 90,
          room: form.room,
          invigilator: form.invigilator,
        });
        const keep = this.os.exams().filter((e) => !rows.some((n) => n.id === e.id));
        this.os.replaceExams([...rows, ...keep]);
        this.os.addEvent(form.cls + ' ' + form.kind, form.startDate, 'Exams', form.cls);
        this.toast.show(rows.length + ' papers scheduled for ' + form.cls + ' · ' + form.kind);
      } catch (err) {
        this.toast.show(err instanceof Error ? err.message : 'Could not save the sitting');
      }
      this.saving.set(false);
      return;
    }
    this.os.addEvent(form.cls + ' ' + form.kind, form.startDate, 'Exams', form.cls);
    this.toast.show('Exam sitting added on this device — start the API to persist papers');
    this.saving.set(false);
  }

  addPaper() {
    if (!this.access.can('academics', 'create')) return;
    this.modal.open({
      title: 'Schedule one paper',
      confirmLabel: 'Schedule',
      select: { key: 'cls', options: SCHOOL_CLASSES },
      fields: [
        { key: 'subject', placeholder: 'Subject *', required: true },
        { key: 'examDate', placeholder: 'Date (YYYY-MM-DD) *', required: true, type: 'date' },
        { key: 'startTime', placeholder: 'Start (08:00)' },
        { key: 'room', placeholder: 'Room' },
        { key: 'invigilator', placeholder: 'Invigilator' },
      ],
      onConfirm: async (v) => {
        const body = {
          kind: 'End of term',
          cls: String(v['cls'] || 'Primary Five'),
          subject: String(v['subject']),
          examDate: String(v['examDate']),
          startTime: String(v['startTime'] || '08:00'),
          duration: 90,
          room: String(v['room'] || 'Hall A'),
          invigilator: String(v['invigilator'] || 'TBA'),
        };
        if (this.api.token()) {
          try {
            const row = await this.api.post<ExamSitting>('/exams', body);
            this.os.addExam(row);
          } catch (err) {
            this.toast.show(err instanceof Error ? err.message : 'Could not schedule that paper');
            return false;
          }
        } else {
          this.os.addExam({
            ...body,
            title: body.cls + ' ' + body.subject,
            term: this.os.school().term,
            year: this.os.school().year,
            status: 'Scheduled',
          });
        }
        this.toast.show(body.cls + ' ' + body.subject + ' scheduled');
        return;
      },
    });
  }

  addRoom() {
    if (!this.access.can('academics', 'create')) return;
    this.modal.open({
      title: 'Add exam room',
      fields: [
        { key: 'room', placeholder: 'Room (e.g. Hall A) *', required: true },
        { key: 'exam', placeholder: 'Exam paper *', required: true },
        { key: 'capacity', placeholder: 'Capacity *', required: true },
        { key: 'invigilator', placeholder: 'Invigilator' },
      ],
      onConfirm: (v) => {
        this.os.addExamRoom(String(v['room']), String(v['exam']), Number(v['capacity']) || 30, String(v['invigilator'] || 'TBA'));
        this.toast.show('Exam room added — seating list ready');
      },
    });
  }

  async setStatus(exam: ExamSitting, status: string) {
    if (!this.access.can('academics', 'edit')) return;
    this.os.patchExam(exam.id, { status });
    if (this.api.token()) {
      try {
        const row = await this.api.patch<ExamSitting>('/exams/' + exam.id, { status });
        this.os.patchExam(exam.id, row);
      } catch (err) {
        this.toast.show(err instanceof Error ? err.message : 'Could not update the paper');
      }
    }
  }
}
