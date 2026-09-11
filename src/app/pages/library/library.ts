import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { paginate } from '../../core/page';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-library',
  imports: [StatCards, Pager],
  templateUrl: './library.html',
})
export class LibraryPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);

  protected readonly page = signal(1);
  protected readonly loans = signal([
    { book: 'A Grain of Wheat', borrower: 'Nakiwala F.', due: '14 Sep', late: false },
    { book: 'MK Primary Science 5', borrower: 'Nakiwala Faith', due: 'Overdue 3 days', late: true },
    { book: 'Things Fall Apart', borrower: 'Okello D.', due: '18 Sep', late: false },
  ]);
  protected readonly paged = computed(() => paginate(this.loans(), this.page()));
  protected readonly stats = computed(() => [
    { label: 'Titles', value: '620', change: 'Picture books to P7', bars: [6, 7, 7, 8, 8, 9, 10] },
    { label: 'Active loans', value: String(this.loans().length), change: this.loans().filter((l) => l.late).length + ' overdue', bars: [4, 5, 5, 6, 5, 6, 6] },
    { label: 'Assets', value: '18', change: 'Classroom kit', bars: [5, 5, 6, 6, 6, 7, 7] },
    { label: 'Loans out', value: '48', change: 'This term', bars: [7, 6, 7, 8, 7, 8, 9] },
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
