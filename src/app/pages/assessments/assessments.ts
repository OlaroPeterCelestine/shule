import { Component, computed, inject, signal } from '@angular/core';
import { SchoolOsStore } from '../../core/school-os.store';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-assessments',
  imports: [StatCards],
  templateUrl: './assessments.html',
})
export class AssessmentsPage {
  protected os = inject(SchoolOsStore);
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly tab = signal('ca');
  protected readonly generated = signal<string | null>(null);
  protected readonly online = signal([
    { title: 'P5 Science — Plants quiz', meta: '20 min · Opens 10 Sep' },
    { title: 'P7 Math — Fractions MCQ', meta: '30 min · Opens 12 Sep' },
  ]);
  protected readonly stats = computed(() => [
    { label: 'CA items', value: '3', change: 'This term', bars: [3, 4, 4, 5, 5, 6, 5] },
    { label: 'Question bank', value: String(this.os.questions().length), change: 'Reusable items', bars: [6, 7, 7, 8, 8, 9, 10] },
    { label: 'Online tests', value: String(this.online().length), change: 'Scheduled', bars: [2, 2, 3, 3, 4, 4, 5] },
    { label: 'Drafts', value: this.generated() ? '1' : '0', change: 'Ready to review', bars: [1, 1, 2, 1, 2, 2, 3] },
  ]);

  addQuestion() {
    this.modal.open({
      title: 'Add question',
      fields: [
        { key: 'text', placeholder: 'Question text *', required: true },
        { key: 'subject', placeholder: 'Subject *', required: true },
        { key: 'topic', placeholder: 'Topic' },
        { key: 'type', placeholder: 'Type (MCQ, Short answer…)' },
        { key: 'difficulty', placeholder: 'Difficulty' },
        { key: 'marks', placeholder: 'Marks' },
      ],
      onConfirm: (v) => {
        this.os.addQuestion({
          text: String(v['text']),
          subject: String(v['subject']),
          topic: String(v['topic'] || 'General'),
          type: String(v['type'] || 'Short answer'),
          difficulty: String(v['difficulty'] || 'Medium'),
          marks: Number(v['marks']) || 2,
        });
        this.toast.show('Question saved to the bank');
      },
    });
  }

  generateTest() {
    this.modal.open({
      title: 'Generate test from bank',
      fields: [
        { key: 'subject', placeholder: 'Subject (e.g. Mathematics) *', required: true },
        { key: 'count', placeholder: 'Number of questions *', required: true },
      ],
      onConfirm: (v) => {
        const n = String(v['count']);
        this.generated.set('Draft test: ' + n + ' ' + v['subject'] + ' questions — ready to review');
        this.toast.show('Test generated from ' + n + ' questions — ready to review');
      },
    });
  }

  scheduleTest() {
    this.modal.open({
      title: 'Schedule online test',
      fields: [
        { key: 'title', placeholder: 'Test title *', required: true },
        { key: 'when', placeholder: 'Opens on (e.g. 15 Sep) *', required: true },
      ],
      onConfirm: (v) => {
        this.online.update((list) => [{ title: String(v['title']), meta: '30 min · Opens ' + v['when'] }, ...list]);
        this.toast.show('Online test scheduled');
      },
    });
  }
}
