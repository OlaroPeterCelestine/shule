import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { isKindergarten, reportsFor } from '../../core/report-cards';
import { StudentsStore } from '../../core/students.store';
import { DownloadService } from '../../core/download.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-reports',
  imports: [StatCards],
  templateUrl: './reports.html',
})
export class ReportsPage {
  private students = inject(StudentsStore);
  private download = inject(DownloadService);
  private router = inject(Router);

  protected readonly cards = computed(() => reportsFor(this.students.students()));
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
