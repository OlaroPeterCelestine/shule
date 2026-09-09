import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-academics',
  templateUrl: './academics.html',
})
export class AcademicsPage {
  private toast = inject(ToastService);
  protected readonly clash = signal(true);

  resolveClash() {
    this.clash.set(false);
    this.toast.show('Reschedule request sent for S4 Biology practical');
  }
}
