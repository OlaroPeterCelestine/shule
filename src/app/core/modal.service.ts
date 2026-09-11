import { Injectable, signal } from '@angular/core';
import type { ModalOptions } from './models';

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly options = signal<ModalOptions | null>(null);
  readonly values = signal<Record<string, string>>({});
  readonly file = signal<File | undefined>(undefined);
  readonly invalid = signal<Record<string, boolean>>({});
  readonly busy = signal(false);

  open(options: ModalOptions) {
    const initial: Record<string, string> = {};
    if (options.select) initial[options.select.key] = options.select.options[0];
    this.values.set(initial);
    this.file.set(undefined);
    this.invalid.set({});
    this.busy.set(false);
    this.options.set(options);
  }

  close() {
    this.busy.set(false);
    this.options.set(null);
  }

  setValue(key: string, value: string) {
    this.values.update((v) => ({ ...v, [key]: value }));
  }

  async confirm() {
    const opts = this.options();
    if (!opts || this.busy()) return;
    const invalid: Record<string, boolean> = {};
    for (const field of opts.fields ?? []) {
      if (field.required && !(this.values()[field.key] ?? '').trim()) invalid[field.key] = true;
    }
    this.invalid.set(invalid);
    if (Object.keys(invalid).length) return;
    const payload: Record<string, string | File | undefined> = { ...this.values() };
    if (opts.file) payload[opts.file.key] = this.file();
    this.busy.set(true);
    try {
      const ok = await opts.onConfirm(payload);
      if (ok !== false) this.close();
    } finally {
      this.busy.set(false);
    }
  }
}
