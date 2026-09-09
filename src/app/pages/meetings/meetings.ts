import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-meetings',
  imports: [StatCards],
  templateUrl: './meetings.html',
})
export class MeetingsPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly slots = signal([
    { time: '09:00', teacher: 'Ssentongo B. — Primary Five', booked: 'R. Nakiwala' },
    { time: '09:20', teacher: 'Ssentongo B. — Primary Five', booked: 'Open' },
    { time: '10:30', teacher: 'Namutebi J. — English', booked: 'J. Namutebi' },
  ]);
  protected readonly visits = signal([
    { id: 1, title: 'P. Okello — wants to discuss fee balance', meta: 'Requested: Fri 11 Sep, 2:00pm · With Accountant' },
    { id: 2, title: 'S. Achieng — counseling follow-up', meta: 'Requested: Mon 14 Sep, 11:00am · With Counselor' },
  ]);
  protected readonly stats = computed(() => [
    { label: 'PTM slots', value: String(this.slots().length), change: 'Sat 12 Sep', bars: [3, 4, 4, 5, 5, 6, 5] },
    { label: 'Open slots', value: String(this.slots().filter((s) => s.booked === 'Open').length), change: 'Still available', bars: [4, 3, 3, 2, 2, 2, 1] },
    { label: 'Visit requests', value: String(this.visits().length), change: 'Awaiting decision', bars: [2, 2, 3, 3, 2, 3, 2] },
    { label: 'Booked', value: String(this.slots().filter((s) => s.booked !== 'Open').length), change: 'Parents confirmed', bars: [2, 3, 3, 4, 4, 5, 5] },
  ]);

  newPtm() {
    this.modal.open({
      title: 'New parent-teacher meeting',
      fields: [
        { key: 'time', placeholder: 'Slot (e.g. 11:00) *', required: true },
        { key: 'teacher', placeholder: 'Teacher & subject *', required: true },
        { key: 'parent', placeholder: 'Booked by (parent name)' },
      ],
      onConfirm: (v) => {
        this.slots.update((list) => [
          ...list,
          { time: String(v['time']), teacher: String(v['teacher']), booked: String(v['parent'] || 'Open') },
        ]);
        this.toast.show('PTM slot added for ' + v['time']);
      },
    });
  }

  decide(id: number, msg: string) {
    this.visits.update((list) => list.filter((v) => v.id !== id));
    this.toast.show(msg);
  }
}
