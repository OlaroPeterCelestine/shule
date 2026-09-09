import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-ai',
  imports: [FormsModule],
  templateUrl: './ai.html',
})
export class AiPage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  protected readonly prompt = signal('');
  protected readonly answer = signal('');

  ask() {
    const q = this.prompt().trim();
    if (!q) { this.toast.show('Type a question for the assistant first'); return; }
    const draft = 'Draft for: "' + q + '"\n\nObjective: address the request above.\nKey points:\n1. Frame the objective clearly for the class/topic.\n2. Outline 2-3 supporting points or activities.\n3. Include a short check for understanding.\n\nThis is a starting draft — review and edit before sharing with students or including in a report.';
    this.answer.set(draft);
    this.toast.show('Draft ready — review below');
  }

  downloadDraft() {
    if (this.answer()) this.download.text('ai-draft.txt', this.answer());
  }

  go(path: string) { this.router.navigate(['/', path]); }

  fade(ev: Event, msg: string) {
    this.toast.show(msg);
    const row = (ev.target as HTMLElement).closest('.btn-fade, .leave-item');
    if (!row) return;
    row.classList.add('gone');
    setTimeout(() => {
      row.remove();
      const el = document.getElementById('leaveCount');
      if (el) el.textContent = String(document.querySelectorAll('#leaveList .leave-item').length);
    }, 320);
  }
}
