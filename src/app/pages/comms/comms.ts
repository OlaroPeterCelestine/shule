import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-comms',
  imports: [FormsModule, StatCards],
  templateUrl: './comms.html',
})
export class CommsPage {
  private toast = inject(ToastService);

  protected readonly msg = signal('');
  protected readonly audience = signal('All parents');
  protected readonly channel = signal('SMS');
  protected readonly campaigns = signal([
    { title: 'Fee reminder — Primary Seven', meta: 'Sent to 28 · Delivered 27' },
    { title: 'Mid-term reports released', meta: 'Sent to 186 · Delivered 181' },
    { title: 'Sports day — van update', meta: 'Sent to 62 · Delivered 60' },
  ]);
  protected readonly stats = computed(() => [
    { label: 'Campaigns', value: String(this.campaigns().length), change: 'This term', bars: [3, 4, 4, 5, 5, 6, 6] },
    { label: 'SMS sent', value: '412', change: 'Delivered 98%', bars: [6, 7, 7, 8, 8, 9, 10] },
    { label: 'Email', value: '186', change: 'Report cards', bars: [5, 5, 6, 7, 6, 8, 8] },
    { label: 'Push', value: '62', change: 'Van parents', bars: [2, 3, 3, 4, 4, 5, 4] },
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
