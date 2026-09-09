import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-lifecycle',
  imports: [],
  templateUrl: './lifecycle.html',
})
export class LifecyclePage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  promote(ev: Event) {
    const row = (ev.target as HTMLElement).closest('tr');
    if (!row) return;
    const name = row.children[0].textContent ?? '';
    (row as HTMLElement).style.opacity = '0.4';
    row.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
    this.toast.show(name + ' marked as graduating — added to Alumni');
  }

  hold(ev: Event) {
    const row = (ev.target as HTMLElement).closest('tr');
    const name = row?.children[0].textContent ?? '';
    this.toast.show(name + ' held back for clearance');
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
        const tbody = document.getElementById('alumniRows');
        if (tbody) {
          const tr = document.createElement('tr');
          tr.innerHTML = '<td class="py-2">' + v['name'] + '</td><td class="py-2">' + v['year'] + '</td><td class="py-2">S6</td><td class="py-2 text-slate2/60">' + (v['now'] || '—') + '</td>';
          tbody.prepend(tr);
        }
        this.toast.show(v['name'] + ' added to Alumni directory');
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
