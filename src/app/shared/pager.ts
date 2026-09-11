import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pager',
  template: `
    @if (total() > size()) {
      <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-slate-500">
        <p>{{ from() }}–{{ to() }} of {{ total() }}</p>
        <div class="flex items-center gap-1">
          <button type="button" class="h-8 px-3 rounded-full border border-slate-200 bg-white disabled:opacity-40" [disabled]="page() <= 1" (click)="pageChange.emit(page() - 1)">Prev</button>
          <span class="px-2">{{ page() }} / {{ pages() }}</span>
          <button type="button" class="h-8 px-3 rounded-full border border-slate-200 bg-white disabled:opacity-40" [disabled]="page() >= pages()" (click)="pageChange.emit(page() + 1)">Next</button>
        </div>
      </div>
    }
  `,
})
export class Pager {
  readonly total = input(0);
  readonly page = input(1);
  readonly size = input(8);
  readonly pageChange = output<number>();

  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.size()) || 1));
  protected readonly from = computed(() => (this.total() ? (this.page() - 1) * this.size() + 1 : 0));
  protected readonly to = computed(() => Math.min(this.page() * this.size(), this.total()));
}
