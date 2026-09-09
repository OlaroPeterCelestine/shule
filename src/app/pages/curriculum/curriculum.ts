import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-curriculum',
  imports: [],
  templateUrl: './curriculum.html',
})
export class CurriculumPage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  newLesson() {
    this.modal.open({
      title: 'New lesson plan',
      fields: [
        { key: 'topic', placeholder: 'Topic (e.g. Cell division — Topic 5.1) *', required: true },
        { key: 'cls', placeholder: 'Class & subject (e.g. S3 Biology) *', required: true },
      ],
      onConfirm: (v) => {
        const list = document.getElementById('lessonPlanList');
        if (list) {
          const li = document.createElement('li');
          li.className = 'py-2.5';
          li.innerHTML = '<p class="text-ink font-medium">' + v['topic'] + '</p><p class="text-xs text-slate2/50 mt-0.5">' + v['cls'] + ' · Draft</p>';
          list.prepend(li);
        }
        this.toast.show('Lesson plan saved as draft');
        return true;
      },
    });
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
