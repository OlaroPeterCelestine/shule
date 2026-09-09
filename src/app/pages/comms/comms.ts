import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { ReportService } from '../../core/report.service';
import { DownloadService } from '../../core/download.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-comms',
  imports: [FormsModule],
  templateUrl: './comms.html',
})
export class CommsPage {
  protected toast = inject(ToastService);
  protected modal = inject(ModalService);
  protected report = inject(ReportService);
  protected download = inject(DownloadService);
  protected router = inject(Router);
  protected auth = inject(AuthService);

  protected msg = '';
  protected audience = 'All parents';
  protected channel = 'SMS';
  protected readonly campaigns = signal([
    { title: 'Fee reminder — S5 Arts', meta: 'Sent to 58 · Delivered 56' },
    { title: 'Mid-term reports released', meta: 'Sent to 1,284 · Delivered 1,271' },
    { title: 'Sports day — transport update', meta: 'Sent to 312 · Delivered 308' },
  ]);

  sendCampaign() {
    const text = this.msg.trim();
    if (!text) { this.toast.show('Write a message before sending'); return; }
    const title = text.slice(0, 40) + (text.length > 40 ? '…' : '');
    this.campaigns.update((list) => [
      { title, meta: 'Sent to ' + this.audience + ' via ' + this.channel + ' · Just now' },
      ...list,
    ]);
    this.msg = '';
    this.toast.show('Campaign sent to ' + this.audience);
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
