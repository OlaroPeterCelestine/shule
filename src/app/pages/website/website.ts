import { Component, computed, inject } from '@angular/core';
import { SchoolOsStore } from '../../core/school-os.store';
import { ModalService } from '../../core/modal.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-website',
  imports: [StatCards],
  templateUrl: './website.html',
})
export class WebsitePage {
  protected os = inject(SchoolOsStore);
  private modal = inject(ModalService);
  private toast = inject(ToastService);

  protected readonly stats = computed(() => [
    { label: 'Pages', value: String(this.os.cms().length), change: 'School website', bars: [3, 4, 4, 5, 5, 6, 6] },
    { label: 'Published', value: String(this.os.cms().filter((p) => p.status === 'Published').length), change: 'Live now', bars: [5, 5, 6, 6, 7, 7, 8] },
    { label: 'Drafts', value: String(this.os.cms().filter((p) => p.status === 'Draft').length), change: 'Awaiting review', bars: [2, 2, 3, 2, 3, 3, 2] },
    { label: 'Apply online', value: 'On', change: 'Admissions form', bars: [4, 5, 5, 6, 6, 7, 7] },
  ]);

  addPage() {
    this.modal.open({
      title: 'New website page',
      fields: [{ key: 'title', placeholder: 'Page title *', required: true }],
      onConfirm: (v) => {
        this.os.addCms(String(v['title']));
        this.toast.show('Draft created — ' + v['title']);
      },
    });
  }

  publish(id: number, title: string) {
    this.os.publishCms(id);
    this.toast.show(title + ' is now live');
  }
}
