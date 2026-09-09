import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast.service';
import { DownloadService } from '../../core/download.service';

@Component({
  selector: 'app-ai',
  imports: [FormsModule],
  templateUrl: './ai.html',
})
export class AiPage {
  private toast = inject(ToastService);
  private download = inject(DownloadService);

  protected readonly prompt = signal('');
  protected readonly answer = signal('');

  ask() {
    const q = this.prompt().trim();
    if (!q) {
      this.toast.show('Type a question for the assistant first');
      return;
    }
    this.answer.set(
      'Draft for: "' + q + '"\n\nObjective: address the request above.\nKey points:\n1. Frame the objective clearly for the class/topic.\n2. Outline 2-3 supporting points or activities.\n3. Include a short check for understanding.\n\nThis is a starting draft — review and edit before sharing with students or including in a report.',
    );
    this.toast.show('Draft ready — review below');
  }

  downloadDraft() {
    if (this.answer()) this.download.text('ai-draft.txt', this.answer());
  }
}
