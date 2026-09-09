import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportService {
  readonly title = signal('');
  readonly html = signal('');
  readonly visible = signal(false);

  open(title: string, html: string) {
    this.title.set(title);
    this.html.set(html);
    this.visible.set(true);
  }

  close() { this.visible.set(false); }
}
