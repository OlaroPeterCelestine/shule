import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { DownloadService } from '../../core/download.service';
import { StudentsStore } from '../../core/students.store';
import { SchoolOsStore } from '../../core/school-os.store';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-system',
  imports: [StatCards],
  templateUrl: './system.html',
})
export class SystemPage {
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  private download = inject(DownloadService);
  private students = inject(StudentsStore);
  protected os = inject(SchoolOsStore);

  protected readonly stats = [
    { label: 'Users', value: '142', change: 'Staff & parents', bars: [6, 7, 7, 8, 8, 9, 9] },
    { label: 'Roles', value: '12', change: 'Fine-grained RBAC', bars: [4, 4, 5, 5, 6, 6, 7] },
    { label: 'Audit events', value: '4', change: 'Shown on this page', bars: [3, 4, 3, 5, 4, 5, 4] },
    { label: 'Last backup', value: '04:00', change: 'Nightly job', bars: [8, 8, 9, 8, 9, 9, 10] },
  ];

  toggle(role: string, module: string, key: 'view' | 'create' | 'edit' | 'approve') {
    this.os.togglePerm(role, module, key);
    this.toast.show(role + ' · ' + module + ' · ' + key + ' updated');
  }

  runBackup() {
    this.toast.show('Backup started — you will be notified when complete');
  }

  importData() {
    this.modal.open({
      title: 'Import data',
      message: '<p class="mb-3 text-slate2/70">Choose what to import, then select a CSV file.</p>',
      select: { key: 'type', options: ['Students', 'Marks', 'Fees', 'Attendance'] },
      file: { key: 'file', accept: '.csv,text/csv' },
      confirmLabel: 'Import',
      onConfirm: (v) => {
        const file = v['file'] as File | undefined;
        if (!file) {
          this.toast.show('Choose a CSV file to import');
          return false;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const lines = String(reader.result).split(/\r?\n/).filter((l) => l.trim().length);
          const records = Math.max(0, lines.length - 1);
          this.toast.show('Imported ' + records + ' ' + String(v['type']).toLowerCase() + ' record' + (records === 1 ? '' : 's') + ' from ' + file.name);
        };
        reader.onerror = () => this.toast.show('Could not read that file');
        reader.readAsText(file);
        return true;
      },
    });
  }

  exportData() {
    const rows: string[][] = [['Admission No.', 'Name', 'Class', 'Guardian', 'Attendance', 'Fee status']];
    for (const s of this.students.students()) {
      rows.push([s.adm, s.name, s.cls, s.guardian, s.attendance, s.feeLabel]);
    }
    this.download.csv('students-export.csv', rows);
  }
}
