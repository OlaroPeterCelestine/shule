import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecordsStore } from '../core/records.store';

@Component({
  selector: 'app-records-block',
  imports: [FormsModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-50">
        <div>
          <h3 class="text-[15px] font-semibold text-slate-900">{{ def().title }} directory</h3>
          <p class="text-xs text-slate-400 mt-0.5">{{ filtered().length }} records · open a row for the full page</p>
        </div>
        <input
          [ngModel]="q()"
          (ngModelChange)="q.set($event)"
          name="recordsSearch"
          class="border border-slate-200 rounded-full px-3 py-1.5 text-sm w-full sm:w-56 bg-white"
          placeholder="Filter records…" />
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
          @for (row of filtered(); track row.id) {
            <tr class="hover:bg-slate-50 cursor-pointer" (click)="open(row.id)">
              @for (c of def().columns; track c.key) {
                <td class="px-4 py-3 text-slate-700" [class.font-medium]="c.key === def().columns[0].key" [class.text-slate-900]="c.key === def().columns[0].key">
                  {{ row.cells[c.key] || row.status }}
                </td>
              }
              <td class="px-4 py-3 text-slate-700 text-xs whitespace-nowrap">View <svg class="ic w-3.5 h-3.5 inline"><use href="#i-arrow-right"/></svg></td>
            </tr>
          }
        </tbody>
      </table>
      @if (filtered().length === 0) {
        <p class="text-sm text-slate-400 text-center py-8">No records match that filter.</p>
      }
    </div>
  `,
})
export class RecordsBlock {
  private records = inject(RecordsStore);
  private router = inject(Router);

  readonly moduleKey = input.required<string>();
  protected readonly q = signal('');

  protected readonly def = computed(() => this.records.def(this.moduleKey()));
  protected readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.records.rows(this.moduleKey()).filter((row) => {
      if (!q) return true;
      const blob = [row.title, row.subtitle, row.status, ...Object.values(row.cells)].join(' ').toLowerCase();
      return blob.includes(q);
    });
  });

  open(id: string) {
    this.router.navigate(['/', this.moduleKey(), id]);
  }
}
