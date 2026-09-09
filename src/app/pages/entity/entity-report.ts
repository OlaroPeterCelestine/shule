import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DownloadService } from '../../core/download.service';
import { RecordsStore } from '../../core/records.store';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-entity-report',
  imports: [RouterLink, StatCards],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <p class="text-xs text-slate-400">
          <a [routerLink]="'/' + key()" class="hover:text-slate-700">{{ def().title }}</a>
          <span class="mx-1">›</span> Report
        </p>
        <h1 class="text-[22px] sm:text-[28px] font-semibold tracking-tight text-slate-900 mt-1">{{ def().title }} report</h1>
        <p class="text-sm text-slate-400 mt-1">{{ def().subtitle }} · Term 2, 2026 · generated 9 Sep 2026</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a [routerLink]="'/' + key()" class="h-10 px-4 text-sm border border-slate-200 bg-white rounded-full inline-flex items-center">Back to list</a>
        <button type="button" (click)="downloadCsv()" class="h-10 px-4 text-sm border border-slate-200 bg-white rounded-full">Download CSV</button>
        <button type="button" (click)="print()" class="h-10 px-4 text-sm bg-slate-900 text-white rounded-full">Print report</button>
      </div>
    </div>

    <app-stat-cards [items]="stats()" />

    <div id="module-report" class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div class="px-4 py-4 border-b border-slate-50 flex items-center justify-between">
        <div>
          <p class="text-[15px] font-semibold text-slate-900">Little Royals Kindergarten & Primary School</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ def().title }} · {{ rows().length }} records</p>
        </div>
        <p class="text-xs text-slate-400">In God We Trust</p>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-xs text-slate-400">
          <tr class="text-left">
            @for (c of def().columns; track c.key) {
              <th class="px-4 py-3 font-medium">{{ c.label }}</th>
            }
            <th class="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          @for (row of rows(); track row.id) {
            <tr class="hover:bg-slate-50 cursor-pointer" (click)="open(row.id)">
              @for (c of def().columns; track c.key) {
                <td class="px-4 py-3 text-slate-700">{{ row.cells[c.key] || row.status }}</td>
              }
              <td class="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">Open</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class EntityReportPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private records = inject(RecordsStore);
  private download = inject(DownloadService);
  private data = toSignal(this.route.data, { requireSync: true });

  protected readonly key = computed(() => (this.data()?.['module'] as string) || 'dashboard');
  protected readonly def = computed(() => this.records.def(this.key()));
  protected readonly rows = computed(() => this.records.rows(this.key()));

  protected readonly stats = computed(() => {
    const rows = this.rows();
    const statuses = new Set(rows.map((r) => r.status));
    return [
      { label: 'Records', value: String(rows.length), change: 'In this report', bars: [4, 5, 6, 7, 8, 8, 9] },
      { label: 'Statuses', value: String(statuses.size), change: 'Distinct', bars: [3, 4, 4, 5, 6, 5, 6] },
      { label: 'Module', value: this.def().singular, change: this.def().title, bars: [5, 6, 7, 6, 8, 7, 9] },
      { label: 'Period', value: 'Term 2', change: '2026 · Week 8', bars: [6, 6, 7, 7, 8, 8, 9] },
    ];
  });

  open(id: string) {
    this.router.navigate(['/', this.key(), id]);
  }

  downloadCsv() {
    const def = this.def();
    const header = def.columns.map((c) => c.label);
    const body = this.rows().map((row) => def.columns.map((c) => row.cells[c.key] || row.status));
    this.download.csv(this.key() + '-report-term2-2026.csv', [header, ...body]);
  }

  print() {
    window.print();
  }
}
