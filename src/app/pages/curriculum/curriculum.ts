import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-curriculum',
  templateUrl: './curriculum.html',
})
export class CurriculumPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly plans = signal([
    { topic: 'Quadratic equations — Topic 4.2', meta: 'S2 Mathematics · Ssentongo B. · Mon 08:00' },
    { topic: 'Wave properties — Topic 6.1', meta: 'S4 Physics · Ssentongo B. · Wed 08:00' },
    { topic: 'Comprehension: persuasive texts', meta: 'S1 English · Namutebi J. · Thu 09:40' },
  ]);
  protected readonly reviews = signal([
    { id: 1, title: 'S2 Mathematics — Term 2 plan', meta: 'Submitted by Ssentongo B. · Behind schedule flag' },
    { id: 2, title: 'S1 English — Term 2 plan', meta: 'Submitted by Namutebi J. · On schedule' },
  ]);

  newLesson() {
    this.modal.open({
      title: 'New lesson plan',
      fields: [
        { key: 'topic', placeholder: 'Topic (e.g. Cell division — Topic 5.1) *', required: true },
        { key: 'cls', placeholder: 'Class & subject (e.g. P5 Science) *', required: true },
      ],
      onConfirm: (v) => {
        this.plans.update((list) => [{ topic: String(v['topic']), meta: String(v['cls']) + ' · Draft' }, ...list]);
        this.toast.show('Lesson plan saved as draft');
      },
    });
  }

  decide(id: number, msg: string) {
    this.reviews.update((list) => list.filter((r) => r.id !== id));
    this.toast.show(msg);
  }
}
