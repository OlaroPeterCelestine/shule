import { Component, computed, inject, signal } from '@angular/core';
import { ClockService } from '../../core/clock.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-hr',
  imports: [StatCards],
  templateUrl: './hr.html',
})
export class HrPage {
  private toast = inject(ToastService);
  protected clock = inject(ClockService);

  protected readonly leaves = signal([
    { id: 1, name: 'Mugabe S. — Driver', meta: 'Sick leave · 8–12 Sep' },
    { id: 2, name: 'Namutebi J. — Teacher', meta: 'Annual leave · 20–27 Sep' },
  ]);
  constructor() {
    void this.clock.refreshToday();
  }

  protected readonly onCampus = computed(() => this.clock.today().filter((p) => p.open).length);

  protected readonly stats = computed(() => [
    { label: 'Employees', value: '86', change: 'Across all campuses', bars: [6, 7, 7, 8, 8, 9, 9] },
    { label: 'On campus', value: String(this.onCampus()), change: 'Clocked in now', bars: [4, 5, 5, 6, 7, 7, 8] },
    { label: 'Pending leave', value: String(this.leaves().length), change: 'Awaiting approval', bars: [8, 7, 6, 5, 6, 4, 3] },
    { label: 'Contracts due', value: '1', change: 'Renewal this term', bars: [1, 1, 2, 1, 2, 1, 1] },
  ]);

  decide(id: number, approved: boolean) {
    const row = this.leaves().find((l) => l.id === id);
    this.leaves.update((list) => list.filter((l) => l.id !== id));
    this.toast.show((approved ? 'Leave approved for ' : 'Leave declined for ') + (row?.name.split(' — ')[0] ?? 'staff'));
  }
}
