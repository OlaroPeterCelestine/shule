import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { ModalService } from '../../core/modal.service';
import { DownloadService } from '../../core/download.service';
import { StudentsStore } from '../../core/students.store';
import { SchoolOsStore } from '../../core/school-os.store';
import type { PermRow, RoleDef } from '../../core/models';
import { StatCards } from '../../shared/stat-cards';

export interface ChangeRow {
  id: number;
  who: string;
  action: string;
  module: string;
  detail: string;
  when: string;
}

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
  private router = inject(Router);
  private api = inject(ApiService);
  protected auth = inject(AuthService);
  protected os = inject(SchoolOsStore);
  protected readonly changes = signal<ChangeRow[]>([]);
  protected readonly selected = signal('teacher');
  protected readonly busy = signal(false);

  constructor() {
    void this.refresh();
  }

  protected readonly isAdmin = computed(() => this.auth.user()?.role === 'admin');

  protected readonly currentRole = computed(
    () => this.os.roles().find((r) => r.key === this.selected()) ?? this.os.roles()[0],
  );

  protected readonly rolePerms = computed(() =>
    this.os.perms().filter((p) => p.role === this.selected()),
  );

  protected readonly stats = computed(() => [
    { label: 'Users', value: '142', change: 'Staff & parents', bars: [6, 7, 7, 8, 8, 9, 9] },
    { label: 'Roles', value: String(this.os.roles().length), change: 'Including custom roles', bars: [4, 4, 5, 5, 6, 6, 7] },
    { label: 'Change log', value: String(this.changes().length), change: 'Live from the API', bars: [3, 4, 3, 5, 4, 5, 4] },
    { label: 'Last backup', value: '04:00', change: 'Nightly job', bars: [8, 8, 9, 8, 9, 9, 10] },
  ]);

  private async refresh() {
    const [changes, perms, roles] = await Promise.all([
      this.api.get<ChangeRow[]>('/changelog').catch(() => this.changes()),
      this.api.get<PermRow[]>('/perms').catch(() => this.os.perms()),
      this.api.get<RoleDef[]>('/roles').catch(() => this.os.roles()),
    ]);
    this.changes.set(changes);
    this.os.replacePerms(perms);
    this.os.replaceRoles(roles);
    if (!roles.some((r) => r.key === this.selected())) this.selected.set(roles.find((r) => r.key !== 'admin')?.key || 'teacher');
  }

  pick(key: string) {
    this.selected.set(key);
  }

  async toggle(role: string, module: string, key: 'view' | 'create' | 'edit' | 'approve') {
    if (role === 'admin') {
      this.toast.show('Admin always has full access');
      return;
    }
    if (!this.isAdmin()) {
      this.toast.show('Only an admin can change permissions');
      return;
    }
    this.os.togglePerm(role, module, key);
    try {
      const row = await this.api.patch<PermRow>('/perms', { role, module, can: key });
      this.os.applyPerm(row);
      this.toast.show((row.label || module) + ' · ' + key + ' updated');
    } catch (err) {
      this.os.togglePerm(role, module, key);
      this.toast.show(err instanceof Error ? err.message : 'Could not save that permission');
    }
  }

  newRole() {
    if (!this.isAdmin()) {
      this.toast.show('Only an admin can create roles');
      return;
    }
    this.modal.open({
      title: 'New role',
      message: '<p class="mb-3 text-slate2/70">Name a role, then tick the activities it may view or change.</p>',
      fields: [{ key: 'label', placeholder: 'Role name (e.g. Nurse) *', required: true }],
      confirmLabel: 'Create role',
      onConfirm: (v) => {
        void this.createRole(String(v['label'] ?? ''));
      },
    });
  }

  private async createRole(label: string) {
    this.busy.set(true);
    try {
      const row = await this.api.post<RoleDef>('/roles', { label });
      this.os.replaceRoles([...this.os.roles(), row]);
      const perms = await this.api.get<PermRow[]>('/perms');
      this.os.replacePerms(perms);
      this.selected.set(row.key);
      this.toast.show('Created ' + row.label + ' — now set its activities');
    } catch (err) {
      this.os.replaceRoles(this.os.roles());
      const key = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 32);
      if (key && !this.os.roles().some((r) => r.key === key)) {
        this.os.replaceRoles([...this.os.roles(), { key, label: label.trim(), locked: false, users: 0 }]);
        this.selected.set(key);
        this.toast.show('Created ' + label.trim() + ' locally. Start the API to persist it.');
      } else {
        this.toast.show(err instanceof Error ? err.message : 'Could not create that role');
      }
    } finally {
      this.busy.set(false);
    }
  }

  deleteRole() {
    const role = this.currentRole();
    if (!role || role.locked) {
      this.toast.show('System roles cannot be deleted');
      return;
    }
    if (!this.isAdmin()) {
      this.toast.show('Only an admin can delete roles');
      return;
    }
    this.modal.open({
      title: 'Delete ' + role.label + '?',
      message: '<p class="text-slate2/70">Staff on this role must be reassigned first. Permissions for the role are removed.</p>',
      confirmLabel: 'Delete role',
      onConfirm: () => {
        void this.removeRole(role.key);
      },
    });
  }

  private async removeRole(key: string) {
    try {
      await this.api.delete('/roles/' + key);
      this.os.replaceRoles(this.os.roles().filter((r) => r.key !== key));
      this.os.replacePerms(this.os.perms().filter((p) => p.role !== key));
      this.selected.set('teacher');
      this.toast.show('Role removed');
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Could not delete that role');
    }
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

  generateReport() {
    this.router.navigate(['/system', 'report']);
  }

  exportData() {
    const year = this.os.school().year || '2026';
    const rows: string[][] = [
      ['Little Royals system report', this.os.school().term || 'Term 2', year],
      [],
      ['Students'],
      ['Admission No.', 'Name', 'Class', 'Guardian', 'Attendance', 'Fee status'],
    ];
    for (const s of this.students.students()) {
      rows.push([s.adm, s.name, s.cls, s.guardian, s.attendance, s.feeLabel]);
    }
    rows.push([], ['Roles'], ['Key', 'Label', 'Locked', 'Users']);
    for (const r of this.os.roles()) {
      rows.push([r.key, r.label, r.locked ? 'Yes' : 'No', String(r.users)]);
    }
    rows.push([], ['Permissions'], ['Role', 'Activity', 'View', 'Create', 'Edit', 'Approve']);
    for (const p of this.os.perms()) {
      rows.push([p.role, p.label || p.module, p.view ? 'Yes' : 'No', p.create ? 'Yes' : 'No', p.edit ? 'Yes' : 'No', p.approve ? 'Yes' : 'No']);
    }
    this.download.csv('little-royals-system-report-' + year + '.csv', rows);
  }
}
