import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.html',
})
export class LibraryPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly loans = signal([
    { book: 'A Grain of Wheat', borrower: 'Nakiwala F.', due: '14 Sep', late: false },
    { book: 'Advanced Physics Vol. 2', borrower: 'Byaruhanga T.', due: 'Overdue 3 days', late: true },
    { book: 'Things Fall Apart', borrower: 'Okello D.', due: '18 Sep', late: false },
  ]);

  checkout() {
    this.modal.open({
      title: 'Check out book',
      fields: [
        { key: 'book', placeholder: 'Book title *', required: true },
        { key: 'borrower', placeholder: 'Borrower name *', required: true },
        { key: 'due', placeholder: 'Due date (e.g. 20 Sep)' },
      ],
      onConfirm: (v) => {
        this.loans.update((list) => [
          { book: String(v['book']), borrower: String(v['borrower']), due: String(v['due'] || '20 Sep'), late: false },
          ...list,
        ]);
        this.toast.show(v['book'] + ' checked out to ' + v['borrower']);
      },
    });
  }
}
