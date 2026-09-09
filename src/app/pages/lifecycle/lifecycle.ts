import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-lifecycle',
  imports: [StatCards],
  templateUrl: './lifecycle.html',
})
export class LifecyclePage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly promos = signal([
    { id: 1, name: 'Kwikiriza M.', avg: '74%', clearance: 'Cleared', decision: 'pending' },
    { id: 2, name: 'Achen R.', avg: '58%', clearance: 'Fees outstanding', decision: 'pending' },
  ]);
  protected readonly alumni = signal([
    { name: 'Namara Diana', year: '2022', cls: 'Primary Seven', now: 'Gayaza High School' },
    { name: 'Ocen Bright', year: '2021', cls: 'Primary Seven', now: 'St. Mary’s Kisubi' },
  ]);
  protected readonly stats = computed(() => [
    { label: 'Pending', value: String(this.promos().filter((p) => p.decision === 'pending').length), change: 'Need a decision', bars: [3, 3, 4, 3, 2, 2, 2] },
    { label: 'Graduating', value: String(this.promos().filter((p) => p.decision === 'graduated').length), change: 'Class of 2026', bars: [1, 1, 2, 2, 3, 4, 4] },
    { label: 'Held back', value: String(this.promos().filter((p) => p.decision === 'held').length), change: 'Clearance first', bars: [1, 2, 1, 1, 2, 1, 1] },
    { label: 'Alumni', value: String(this.alumni().length), change: 'In the directory', bars: [5, 6, 6, 7, 7, 8, 8] },
  ]);

  promote(id: number) {
    const row = this.promos().find((p) => p.id === id);
    if (!row || row.decision !== 'pending') return;
    this.promos.update((list) => list.map((p) => (p.id === id ? { ...p, decision: 'graduated' } : p)));
    this.alumni.update((list) => [{ name: row.name, year: '2026', cls: 'S6', now: 'Newly graduated' }, ...list]);
    this.toast.show(row.name + ' marked as graduating — added to Alumni');
  }

  hold(id: number) {
    const row = this.promos().find((p) => p.id === id);
    if (!row) return;
    this.promos.update((list) => list.map((p) => (p.id === id ? { ...p, decision: 'held' } : p)));
    this.toast.show(row.name + ' held back for clearance');
  }

  addAlumni() {
    this.modal.open({
      title: 'Add alumnus',
      fields: [
        { key: 'name', placeholder: 'Full name *', required: true },
        { key: 'year', placeholder: 'Graduation year *', required: true },
        { key: 'now', placeholder: 'Current pursuit' },
      ],
      onConfirm: (v) => {
        this.alumni.update((list) => [
          { name: String(v['name']), year: String(v['year']), cls: 'S6', now: String(v['now'] || '—') },
          ...list,
        ]);
        this.toast.show(v['name'] + ' added to Alumni directory');
      },
    });
  }
}
