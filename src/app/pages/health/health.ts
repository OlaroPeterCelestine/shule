import { Component, computed, inject, signal } from '@angular/core';
import { AccessService } from '../../core/access.service';
import { ApiService } from '../../core/api.service';
import { ModalService } from '../../core/modal.service';
import { paginate } from '../../core/page';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { SchoolOsStore, type SickVisit } from '../../core/school-os.store';
import { StudentsStore } from '../../core/students.store';
import { ToastService } from '../../core/toast.service';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-health',
  imports: [StatCards, Pager],
  templateUrl: './health.html',
})
export class HealthPage {
  protected os = inject(SchoolOsStore);
  protected access = inject(AccessService);
  private students = inject(StudentsStore);
  private modal = inject(ModalService);
  private toast = inject(ToastService);
  private pdf = inject(PdfViewerService);
  private api = inject(ApiService);

  protected readonly page = signal(1);
  protected readonly paged = computed(() => paginate(this.os.visits(), this.page()));

  protected readonly stats = computed(() => [
    { label: 'Visits today', value: String(this.os.visits().length), change: 'Sickbay log', bars: [3, 4, 3, 5, 4, 5, 4] },
    { label: 'Parents notified', value: String(this.os.visits().filter((v) => v.notified).length), change: 'SMS / call', bars: [4, 5, 5, 6, 6, 7, 7] },
    { label: 'Allergies on file', value: String(this.students.students().filter((s) => s.allergies && s.allergies !== 'None').length), change: 'From student 360', bars: [2, 3, 3, 4, 4, 4, 5] },
    { label: 'Restricted', value: 'On', change: 'Nurse & admin only', bars: [8, 8, 8, 8, 8, 8, 8] },
  ]);

  logVisit() {
    if (!this.access.can('health', 'create')) return;
    const names = this.students.students().map((s) => s.adm + ' — ' + s.name);
    this.modal.open({
      title: 'Log sickbay visit',
      select: names.length ? { key: 'student', options: names } : undefined,
      fields: [
        ...(names.length ? [] : [{ key: 'student', placeholder: 'Admission no. — Name *', required: true }]),
        { key: 'reason', placeholder: 'Reason *', required: true },
        { key: 'action', placeholder: 'Action taken' },
      ],
      onConfirm: async (v) => {
        const raw = String(v['student'] || names[0] || '');
        const [adm, ...rest] = raw.split(' — ');
        const name = rest.join(' — ') || raw;
        const reason = String(v['reason']);
        const action = String(v['action'] || 'Observation');
        if (this.api.token()) {
          try {
            const row = await this.api.post<SickVisit>('/health', { adm, reason, action });
            this.os.addVisit(row.adm, row.name, row.reason, row.action, row.id);
          } catch (err) {
            this.toast.show(err instanceof Error ? err.message : 'Could not log that visit');
            return false;
          }
        } else {
          this.os.addVisit(adm || '—', name, reason, action);
        }
        this.page.set(1);
        this.toast.show('Visit logged for ' + name);
        return;
      },
    });
  }

  async notify(id: number, name: string) {
    this.os.notifyParent(id);
    if (this.api.token()) {
      try {
        await this.api.patch('/health/' + id, { notified: true });
      } catch (err) {
        this.os.visits.update((list) => list.map((v) => (v.id === id ? { ...v, notified: false } : v)));
        this.toast.show(err instanceof Error ? err.message : 'Could not notify that parent');
        return;
      }
    }
    this.toast.show('Parent notified about ' + name);
  }

  async sickNote(id: number, name: string) {
    try {
      await this.pdf.open('Sick leave — ' + name, '/documents/sick-leave/pdf?visit=' + id);
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Could not generate the sick note');
    }
  }
}
