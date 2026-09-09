import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="fixed bottom-6 right-6 z-[60] space-y-2">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast bg-ink text-white text-sm px-4 py-3 rounded-sm shadow-lg flex items-center gap-2">
          <svg class="ic text-gold"><use href="#i-check"/></svg>
          <span>{{ t.message }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected toast = inject(ToastService);
}
