import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast.service';
import { DownloadService } from '../../core/download.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-ai',
  imports: [FormsModule, StatCards],
  templateUrl: './ai.html',
})
export class AiPage {
  private toast = inject(ToastService);
  private download = inject(DownloadService);

  protected readonly prompt = signal('');
  protected readonly answer = signal('');
  protected readonly drafts = signal(0);
  protected readonly stats = computed(() => [
    { label: 'Drafts this session', value: String(this.drafts()), change: this.answer() ? 'Latest ready below' : 'Ask to generate', bars: [2, 3, 3, 4, 4, 5, 5] },
    { label: 'Lesson plans', value: '12', change: 'Saved this term', bars: [3, 4, 4, 5, 6, 6, 7] },
    { label: 'Test sets', value: '8', change: 'Reviewed by teachers', bars: [2, 3, 3, 4, 4, 5, 4] },
    { label: 'Summaries', value: '5', change: 'For management', bars: [1, 2, 2, 3, 3, 4, 4] },
  ]);

  ask() {
    const q = this.prompt().trim();
    if (!q) {
      this.toast.show('Type a question for the assistant first');
      return;
    }
    this.answer.set(
      'Draft for: "' + q + '"\n\nObjective: address the request above.\nKey points:\n1. Frame the objective clearly for the class/topic.\n2. Outline 2-3 supporting points or activities.\n3. Include a short check for understanding.\n\nThis is a starting draft — review and edit before sharing with students or including in a report.',
    );
    this.drafts.update((n) => n + 1);
    this.toast.show('Draft ready — review below');
  }

  downloadDraft() {
    if (this.answer()) this.download.text('ai-draft.txt', this.answer());
  }
}
