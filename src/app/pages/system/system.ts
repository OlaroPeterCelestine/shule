import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-system',
  imports: [],
  templateUrl: './system.html',
})
export class SystemPage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  runBackup() { this.toast.show('Backup started — you will be notified when complete'); }

  importData() {
    this.modal.open({
      title: 'Import data',
      message: '<p class="mb-3 text-slate2/70">Choose what to import, then select a CSV file.</p>',
      select: { key: 'type', options: ['Students', 'Marks', 'Fees', 'Attendance'] },
      file: { key: 'file', accept: '.csv,text/csv' },
      confirmLabel: 'Import',
      onConfirm: (v) => {
        const file = v['file'] as File | undefined;
        if (!file) { this.toast.show('Choose a CSV file to import'); return false; }
        const reader = new FileReader();
        reader.onload = () => {
          const lines = String(reader.result).split(/\r?\n/).filter((l) => l.trim().length);
          const records = Math.max(0, lines.length - 1);
          this.toast.show('Imported ' + records + ' ' + String(v['type']).toLowerCase() + ' record' + (records === 1 ? '' : 's') + ' from ' + file.name);
        };
        reader.onerror = () => this.toast.show('Could not read that file');
        reader.readAsText(file);
        return true;
      },
    });
  }

  exportData() {
    const rows: string[][] = [['Admission No.', 'Name', 'Class', 'Attendance', 'Fee status']];
    document.querySelectorAll('.student-row').forEach((row) => {
      const cells = [...row.children].map((td) => (td.textContent ?? '').trim());
      rows.push(cells.slice(0, 6));
    });
    if (rows.length === 1) {
      rows.push(['LR-2291', 'Nakiwala Faith', 'S4 East', '96%', 'Cleared']);
      rows.push(['LR-1187', 'Namutebi Racheal', 'S5 Arts', '88%', '620,000 due']);
    }
    this.download.csv('students-export.csv', rows);
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
