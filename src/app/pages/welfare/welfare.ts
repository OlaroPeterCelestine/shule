import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-welfare',
  imports: [StatCards],
  templateUrl: './welfare.html',
})
export class WelfarePage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly incidents = signal([
    { title: 'Late submission of assignment — S2 East', meta: 'Verbal warning · 5 Sep · Follow-up scheduled', tone: 'gold' },
    { title: 'Uniform violation — S1 West', meta: 'Parent notified · 2 Sep · Closed', tone: 'maroon' },
  ]);
  protected readonly stats = computed(() => [
    { label: 'Incidents', value: String(this.incidents().length), change: 'This term', bars: [2, 2, 3, 2, 3, 3, 2] },
    { label: 'Open cases', value: String(this.incidents().filter((i) => !i.meta.includes('Closed')).length), change: 'Need follow-up', bars: [1, 2, 1, 2, 2, 1, 2] },
    { label: 'Nurse visits', value: '18', change: 'This week', bars: [4, 5, 4, 6, 5, 6, 5] },
    { label: 'Counseling', value: '7', change: 'Active students', bars: [3, 3, 4, 4, 5, 4, 5] },
  ]);

  logIncident() {
    this.modal.open({
      title: 'Log incident',
      fields: [
        { key: 'title', placeholder: 'What happened *', required: true },
        { key: 'action', placeholder: 'Action taken (e.g. Parent notified)' },
      ],
      onConfirm: (v) => {
        this.incidents.update((list) => [
          { title: String(v['title']), meta: String(v['action'] || 'Logged today') + ' · Just now', tone: 'gold' },
          ...list,
        ]);
        this.toast.show('Incident logged');
      },
    });
  }
}
