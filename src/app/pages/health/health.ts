import { Component, computed, inject } from '@angular/core';
import { SchoolOsStore } from '../../core/school-os.store';
import { StudentsStore } from '../../core/students.store';
import { ModalService } from '../../core/modal.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-health',
  imports: [StatCards],
  templateUrl: './health.html',
})
export class HealthPage {
  protected os = inject(SchoolOsStore);
  private students = inject(StudentsStore);
  private modal = inject(ModalService);
  private toast = inject(ToastService);

  protected readonly stats = computed(() => [
    { label: 'Visits today', value: String(this.os.visits().length), change: 'Sickbay log', bars: [3, 4, 3, 5, 4, 5, 4] },
    { label: 'Parents notified', value: String(this.os.visits().filter((v) => v.notified).length), change: 'SMS / call', bars: [4, 5, 5, 6, 6, 7, 7] },
    { label: 'Allergies on file', value: String(this.students.students().filter((s) => s.allergies && s.allergies !== 'None').length), change: 'From student 360', bars: [2, 3, 3, 4, 4, 4, 5] },
    { label: 'Restricted', value: 'On', change: 'Nurse & admin only', bars: [8, 8, 8, 8, 8, 8, 8] },
  ]);

  logVisit() {
    const names = this.students.students().map((s) => s.adm + ' — ' + s.name);
    this.modal.open({
      title: 'Log sickbay visit',
      select: names.length ? { key: 'student', options: names } : undefined,
      fields: [
        ...(names.length ? [] : [{ key: 'student', placeholder: 'Admission no. — Name *', required: true }]),
        { key: 'reason', placeholder: 'Reason *', required: true },
        { key: 'action', placeholder: 'Action taken' },
      ],
      onConfirm: (v) => {
        const raw = String(v['student'] || names[0] || '');
        const [adm, ...rest] = raw.split(' — ');
        const name = rest.join(' — ') || raw;
        this.os.addVisit(adm || '—', name, String(v['reason']), String(v['action'] || 'Observation'));
        this.toast.show('Visit logged for ' + name);
      },
    });
  }

  notify(id: number, name: string) {
    this.os.notifyParent(id);
    this.toast.show('Parent notified about ' + name);
  }
}
