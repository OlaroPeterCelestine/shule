import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private toast = inject(ToastService);

  csv(filename: string, rows: string[][]) {
    const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
    this.save(filename, new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  }

  text(filename: string, text: string) {
    this.save(filename, new Blob([text], { type: 'text/plain;charset=utf-8;' }));
  }

  tableToCsv(filename: string, table: Element) {
    const rows: string[][] = [];
    table.querySelectorAll('tr').forEach((tr) => {
      const cells = [...tr.querySelectorAll('th,td')].map((td) => (td.textContent ?? '').trim());
      if (cells.length) rows.push(cells);
    });
    this.csv(filename, rows);
  }

  private save(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.toast.show('Downloaded ' + filename);
  }
}

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}
