import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.html',
})
export class AssessmentsPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly tab = signal('ca');
  protected readonly generated = signal<string | null>(null);
  protected readonly online = signal([
    { title: 'S4 Physics — Waves quiz', meta: '20 min · Opens 10 Sep' },
    { title: 'S6 Math — Calculus MCQ', meta: '30 min · Opens 12 Sep' },
  ]);

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
