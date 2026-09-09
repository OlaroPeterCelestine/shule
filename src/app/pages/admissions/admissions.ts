import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-admissions',
  templateUrl: './admissions.html',
})
export class AdmissionsPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly applied = signal([
    { name: 'Kirabo Alex', cls: 'P1', meta: 'Submitted 2 Sep' },
    { name: 'Tumwine Ivan', cls: 'S1', meta: 'Submitted 3 Sep' },
    { name: 'Nabatanzi Joy', cls: 'P4', meta: 'Submitted 4 Sep' },
  ]);

  addApplication() {
    this.modal.open({
      title: 'New application',
      fields: [
        { key: 'name', placeholder: 'Applicant full name *', required: true },
        { key: 'cls', placeholder: 'Applying for class (e.g. P1) *', required: true },
      ],
      onConfirm: (v) => {
        const name = String(v['name']);
        const cls = String(v['cls']);
        this.applied.update((list) => [{ name, cls, meta: 'Submitted today' }, ...list]);
        this.toast.show(name + ' added to Admissions — Applied');
      },
    });
  }

  openApplicant(name: string, cls: string) {
    this.modal.open({
      title: name,
      message: '<p class="text-slate2/70 mb-3">Applying for <strong>' + cls + '</strong>.</p><div class="border border-line rounded-sm p-3 text-xs space-y-1"><p>Documents: Birth certificate ✓, Transcript ✓, Photo ✓</p><p>Next step: schedule interview</p></div>',
      confirmLabel: 'Schedule interview',
      onConfirm: () => {
        this.toast.show('Interview scheduling opened for ' + name);
      },
    });
  }
}
