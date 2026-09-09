import { Injectable, signal } from '@angular/core';
import type { Student } from './models';

@Injectable({ providedIn: 'root' })
export class StudentsStore {
  readonly students = signal<Student[]>([
    { adm: 'LR-2291', name: 'Nakiwala Faith', cls: 'S4 East', guardian: 'R. Nakiwala', attendance: '96%', fee: 'cleared', feeLabel: 'Cleared' },
    { adm: 'LR-1187', name: 'Namutebi Racheal', cls: 'S5 Arts', guardian: 'J. Namutebi', attendance: '88%', fee: 'due', feeLabel: '620,000 due' },
    { adm: 'LR-0894', name: 'Okello Derrick', cls: 'S2 East', guardian: 'P. Okello', attendance: '91%', fee: 'due', feeLabel: '540,000 due' },
    { adm: 'LR-2456', name: 'Achieng Patricia', cls: 'P7 Blue', guardian: 'S. Achieng', attendance: '99%', fee: 'due', feeLabel: '480,000 due' },
  ]);

  add(student: Student) {
    this.students.update((list) => [student, ...list]);
  }
}
