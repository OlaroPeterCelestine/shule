import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-hr',
  templateUrl: './hr.html',
})
export class HrPage {
  private toast = inject(ToastService);

  protected readonly leaves = signal([
    { id: 1, name: 'Mugabe S. — Driver', meta: 'Sick leave · 8–12 Sep' },
    { id: 2, name: 'Namutebi J. — Teacher', meta: 'Annual leave · 20–27 Sep' },
  ]);

  decide(id: number, approved: boolean) {
    const row = this.leaves().find((l) => l.id === id);
    this.leaves.update((list) => list.filter((l) => l.id !== id));
    this.toast.show((approved ? 'Leave approved for ' : 'Leave declined for ') + (row?.name.split(' — ')[0] ?? 'staff'));
  }
}
