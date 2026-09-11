import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { isKindergarten, reportsFor } from '../../core/report-cards';
import { StudentsStore } from '../../core/students.store';
import { DownloadService } from '../../core/download.service';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { paginate } from '../../core/page';
import { ToastService } from '../../core/toast.service';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-reports',
  imports: [StatCards, Pager],
  templateUrl: './reports.html',
})
export class ReportsPage {
  private students = inject(StudentsStore);
  private download = inject(DownloadService);
  private pdf = inject(PdfViewerService);
  private toast = inject(ToastService);
  private router = inject(Router);

  protected readonly page = signal(1);
  protected readonly cards = computed(() => reportsFor(this.students.students()));
  protected readonly paged = computed(() => paginate(this.cards(), this.page()));
  protected readonly stats = computed(() => {
    const all = this.students.students();
    const kg = all.filter((s) => isKindergarten(s.cls)).length;
    return [
      { label: 'Pupils', value: String(all.length), change: 'Kindergarten & Primary', bars: [4, 5, 6, 7, 8, 8, 9] },
      { label: 'Kindergarten', value: String(kg), change: 'Baby · Middle · Top', bars: [3, 4, 4, 5, 5, 6, 6] },
      { label: 'Primary', value: String(all.length - kg), change: 'P1 to P7', bars: [5, 6, 6, 7, 8, 8, 9] },
      { label: 'Cards ready', value: String(all.length), change: 'Term 2, 2026', bars: [6, 7, 7, 8, 8, 9, 10] },
    ];
  });

  open(adm: string) {
    this.router.navigate(['/students', adm, 'card']);
  }

  async openPdf(adm: string, name: string, ev: Event) {
    ev.stopPropagation();
    try {
      await this.pdf.open('Report card — ' + name, '/documents/report-card/pdf?adm=' + encodeURIComponent(adm));
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Could not generate the report card');
    }
  }

  genBatch() {
    const rows: string[][] = [['Admission No.', 'Name', 'Class', 'Section', 'Average', 'Grade', 'Position']];
    for (const c of this.cards()) {
      rows.push([c.student.adm, c.student.name, c.student.cls, c.section, c.average, c.grade, c.position]);
    }
    this.download.csv('little-royals-report-cards-term2-2026.csv', rows);
  }

  print() {
    window.print();
  }
}
