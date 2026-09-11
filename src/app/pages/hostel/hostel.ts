import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-hostel',
  imports: [StatCards],
  templateUrl: './hostel.html',
})
export class HostelPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly events = signal([
    { student: 'Nakiwala Faith', room: "St. Mary's — B14", event: 'Checked in', time: 'Sun, 6:40pm', in: true },
    { student: 'Byaruhanga T.', room: "St. Peter's — A03", event: 'Checked out — home visit', time: 'Today, 7:10am', in: false },
  ]);
  protected readonly stats = computed(() => [
    { label: 'Boarders', value: '28', change: 'P4–P7 only', bars: [7, 8, 8, 9, 9, 9, 10] },
    { label: 'Rooms', value: '12', change: 'Junior hostel', bars: [6, 7, 7, 8, 8, 8, 8] },
    { label: 'Checked in', value: String(this.events().filter((e) => e.in).length), change: 'Latest movements', bars: [5, 6, 5, 6, 7, 6, 7] },
    { label: 'Out on visit', value: String(this.events().filter((e) => !e.in).length), change: 'Home leave', bars: [2, 2, 3, 2, 3, 2, 2] },
  ]);

  record() {
    this.modal.open({
      title: 'Record check-in / check-out',
      fields: [
        { key: 'student', placeholder: 'Student name *', required: true },
        { key: 'room', placeholder: 'Room (e.g. St. Mary\'s — B14) *', required: true },
      ],
      select: { key: 'event', options: ['Checked in', 'Checked out'] },
      onConfirm: (v) => {
        const ev = String(v['event'] || 'Checked in');
        this.events.update((list) => [
          { student: String(v['student']), room: String(v['room']), event: ev, time: 'Just now', in: ev === 'Checked in' },
          ...list,
        ]);
        this.toast.show(v['student'] + ' — ' + ev.toLowerCase());
      },
    });
  }
}
