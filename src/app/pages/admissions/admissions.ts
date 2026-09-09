import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admissions',
  imports: [],
  templateUrl: './admissions.html',
})
export class AdmissionsPage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  addApplication() {
    this.modal.open({
      title: 'New application',
      fields: [
        { key: 'name', placeholder: 'Applicant full name *', required: true },
        { key: 'cls', placeholder: 'Applying for class (e.g. S1) *', required: true },
      ],
      onConfirm: (v) => {
        const col = document.getElementById('col-applied');
        if (col) {
          const card = document.createElement('div');
          card.className = 'kanban-card border border-line rounded-sm p-2.5 text-xs bg-canvas cursor-pointer';
          card.innerHTML = '<p class="font-medium text-ink">' + v['name'] + '</p><p class="text-slate2/50 mt-1">' + v['cls'] + ' · Submitted today</p>';
          card.addEventListener('click', () => this.openApplicant(String(v['name']), String(v['cls'])));
          col.prepend(card);
        }
        this.toast.show(v['name'] + ' added to Admissions — Applied');
        return true;
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
        return true;
      },
    });
  }

  go(path: string) { this.router.navigate(['/', path]); }

  fade(ev: Event, msg: string) {
    this.toast.show(msg);
    const row = (ev.target as HTMLElement).closest('.btn-fade, .leave-item');
    if (!row) return;
    row.classList.add('gone');
    setTimeout(() => {
      row.remove();
      const el = document.getElementById('leaveCount');
      if (el) el.textContent = String(document.querySelectorAll('#leaveList .leave-item').length);
    }, 320);
  }
}
