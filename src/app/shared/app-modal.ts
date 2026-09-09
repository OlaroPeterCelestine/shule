import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../core/modal.service';

@Component({
  selector: 'app-modal',
  imports: [FormsModule],
  template: `
    @if (modal.options(); as opts) {
      <div class="modal-overlay open fixed inset-0 z-50 items-center justify-center bg-ink/40" (click)="onOverlay($event)">
        <div class="bg-white rounded-2xl shadow-2xl w-[440px] max-w-[90vw]">
          <div class="px-5 py-4 border-b border-line flex items-center justify-between">
            <h3 class="font-display text-lg text-ink">{{ opts.title }}</h3>
            <button type="button" (click)="modal.close()" class="text-slate2/50 hover:text-ink"><svg class="ic-lg"><use href="#i-x"/></svg></button>
          </div>
          <form (ngSubmit)="$event.preventDefault(); modal.confirm()">
          <div class="px-5 py-4 text-sm space-y-3">
            @if (opts.message) {
              <div [innerHTML]="opts.message"></div>
            }
            @for (field of opts.fields ?? []; track field.key) {
              <input
                class="w-full border border-line rounded-sm px-3 py-2"
                [class.border-maroon]="modal.invalid()[field.key]"
                [placeholder]="field.placeholder"
                [type]="field.type || 'text'"
                [name]="field.key"
                [ngModel]="modal.values()[field.key] || ''"
                (ngModelChange)="modal.setValue(field.key, $event)"
              />
            }
            @if (opts.select; as sel) {
              <select class="w-full border border-line rounded-sm px-3 py-2"
                [name]="sel.key"
                [ngModel]="modal.values()[sel.key] || sel.options[0]"
                (ngModelChange)="modal.setValue(sel.key, $event)">
                @for (opt of sel.options; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
            }
            @if (opts.file; as file) {
              <input type="file" [name]="file.key" [accept]="file.accept" class="w-full text-xs border border-line rounded-sm px-3 py-2" (change)="onFile($event)" />
            }
            @if (opts.fields?.length) {
              <p class="text-xs text-slate2/40">* Required</p>
            }
          </div>
          <div class="px-5 py-4 border-t border-line flex justify-end gap-2">
            <button type="button" (click)="modal.close()" class="text-sm border border-line rounded-sm px-4 py-2 hover:bg-canvas">Cancel</button>
            <button type="submit" class="text-sm bg-ink text-white rounded-sm px-4 py-2 hover:bg-inkdeep">{{ opts.confirmLabel || 'Confirm' }}</button>
          </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class AppModal {
  protected modal = inject(ModalService);

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.modal.options()) this.modal.close();
  }

  onOverlay(ev: Event) {
    if (ev.target === ev.currentTarget) this.modal.close();
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.modal.file.set(input.files?.[0]);
  }
}
