import { Component, inject } from '@angular/core';
import { ReportService } from '../core/report.service';

@Component({
  selector: 'app-report-modal',
  template: `
    @if (report.visible()) {
      <div class="modal-overlay open fixed inset-0 z-50 items-center justify-center bg-ink/50" id="reportOverlay" (click)="onOverlay($event)">
        <div class="bg-white rounded-sm shadow-2xl w-[640px] max-w-[92vw] max-h-[88vh] flex flex-col">
          <div class="px-5 py-4 border-b border-line flex items-center justify-between no-print">
            <h3 class="font-display text-lg text-ink">{{ report.title() }}</h3>
            <button type="button" (click)="report.close()" class="text-slate2/50 hover:text-ink"><svg class="ic-lg"><use href="#i-x"/></svg></button>
          </div>
          <div class="px-6 py-6 text-sm overflow-y-auto flex-1" [innerHTML]="report.html()"></div>
          <div class="px-5 py-4 border-t border-line flex justify-end gap-2 no-print">
            <button type="button" (click)="report.close()" class="text-sm border border-line rounded-sm px-4 py-2 hover:bg-canvas">Close</button>
            <button type="button" (click)="print()" class="text-sm bg-ink text-white rounded-sm px-4 py-2 hover:bg-inkdeep flex items-center gap-1.5">
              <svg class="ic text-white w-3.5 h-3.5"><use href="#i-file"/></svg> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ReportModal {
  protected report = inject(ReportService);

  onOverlay(ev: Event) {
    if (ev.target === ev.currentTarget) this.report.close();
  }

  print() { window.print(); }
}
