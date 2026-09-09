import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-curriculum',
  imports: [StatCards],
  templateUrl: './curriculum.html',
})
export class CurriculumPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly plans = signal([
    { topic: 'Place value — Topic 4.2', meta: 'Primary Five Mathematics · Ssentongo B. · Mon 08:00' },
    { topic: 'Parts of a plant — Topic 6.1', meta: 'Primary Seven Science · Ssentongo B. · Wed 08:00' },
    { topic: 'Letter sounds', meta: 'Primary One English · Namutebi J. · Thu 09:40' },
  ]);
  protected readonly reviews = signal([
    { id: 1, title: 'Primary Five Mathematics — Term 2 plan', meta: 'Submitted by Ssentongo B. · Behind schedule flag' },
    { id: 2, title: 'Primary One English — Term 2 plan', meta: 'Submitted by Namutebi J. · On schedule' },
  ]);
  protected readonly stats = computed(() => [
    { label: 'Lesson plans', value: String(this.plans().length), change: 'This week', bars: [4, 5, 5, 6, 7, 7, 8] },
    { label: 'HOD queue', value: String(this.reviews().length), change: 'Awaiting review', bars: [6, 5, 5, 4, 4, 3, 2] },
    { label: 'On schedule', value: '2 / 3', change: 'Subjects tracked', bars: [5, 6, 6, 7, 7, 8, 8] },
    { label: 'Behind', value: '8 pts', change: 'P5 Mathematics', bars: [8, 7, 7, 6, 6, 5, 5] },
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
