import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PdfViewerService {
  readonly title = signal('');
  readonly url = signal('');
  readonly visible = signal(false);
  readonly filename = signal('document.pdf');

  constructor(private api: ApiService) {}

  async open(title: string, path: string) {
    const blob = await this.api.blob(path);
    this.close();
    const url = URL.createObjectURL(blob);
    this.title.set(title);
    this.filename.set(path.split('/').pop()?.replace(/\?.*$/, '') || 'document.pdf');
    this.url.set(url);
    this.visible.set(true);
  }

  close() {
    const current = this.url();
    if (current) URL.revokeObjectURL(current);
    this.url.set('');
    this.visible.set(false);
  }
}
