import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-lifecycle',
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
    { name: 'Namara Diana', year: '2022', cls: 'S6 Sciences', now: 'Medical student, Makerere' },
    { name: 'Ocen Bright', year: '2021', cls: 'S6 Arts', now: 'Journalist, NBS TV' },
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
