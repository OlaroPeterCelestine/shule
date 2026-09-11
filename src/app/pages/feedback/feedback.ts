import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccessService } from '../../core/access.service';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { StudentsStore } from '../../core/students.store';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

export type FeedbackKind = 'parent' | 'teacher' | 'visitor';

const KINDS: { key: FeedbackKind; title: string; detail: string }[] = [
  { key: 'parent', title: 'Parent / guardian', detail: 'Parents’ day, PTM and open day' },
  { key: 'teacher', title: 'Teacher', detail: 'Staff voice on leadership and resources' },
  { key: 'visitor', title: 'Visitor', detail: 'Gate, inspection and campus guests' },
];

const EVENTS: Record<FeedbackKind, string[]> = {
  parent: ['Parents’ day', 'Parent-teacher meeting', 'Open day', 'End of term', 'Other'],
  teacher: ['Staff meeting', 'End of term', 'Inset day', 'Other'],
  visitor: ['Campus visit', 'Open day', 'Inspection', 'Delivery', 'Other'],
};

const QUESTIONS: Record<FeedbackKind, string[]> = {
  parent: [
    'Teaching and learning in class',
    'How the school talks to parents',
    'Safety on campus and on the van',
    'Cleanliness and care of the grounds',
    'Value for the fees you pay',
    'I would recommend Little Royals',
  ],
  teacher: [
    'Support from school leadership',
    'Class size and teaching resources',
    'Time for planning and marking',
    'Partnership with parents',
    'Professional development this term',
    'I would recommend teaching here',
  ],
  visitor: [
    'Welcome at the gate',
    'How easy it was to find who you came to see',
    'Cleanliness of the campus',
    'Courtesy of staff',
    'How safe you felt on site',
    'I would visit again or recommend the school',
  ],
};

@Component({
  selector: 'app-feedback',
  imports: [RouterLink, StatCards],
  templateUrl: './feedback.html',
})
export class FeedbackPage {
  protected access = inject(AccessService);
  private pdf = inject(PdfViewerService);
  private toast = inject(ToastService);
  private pupils = inject(StudentsStore);

  protected readonly kinds = KINDS;
  protected readonly kind = signal<FeedbackKind>('parent');
  protected readonly event = signal(EVENTS.parent[0]);
  protected readonly name = signal('');
  protected readonly adm = signal('');
  protected readonly cls = signal('');
  protected readonly note = signal('');
  protected readonly scores = signal<number[]>([0, 0, 0, 0, 0, 0]);
  protected readonly busy = signal('');

  protected readonly students = computed(() => this.pupils.students());
  protected readonly events = computed(() => EVENTS[this.kind()]);
  protected readonly questions = computed(() => QUESTIONS[this.kind()]);
  protected readonly filled = computed(() => this.scores().filter((n) => n > 0).length);
  protected readonly stats = computed(() => [
    { label: 'Form types', value: '3', change: 'Parent, teacher, visitor', bars: [3, 3, 4, 4, 5, 5, 5] },
    { label: 'Questions', value: String(this.questions().length), change: 'Rated 1 to 5', bars: [4, 5, 5, 6, 6, 6, 6] },
    { label: 'Scores set', value: String(this.filled()), change: this.filled() ? 'Will print on the PDF' : 'Blank pack', bars: [1, 2, 2, 3, 3, 4, 4] },
    { label: 'Pupils on file', value: String(this.students().length), change: 'Optional on parent forms', bars: [6, 6, 7, 7, 8, 8, 9] },
  ]);

  setKind(key: FeedbackKind) {
    this.kind.set(key);
    this.event.set(EVENTS[key][0]);
    this.scores.set(QUESTIONS[key].map(() => 0));
    if (key !== 'parent') this.adm.set('');
  }

  setScore(index: number, value: number) {
    this.scores.update((list) => list.map((n, i) => (i === index ? (n === value ? 0 : value) : n)));
  }

  pickPupil(adm: string) {
    this.adm.set(adm);
    const pupil = this.students().find((s) => s.adm === adm);
    if (pupil) this.cls.set(pupil.cls);
  }

  async generate(blank: boolean) {
    const params = new URLSearchParams();
    params.set('kind', this.kind());
    if (this.event()) params.set('event', this.event());
    if (!blank && this.name().trim()) params.set('name', this.name().trim());
    if (!blank && this.note().trim()) params.set('note', this.note().trim().slice(0, 600));
    if (this.kind() === 'parent') {
      if (this.adm()) params.set('adm', this.adm());
      if (this.cls().trim()) params.set('cls', this.cls().trim());
    }
    if (!blank && this.scores().some((n) => n > 0)) params.set('scores', this.scores().join(','));
    const title = blank ? 'Blank feedback form' : 'Feedback form';
    this.busy.set(blank ? 'blank' : 'fill');
    try {
      await this.pdf.open(title, '/documents/feedback/pdf?' + params.toString());
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Start the API to generate the official PDF');
    } finally {
      this.busy.set('');
    }
  }
}
