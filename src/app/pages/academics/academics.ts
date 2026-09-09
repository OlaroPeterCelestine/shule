import { Component, computed, inject, signal } from '@angular/core';
import { SchoolOsStore } from '../../core/school-os.store';
import { ModalService } from '../../core/modal.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-academics',
  imports: [StatCards],
  templateUrl: './academics.html',
})
export class AcademicsPage {
  protected os = inject(SchoolOsStore);
  private modal = inject(ModalService);
  private toast = inject(ToastService);
  protected readonly clash = signal(true);
  protected readonly stats = computed(() => [
    { label: 'Present today', value: '1,209', change: '94.2% attendance', bars: [8, 9, 8, 9, 10, 9, 10] },
    { label: 'Absent', value: '75', change: '13 unexplained', bars: [4, 5, 4, 3, 4, 3, 2] },
    { label: 'Exams this week', value: '3', change: 'P5 mid-terms running', bars: [2, 3, 3, 4, 4, 5, 4] },
    { label: 'Clashes', value: this.clash() ? '1' : '0', change: this.clash() ? 'Needs reschedule' : 'All clear', bars: [3, 2, 2, 1, 1, 1, 0] },
  ]);

  resolveClash() {
    this.clash.set(false);
    this.toast.show('Reschedule request sent for Primary Five Art');
  }

  addRoom() {
    this.modal.open({
      title: 'Add exam room',
      fields: [
        { key: 'room', placeholder: 'Room (e.g. Hall A) *', required: true },
        { key: 'exam', placeholder: 'Exam paper *', required: true },
        { key: 'capacity', placeholder: 'Capacity *', required: true },
        { key: 'invigilator', placeholder: 'Invigilator' },
      ],
      onConfirm: (v) => {
        this.os.addExamRoom(String(v['room']), String(v['exam']), Number(v['capacity']) || 30, String(v['invigilator'] || 'TBA'));
        this.toast.show('Exam room added — seating list ready');
      },
    });
  }
}
