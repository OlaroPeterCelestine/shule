import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { buildPupilReport } from '../../core/report-cards';
import { StudentsStore } from '../../core/students.store';

@Component({
  selector: 'app-student-report-card',
  imports: [RouterLink],
  template: `
    @if (card(); as c) {
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 no-print">
        <div>
          <p class="text-xs text-slate-400">
            <a routerLink="/reports" class="hover:text-slate-700">Report cards</a>
            <span class="mx-1">›</span> {{ c.student.name }}
          </p>
          <h1 class="text-[22px] sm:text-[28px] font-semibold tracking-tight text-slate-900 mt-1">End of term report</h1>
          <p class="text-sm text-slate-400 mt-1">{{ c.section }} · {{ c.term }}, {{ c.year }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a [routerLink]="['/students', c.student.adm]" class="h-10 px-4 text-sm border border-slate-200 bg-white rounded-full inline-flex items-center">Pupil file</a>
          <a routerLink="/reports" class="h-10 px-4 text-sm border border-slate-200 bg-white rounded-full inline-flex items-center">All cards</a>
          <button type="button" (click)="print()" class="h-10 px-4 text-sm bg-slate-900 text-white rounded-full">Print / PDF</button>
        </div>
      </div>

      <article id="module-report" class="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 sm:p-8 max-w-3xl">
        <header class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div class="flex items-start gap-3">
            <img src="logo.png" alt="Little Royals logo" class="w-14 h-14 rounded-full object-contain ring-1 ring-slate-100" />
            <div>
              <p class="text-[15px] sm:text-lg font-semibold text-slate-900 leading-tight">Little Royals Kindergarten & Primary School</p>
              <p class="text-xs text-slate-400 mt-1">Seguku Entebbe Road · P.O. Box 15062, Kampala</p>
              <p class="text-xs text-slate-400">Tel 0772 435 539 · Motto: In God We Trust</p>
            </div>
          </div>
          <p class="text-[11px] text-slate-500 text-right shrink-0">{{ c.term }} {{ c.year }}<br />{{ c.section }}</p>
        </header>

        <h2 class="text-center font-semibold text-slate-900 mt-5 mb-4">Pupil’s progress report</h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-5">
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Name</p><p class="font-medium mt-1">{{ c.student.name }}</p></div>
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Admission no.</p><p class="font-medium mt-1 font-mono">{{ c.student.adm }}</p></div>
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Class</p><p class="font-medium mt-1">{{ c.student.cls }}</p></div>
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Gender</p><p class="font-medium mt-1">{{ c.student.gender || '—' }}</p></div>
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Attendance</p><p class="font-medium mt-1">{{ c.daysPresent }} ({{ c.attendance }})</p></div>
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Position</p><p class="font-medium mt-1">{{ c.position }}</p></div>
        </div>

        <table class="w-full text-sm mb-5">
          <thead class="bg-slate-50 text-xs text-slate-400">
            <tr class="text-left">
              <th class="px-3 py-2 font-medium">Learning area</th>
              <th class="px-3 py-2 font-medium">{{ c.section === 'Kindergarten' ? 'Level' : 'Score' }}</th>
              <th class="px-3 py-2 font-medium">Grade</th>
              <th class="px-3 py-2 font-medium">Teacher remark</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            @for (s of c.subjects; track s.subject) {
              <tr>
                <td class="px-3 py-2 font-medium text-slate-800">{{ s.subject }}</td>
                <td class="px-3 py-2 text-slate-700">{{ s.score }}</td>
                <td class="px-3 py-2 text-slate-700">{{ s.grade }}</td>
                <td class="px-3 py-2 text-slate-500">{{ s.remark }}</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-5">
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Overall</p><p class="font-semibold text-slate-900 mt-1">{{ c.average }}</p></div>
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Overall grade</p><p class="font-semibold text-slate-900 mt-1">{{ c.grade }}</p></div>
          <div class="border border-slate-100 rounded-xl p-3"><p class="text-xs text-slate-400">Class teacher</p><p class="font-medium mt-1">{{ c.classTeacher }}</p></div>
        </div>

        <div class="space-y-3 text-sm text-slate-700">
          <p><span class="font-semibold text-slate-900">Class teacher:</span> {{ c.classRemark }}</p>
          <p><span class="font-semibold text-slate-900">Head teacher:</span> {{ c.headRemark }}</p>
          <p class="text-xs text-slate-400">{{ c.nextTerm }} · Parent / guardian: {{ c.student.guardian }}</p>
        </div>
      </article>
    } @else {
      <div class="bg-white rounded-2xl border border-slate-100 p-10 text-center">
        <p class="text-slate-500">No pupil found for that admission number.</p>
        <a routerLink="/reports" class="inline-block mt-3 text-sm underline">Back to report cards</a>
      </div>
    }
  `,
})
export class StudentReportCardPage {
  private route = inject(ActivatedRoute);
  private students = inject(StudentsStore);
  private params = toSignal(this.route.paramMap, { requireSync: true });

  protected readonly card = computed(() => {
    const id = this.params()?.get('id') ?? '';
    const student = this.students.students().find((s) => s.adm === id);
    return student ? buildPupilReport(student, this.students.students().filter((s) => s.cls === student.cls).length || 1) : null;
  });

  print() {
    window.print();
  }
}
