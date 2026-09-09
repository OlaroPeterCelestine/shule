import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-comms',
  imports: [FormsModule],
  templateUrl: './comms.html',
})
export class CommsPage {
  private toast = inject(ToastService);

  protected readonly msg = signal('');
  protected readonly audience = signal('All parents');
  protected readonly channel = signal('SMS');
  protected readonly campaigns = signal([
    { title: 'Fee reminder — S5 Arts', meta: 'Sent to 58 · Delivered 56' },
    { title: 'Mid-term reports released', meta: 'Sent to 1,284 · Delivered 1,271' },
    { title: 'Sports day — transport update', meta: 'Sent to 312 · Delivered 308' },
  ]);

  sendCampaign() {
    const text = this.msg().trim();
    if (!text) {
      this.toast.show('Write a message before sending');
      return;
    }
    const title = text.slice(0, 40) + (text.length > 40 ? '…' : '');
    this.campaigns.update((list) => [
      { title, meta: 'Sent to ' + this.audience() + ' via ' + this.channel() + ' · Just now' },
      ...list,
    ]);
    this.msg.set('');
    this.toast.show('Campaign sent to ' + this.audience());
  }
}
