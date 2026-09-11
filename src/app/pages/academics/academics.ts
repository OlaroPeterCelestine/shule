import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessService } from '../../core/access.service';
import { ApiService } from '../../core/api.service';
import { ModalService } from '../../core/modal.service';
import { SCHOOL_CLASSES } from '../../core/report-cards';
import { SchoolOsStore, type ExamSitting } from '../../core/school-os.store';
import { ToastService } from '../../core/toast.service';
import { paginate } from '../../core/page';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

export type AcadTab = 'timetable' | 'sittings';

const KINDS = ['End of term', 'Mid-term', 'Continuous'];
const SCOPES = ['Whole school', 'Kindergarten', 'Primary', ...SCHOOL_CLASSES];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS = ['08:00', '08:40', '09:20', '10:20', '11:00', '11:40', '14:00', '14:40'];

export interface Lesson {
  cls: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
}

const SAMPLE_LESSONS: Lesson[] = [
  { cls: 'Primary Five', day: 'Mon', time: '08:00', subject: 'English', teacher: 'B. Ssentongo' },
  { cls: 'Primary Five', day: 'Mon', time: '08:40', subject: 'Mathematics', teacher: 'B. Ssentongo' },
  { cls: 'Primary Five', day: 'Mon', time: '09:20', subject: 'Science', teacher: 'J. Namutebi' },
  { cls: 'Primary Five', day: 'Mon', time: '10:20', subject: 'Social Studies', teacher: 'S. Achieng' },
  { cls: 'Primary Five', day: 'Tue', time: '08:00', subject: 'Mathematics', teacher: 'B. Ssentongo' },
  { cls: 'Primary Five', day: 'Tue', time: '08:40', subject: 'English', teacher: 'B. Ssentongo' },
  { cls: 'Primary Five', day: 'Tue', time: '10:20', subject: 'Literacy', teacher: 'J. Namutebi' },
  { cls: 'Primary Five', day: 'Wed', time: '08:00', subject: 'Science', teacher: 'J. Namutebi' },
  { cls: 'Primary Five', day: 'Wed', time: '11:00', subject: 'Religious Education', teacher: 'S. Achieng' },
  { cls: 'Primary Five', day: 'Thu', time: '08:00', subject: 'English', teacher: 'B. Ssentongo' },
  { cls: 'Primary Five', day: 'Thu', time: '14:00', subject: 'Art & Technology', teacher: 'S. Achieng' },
  { cls: 'Primary Five', day: 'Fri', time: '08:00', subject: 'Physical Education', teacher: 'B. Ssentongo' },
  { cls: 'Primary Five', day: 'Fri', time: '08:40', subject: 'Mathematics', teacher: 'B. Ssentongo' },
  { cls: 'Baby class', day: 'Mon', time: '08:00', subject: 'Oral language', teacher: 'Namuli Grace' },
  { cls: 'Baby class', day: 'Mon', time: '08:40', subject: 'Number work', teacher: 'Namuli Grace' },
  { cls: 'Baby class', day: 'Tue', time: '08:00', subject: 'Creative activity', teacher: 'Namuli Grace' },
  { cls: 'Baby class', day: 'Wed', time: '08:00', subject: 'Social & personal habits', teacher: 'Namuli Grace' },
  { cls: 'Primary Seven', day: 'Mon', time: '08:00', subject: 'English', teacher: 'S. Achieng' },
  { cls: 'Primary Seven', day: 'Mon', time: '08:40', subject: 'Mathematics', teacher: 'J. Namutebi' },
  { cls: 'Primary Seven', day: 'Wed', time: '08:00', subject: 'Science', teacher: 'J. Namutebi' },
  { cls: 'Primary Seven', day: 'Fri', time: '08:00', subject: 'Social Studies', teacher: 'S. Achieng' },
];

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly kinds = KINDS;
  protected readonly scopes = SCOPES;
  protected readonly classes = SCHOOL_CLASSES;
  protected readonly days = DAYS;
  protected readonly periods = PERIODS;
  protected readonly tab = signal<AcadTab>('timetable');
  protected readonly lessons = signal<Lesson[]>(SAMPLE_LESSONS);
  protected readonly timetableClass = signal('Primary Five');
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
  protected readonly week = computed(() => {
    const cls = this.timetableClass();
    const rows = this.lessons().filter((l) => l.cls === cls);
    return PERIODS.map((time) => ({
      time,
      cells: DAYS.map((day) => rows.find((l) => l.day === day && l.time === time) ?? null),
    }));
  });
  protected readonly lessonCount = computed(() =>
    this.week().reduce((n, row) => n + row.cells.filter((cell) => !!cell).length, 0),
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const q = params.get('tab');
      if (q === 'sittings' || q === 'timetable') this.tab.set(q);
    });
  }

  setTab(next: AcadTab) {
    this.tab.set(next);
    void this.router.navigate([], { relativeTo: this.route, queryParams: { tab: next }, queryParamsHandling: 'merge' });
  }

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

  addLesson() {
    if (!this.access.can('academics', 'create')) return;
    this.modal.open({
      title: 'Add a lesson',
      confirmLabel: 'Add to timetable',
      select: { key: 'cls', options: SCHOOL_CLASSES },
      fields: [
        { key: 'day', placeholder: 'Day (Mon–Fri) *', required: true },
        { key: 'time', placeholder: 'Start (08:00) *', required: true },
        { key: 'subject', placeholder: 'Subject *', required: true },
        { key: 'teacher', placeholder: 'Teacher' },
      ],
      onConfirm: (v) => {
        const day = String(v['day'] || 'Mon').slice(0, 3);
        const lesson: Lesson = {
          cls: String(v['cls'] || this.timetableClass()),
          day: DAYS.includes(day) ? day : 'Mon',
          time: String(v['time'] || '08:00'),
          subject: String(v['subject']),
          teacher: String(v['teacher'] || 'TBA'),
        };
        this.lessons.update((list) => [
          ...list.filter((l) => !(l.cls === lesson.cls && l.day === lesson.day && l.time === lesson.time)),
          lesson,
        ]);
        this.timetableClass.set(lesson.cls);
        this.toast.show(lesson.subject + ' added on ' + lesson.day);
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
