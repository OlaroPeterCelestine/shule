import { Component, inject } from '@angular/core';
import { SINGLE_REPORT } from './report-card';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.html',
})
export class ReportsPage {
  private report = inject(ReportService);
  private download = inject(DownloadService);

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
}
