import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccessService } from '../../core/access.service';
import { ApiService } from '../../core/api.service';
import { SchoolOsStore, type Mark } from '../../core/school-os.store';
import { StudentsStore } from '../../core/students.store';
import { paginate } from '../../core/page';
import { ToastService } from '../../core/toast.service';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-attendance',
  imports: [FormsModule, StatCards, Pager],
  templateUrl: './attendance.html',
})
export class AttendancePage {
  protected os = inject(SchoolOsStore);
  protected access = inject(AccessService);
  private students = inject(StudentsStore);
  private toast = inject(ToastService);
  private router = inject(Router);
  private api = inject(ApiService);

  open(adm: string) {
    this.router.navigate(['/attendance', adm]);
  }

  protected readonly cls = signal('');
  protected readonly lesson = signal('Morning roll call');
  protected readonly page = signal(1);

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
  protected readonly paged = computed(() => paginate(this.rows(), this.page()));

  setClass(value: string) {
    this.cls.set(value);
    this.page.set(1);
  }
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

  async mark(adm: string, status: Mark) {
    if (!this.access.can('attendance', 'edit')) return;
    const prev = this.os.register().find((r) => r.adm === adm)?.status;
    this.os.setMark(adm, status);
    if (!this.api.token()) return;
    try {
      await this.api.patch('/attendance/' + adm, { status });
    } catch (err) {
      if (prev) this.os.setMark(adm, prev);
      this.toast.show(err instanceof Error ? err.message : 'Could not save that mark');
    }
  }

  async markAllPresent() {
    if (!this.access.can('attendance', 'edit')) return;
    const cls = this.cls() || undefined;
    this.os.markAll('P', cls);
    if (this.api.token()) {
      try {
        await this.api.post('/attendance/bulk', { status: 'P', cls });
      } catch (err) {
        this.toast.show(err instanceof Error ? err.message : 'Could not save the register');
        return;
      }
    }
    this.toast.show(cls ? cls + ' marked present' : 'All classes marked present');
  }

  submit() {
    const absents = this.rows().filter((r) => r.status === 'A');
    if (this.api.token()) {
      this.toast.show(absents.length ? 'Register saved — ' + absents.length + ' absent' : 'Register saved — full attendance');
      return;
    }
    if (absents.length) {
      this.toast.show('Register saved — SMS sent to ' + absents.length + ' parent' + (absents.length === 1 ? '' : 's'));
    } else {
      this.toast.show('Register saved — full attendance');
    }
  }
}
