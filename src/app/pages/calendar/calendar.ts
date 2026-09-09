import { Component, computed, inject } from '@angular/core';
import { SchoolOsStore } from '../../core/school-os.store';
import { ModalService } from '../../core/modal.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-calendar',
  imports: [StatCards],
  templateUrl: './calendar.html',
})
export class CalendarPage {
  protected os = inject(SchoolOsStore);
  private modal = inject(ModalService);
  private toast = inject(ToastService);

  protected readonly stats = computed(() => [
    { label: 'Events', value: String(this.os.events().length), change: 'This term', bars: [3, 4, 4, 5, 6, 6, 7] },
    { label: 'Exams', value: String(this.os.events().filter((e) => e.type === 'Exams').length), change: 'On the calendar', bars: [4, 5, 5, 6, 5, 6, 6] },
    { label: 'PTMs', value: String(this.os.events().filter((e) => e.type === 'PTM').length), change: 'Parents booked', bars: [2, 3, 3, 4, 4, 5, 4] },
    { label: 'Holidays', value: String(this.os.events().filter((e) => e.type === 'Holiday').length), change: 'Term 2 close', bars: [1, 1, 2, 2, 2, 3, 3] },
  ]);

  addEvent() {
    this.modal.open({
      title: 'Add calendar event',
      fields: [
        { key: 'title', placeholder: 'Event title *', required: true },
        { key: 'date', placeholder: 'Date (e.g. 26 Sep) *', required: true },
        { key: 'type', placeholder: 'Type (Exams, PTM, Event, Holiday)' },
        { key: 'audience', placeholder: 'Audience' },
      ],
      onConfirm: (v) => {
        this.os.addEvent(String(v['title']), String(v['date']), String(v['type'] || 'Event'), String(v['audience'] || 'All'));
        this.toast.show(v['title'] + ' added to the calendar');
      },
    });
  }
}
