import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { paginate } from '../../core/page';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-visitors',
  imports: [StatCards, Pager],
  templateUrl: './visitors.html',
})
export class VisitorsPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly page = signal(1);
  protected readonly visitors = signal([
    { id: 1, name: 'John Mukasa', purpose: 'Textbook delivery', host: 'Librarian', badge: 'V-0231', status: 'On campus' },
    { id: 2, name: 'Rose Nakiwala', purpose: 'Parent meeting', host: 'Class Teacher, Primary Five', badge: 'V-0232', status: 'On campus' },
    { id: 3, name: 'Umeme Technician', purpose: 'Meter inspection', host: "Bursar's office", badge: 'V-0230', status: 'Checked out' },
  ]);
  protected readonly paged = computed(() => paginate(this.visitors(), this.page()));
  protected readonly stats = computed(() => {
    const on = this.visitors().filter((v) => v.status === 'On campus').length;
    return [
      { label: 'On campus', value: String(on), change: 'Live at the gate', bars: [3, 4, 4, 5, 4, 5, 4] },
      { label: 'Checked out', value: String(this.visitors().length - on), change: 'Today', bars: [5, 4, 5, 6, 5, 6, 7] },
      { label: 'Badges issued', value: String(this.visitors().length), change: 'This session', bars: [2, 3, 3, 4, 4, 5, 5] },
      { label: 'Parent visits', value: '1', change: 'Scheduled today', bars: [1, 2, 1, 2, 2, 1, 2] },
    ];
  });

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
