import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecordsStore } from '../../core/records.store';
import { StudentsStore } from '../../core/students.store';
import { SchoolOsStore } from '../../core/school-os.store';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-entity-detail',
  imports: [RouterLink, StatCards],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <p class="text-xs text-slate-400">
          <a [routerLink]="'/' + key()" class="hover:text-slate-700">{{ def().title }}</a>
          <span class="mx-1">›</span> Detail
        </p>
        <h1 class="text-[22px] sm:text-[28px] font-semibold tracking-tight text-slate-900 mt-1">{{ row()?.title || 'Record not found' }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ row()?.subtitle }} @if (row()?.status) { · {{ row()?.status }} }</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a [routerLink]="'/' + key()" class="h-10 px-4 text-sm border border-slate-200 bg-white rounded-full inline-flex items-center">Back to list</a>
        <a [routerLink]="'/' + key() + '/report'" class="h-10 px-4 text-sm bg-slate-900 text-white rounded-full inline-flex items-center">Open report</a>
      </div>
    </div>

    @if (row()) {
      <app-stat-cards [items]="stats()" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <h2 class="text-[15px] font-semibold text-slate-900 mb-4">{{ def().singular }} details</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (f of detailFields(); track f.key) {
              <div class="border border-slate-100 rounded-xl p-3">
                <p class="text-xs text-slate-400">{{ f.label }}</p>
                <p class="font-medium text-slate-800 mt-1 break-words">{{ row()!.cells[f.key] || '—' }}</p>
              </div>
            }
          </div>
          @if (row()?.notes) {
            <p class="text-sm text-slate-600 mt-4 bg-slate-50 rounded-xl px-3 py-2">{{ row()?.notes }}</p>
          }
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Related</h2>
          <ul class="text-sm divide-y divide-slate-50">
            @for (other of related(); track other.id) {
              <li>
                <a [routerLink]="'/' + key() + '/' + other.id" class="flex items-center justify-between py-2.5 hover:text-slate-900">
                  <span>
                    <span class="font-medium text-slate-800">{{ other.title }}</span>
                    <span class="block text-xs text-slate-400">{{ other.status }}</span>
                  </span>
                  <svg class="ic text-slate-300"><use href="#i-arrow-right"/></svg>
                </a>
              </li>
            }
          </ul>
        </div>
      </div>

      @if (student(); as s) {
        <div class="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 class="text-[15px] font-semibold text-slate-900 mb-4">Student 360</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Guardian</p><p class="font-medium mt-1">{{ s.guardian }} · {{ s.guardianPhone || '—' }}</p></div>
            <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Medical</p><p class="font-medium mt-1">{{ s.bloodGroup || '—' }} · {{ s.allergies || 'None' }}</p></div>
            <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Campus</p><p class="font-medium mt-1">{{ s.residentType }} · {{ s.transportRoute || s.hostel || '—' }}</p></div>
          </div>
          @if (mark()) {
            <p class="text-sm text-slate-500 mt-4">Today’s attendance: <span class="font-medium text-slate-800">{{ mark() }}</span></p>
          }
        </div>
      }
    } @else {
      <div class="bg-white rounded-2xl border border-slate-100 p-10 text-center">
        <p class="text-slate-500">That record is not on file.</p>
        <a [routerLink]="'/' + key()" class="inline-block mt-3 text-sm text-slate-900 underline">Return to {{ def().title }}</a>
      </div>
    }
  `,
})
export class EntityDetailPage {
  private route = inject(ActivatedRoute);
  private records = inject(RecordsStore);
  private students = inject(StudentsStore);
  private os = inject(SchoolOsStore);
  private params = toSignal(this.route.paramMap, { requireSync: true });
  private data = toSignal(this.route.data, { requireSync: true });

  protected readonly key = computed(() => (this.data()?.['module'] as string) || 'dashboard');
  protected readonly id = computed(() => this.params()?.get('id') ?? '');
  protected readonly def = computed(() => this.records.def(this.key()));
  protected readonly row = computed(() => this.records.find(this.key(), this.id()));

  protected readonly detailFields = computed(() => {
    const row = this.row();
    const listed = this.def().fields;
    if (!row) return listed;
    const extra = Object.keys(row.cells)
      .filter((k) => !listed.some((f) => f.key === k))
      .map((k) => ({ key: k, label: k }));
    return [...listed, ...extra];
  });

  protected readonly related = computed(() => this.records.rows(this.key()).filter((r) => r.id !== this.id()).slice(0, 5));

  protected readonly student = computed(() => {
    if (this.key() !== 'students') return null;
    return this.students.students().find((s) => s.adm === this.id()) ?? null;
  });

  protected readonly mark = computed(() => {
    const s = this.student();
    if (!s) return '';
    const m = this.os.register().find((r) => r.adm === s.adm);
    return m ? m.status : '';
  });

  protected readonly stats = computed(() => {
    const all = this.records.rows(this.key());
    const row = this.row();
    return [
      { label: 'This record', value: '1', change: this.def().singular, bars: [4, 5, 6, 7, 6, 8, 9] },
      { label: 'In this module', value: String(all.length), change: this.def().title, bars: [5, 6, 6, 7, 8, 8, 9] },
      { label: 'Status', value: row?.status || '—', change: 'Current', bars: [3, 4, 5, 5, 6, 7, 7] },
      { label: 'Related', value: String(Math.max(0, all.length - 1)), change: 'Same directory', bars: [6, 5, 6, 7, 6, 8, 7] },
    ];
  });
}
