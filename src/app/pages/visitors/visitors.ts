import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-visitors',
  templateUrl: './visitors.html',
})
export class VisitorsPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly visitors = signal([
    { id: 1, name: 'John Mukasa', purpose: 'Textbook delivery', host: 'Librarian', badge: 'V-0231', status: 'On campus' },
    { id: 2, name: 'Rose Nakiwala', purpose: 'Parent meeting', host: 'Class Teacher, S4 East', badge: 'V-0232', status: 'On campus' },
    { id: 3, name: 'Umeme Technician', purpose: 'Meter inspection', host: "Bursar's office", badge: 'V-0230', status: 'Checked out' },
  ]);

  checkIn() {
    this.modal.open({
      title: 'Check in visitor',
      fields: [
        { key: 'name', placeholder: 'Visitor name *', required: true },
        { key: 'purpose', placeholder: 'Purpose of visit *', required: true },
        { key: 'host', placeholder: 'Person / office being visited' },
      ],
      onConfirm: (v) => {
        const badge = 'V-' + Math.floor(100 + Math.random() * 899);
        this.visitors.update((list) => [
          { id: Date.now(), name: String(v['name']), purpose: String(v['purpose']), host: String(v['host'] || '—'), badge, status: 'On campus' },
          ...list,
        ]);
        this.toast.show(v['name'] + ' checked in — badge ' + badge);
      },
    });
  }

  checkout(id: number) {
    this.visitors.update((list) => list.map((row) => (row.id === id ? { ...row, status: 'Checked out' } : row)));
    this.toast.show('Visitor checked out');
  }
}
