import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-visitors',
  imports: [],
  templateUrl: './visitors.html',
})
export class VisitorsPage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  checkIn() {
    this.modal.open({
      title: 'Check in visitor',
      fields: [
        { key: 'name', placeholder: 'Visitor name *', required: true },
        { key: 'purpose', placeholder: 'Purpose of visit *', required: true },
        { key: 'host', placeholder: 'Person / office being visited' },
      ],
      onConfirm: (v) => {
        const badge = 'V-' + Math.floor(100 + Math.random() * 899);
        const host = v['host'] || '—';
        const tbody = document.getElementById('visitorRows');
        if (tbody) {
          const tr = document.createElement('tr');
          tr.className = 'visitor-row';
          tr.innerHTML = '<td class="px-4 py-3">' + v['name'] + '</td><td class="px-4 py-3">' + v['purpose'] + '</td><td class="px-4 py-3">' + host + '</td><td class="px-4 py-3 font-mono text-xs">' + badge + '</td><td class="px-4 py-3 text-primary">On campus</td><td class="px-4 py-3"><button type="button" class="checkout-visitor text-xs text-maroon hover:underline">Check out</button></td>';
          tr.querySelector('button')?.addEventListener('click', (e) => this.checkout(e));
          tbody.prepend(tr);
        }
        this.toast.show(v['name'] + ' checked in — badge ' + badge);
        return true;
      },
    });
  }

  checkout(ev: Event) {
    const row = (ev.target as HTMLElement).closest('tr');
    if (!row) return;
    row.children[4].textContent = 'Checked out';
    row.children[4].className = 'px-4 py-3 text-slate2/50';
    (ev.target as HTMLElement).parentElement!.innerHTML = '<span class="text-xs text-slate2/30">—</span>';
    this.toast.show('Visitor checked out');
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
