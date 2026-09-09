import { Component, input } from '@angular/core';

export interface StatCard {
  label: string;
  value: string;
  change: string;
  bars?: number[];
}

@Component({
  selector: 'app-stat-cards',
  template: `
    <div class="stat-grid grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
      @for (k of items(); track k.label) {
        <div class="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
          <div class="flex items-center justify-between">
            <p class="text-[13px] text-slate-500">{{ k.label }}</p>
            <svg class="ic text-slate-300"><use href="#i-info"/></svg>
          </div>
          <div class="flex items-end justify-between mt-3">
            <p class="text-[20px] sm:text-[26px] font-semibold tracking-tight text-slate-900 leading-none">{{ k.value }}</p>
            <div class="flex items-end gap-[3px] h-8">
              @for (b of (k.bars ?? [4,6,5,7,6,8,9]); track $index) {
                <span class="w-1.5 rounded-sm bg-slate-200" [style.height.px]="b * 3"></span>
              }
            </div>
          </div>
          <p class="text-[11px] text-emerald-600 mt-3">{{ k.change }}</p>
        </div>
      }
    </div>
  `,
})
export class StatCards {
  readonly items = input.required<StatCard[]>();
}
