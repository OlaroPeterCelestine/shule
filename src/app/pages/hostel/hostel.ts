import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-hostel',
  templateUrl: './hostel.html',
})
export class HostelPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly events = signal([
    { student: 'Nakiwala Faith', room: "St. Mary's — B14", event: 'Checked in', time: 'Sun, 6:40pm', in: true },
    { student: 'Byaruhanga T.', room: "St. Peter's — A03", event: 'Checked out — home visit', time: 'Today, 7:10am', in: false },
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
