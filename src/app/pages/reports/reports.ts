import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SINGLE_REPORT } from './report-card';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
})
export class ReportsPage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  genBatch() {
    const rows: string[][] = [['Admission No.', 'Name', 'Average (%)', 'Grade', 'Position']];
    const names = ['Nakiwala Faith', 'Okwir Peter', 'Namuli Grace', 'Byaruhanga Tom', 'Achen Ruth', 'Ssali Ivan', 'Nabatanzi Joy', 'Kirabo Alex', 'Tumwine Ivan', 'Mugisha Ruth'];
    for (let i = 1; i <= 58; i++) {
      const base = names[(i - 1) % names.length];
      const avg = 52 + ((i * 7) % 40);
      const grade = avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';
      rows.push(['LR-' + (3000 + i), base + (i > names.length ? ' ' + i : ''), String(avg), grade, String(i)]);
    }
    this.download.csv('S4-East-report-cards-Term2-2026.csv', rows);
  }

  genSingle() {
    this.report.open('Report card — Nakiwala Faith', SINGLE_REPORT);
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
