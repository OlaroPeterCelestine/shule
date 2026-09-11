import { Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfViewerService } from '../core/pdf-viewer.service';

@Component({
  selector: 'app-pdf-viewer',
  template: `
    @if (pdf.visible()) {
      <div class="fixed inset-0 z-[70] bg-slate-900/50 flex items-center justify-center p-4" (click)="onOverlay($event)">
        <div class="bg-white rounded-2xl shadow-2xl w-[860px] max-w-[96vw] h-[88vh] flex flex-col overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 class="font-semibold text-slate-900">{{ pdf.title() }}</h3>
            <button type="button" (click)="pdf.close()" class="text-slate-400 hover:text-slate-800" aria-label="Close">
              <svg class="ic-lg"><use href="#i-x"/></svg>
            </button>
          </div>
          @if (safeUrl(); as url) {
            <iframe [src]="url" title="PDF preview" class="flex-1 w-full bg-slate-100"></iframe>
          }
          <div class="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
            <button type="button" (click)="pdf.close()" class="text-sm border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-50">Close</button>
            <a [href]="pdf.url()" [download]="pdf.filename()" class="text-sm bg-slate-900 text-white rounded-full px-5 py-2 hover:bg-slate-800">Download PDF</a>
          </div>
        </div>
      </div>
    }
  `,
})
export class PdfViewer {
  protected pdf = inject(PdfViewerService);
  private sanitizer = inject(DomSanitizer);
  protected readonly safeUrl = computed(() => {
    const url = this.pdf.url();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  onOverlay(ev: Event) {
    if (ev.target === ev.currentTarget) this.pdf.close();
  }
}
