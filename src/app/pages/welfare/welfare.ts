import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-welfare',
  templateUrl: './welfare.html',
})
export class WelfarePage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly incidents = signal([
    { title: 'Late submission of assignment — S2 East', meta: 'Verbal warning · 5 Sep · Follow-up scheduled', tone: 'gold' },
    { title: 'Uniform violation — S1 West', meta: 'Parent notified · 2 Sep · Closed', tone: 'maroon' },
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
