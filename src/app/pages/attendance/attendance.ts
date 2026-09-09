import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchoolOsStore, type Mark } from '../../core/school-os.store';
import { StudentsStore } from '../../core/students.store';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-attendance',
  imports: [FormsModule, StatCards],
  templateUrl: './attendance.html',
})
export class AttendancePage {
  protected os = inject(SchoolOsStore);
  private students = inject(StudentsStore);
  private toast = inject(ToastService);

  protected readonly cls = signal('');
  protected readonly lesson = signal('Morning roll call');

  constructor() {
    for (const s of this.students.students()) {
      this.os.addToRegister({ adm: s.adm, name: s.name, cls: s.cls, status: 'P' });
    }
  }

  protected readonly classes = computed(() => [...new Set(this.os.register().map((r) => r.cls))].sort());
  protected readonly rows = computed(() => {
    const c = this.cls();
    return this.os.register().filter((r) => !c || r.cls === c);
  });
  protected readonly stats = computed(() => {
    const rows = this.rows();
    const present = rows.filter((r) => r.status === 'P').length;
    const late = rows.filter((r) => r.status === 'L').length;
    const absent = rows.filter((r) => r.status === 'A').length;
    const rate = rows.length ? Math.round(((present + late) / rows.length) * 1000) / 10 : 0;
    return [
      { label: 'Present', value: String(present), change: this.lesson(), bars: [7, 8, 8, 9, 9, 10, 9] },
      { label: 'Late', value: String(late), change: 'Arrived after 8:00', bars: [2, 3, 2, 3, 3, 2, 3] },
      { label: 'Absent', value: String(absent), change: 'Parents will be notified', bars: [2, 2, 3, 2, 2, 3, 2] },
      { label: 'Rate', value: rate + '%', change: rows.length + ' in this list', bars: [8, 8, 9, 8, 9, 9, 10] },
    ];
  });

  mark(adm: string, status: Mark) {
    this.os.setMark(adm, status);
  }

  markAllPresent() {
    this.os.markAll('P', this.cls() || undefined);
    this.toast.show('All marked present');
  }

  submit() {
    const absents = this.rows().filter((r) => r.status === 'A');
    if (absents.length) {
      this.toast.show('Register saved — SMS sent to ' + absents.length + ' parent' + (absents.length === 1 ? '' : 's'));
    } else {
      this.toast.show('Register saved — full attendance');
    }
  }
}
