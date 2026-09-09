import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../core/modal.service';
import { SearchService } from '../../core/search.service';
import { StudentsStore } from '../../core/students.store';
import { ToastService } from '../../core/toast.service';
import type { Student } from '../../core/models';

@Component({
  selector: 'app-students',
  imports: [FormsModule],
  templateUrl: './students.html',
})
export class StudentsPage {
  private store = inject(StudentsStore);
  private modal = inject(ModalService);
  private toast = inject(ToastService);
  private search = inject(SearchService);

  protected readonly q = signal(this.search.query());
  protected readonly classFilter = signal('');
  protected readonly feeFilter = signal('');
  protected readonly panelOpen = signal(false);
  protected readonly selected = signal<Student | null>(null);
  protected readonly pane = signal('overview');

  constructor() {
    effect(() => {
      const incoming = this.search.query();
      if (incoming) this.q.set(incoming);
    });
  }

  protected readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    const cls = this.classFilter();
    const fee = this.feeFilter();
    return this.store.students().filter((s) => {
      const matchesQ = !q || s.name.toLowerCase().includes(q) || s.adm.toLowerCase().includes(q);
      return matchesQ && (!cls || s.cls === cls) && (!fee || s.fee === fee);
    });
  });

  openStudent(s: Student) {
    this.selected.set(s);
    this.pane.set('overview');
    this.panelOpen.set(true);
  }

  close() {
    this.panelOpen.set(false);
  }

  addStudent() {
    this.modal.open({
      title: 'Add student',
      fields: [
        { key: 'name', placeholder: 'Full name *', required: true },
        { key: 'cls', placeholder: 'Class (e.g. S2 East) *', required: true },
        { key: 'guardian', placeholder: 'Guardian name' },
      ],
      onConfirm: (v) => {
        const adm = 'LR-' + Math.floor(1000 + Math.random() * 8999);
        this.store.add({
          adm,
          name: String(v['name']),
          cls: String(v['cls']),
          guardian: String(v['guardian'] || '—'),
          attendance: '—',
          fee: 'due',
          feeLabel: 'Not yet invoiced',
        });
        this.toast.show(String(v['name']) + ' added to Students');
        return true;
      },
    });
  }
}
