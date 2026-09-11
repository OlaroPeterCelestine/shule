import { Routes } from '@angular/router';
import { authGuard, guestGuard, permGuard } from './core/auth.guard';

const report = () => import('./pages/entity/entity-report').then((m) => m.EntityReportPage);
const detail = () => import('./pages/entity/entity-detail').then((m) => m.EntityDetailPage);
const pupilCard = () => import('./pages/reports/student-report-card').then((m) => m.StudentReportCardPage);
const pupilFile = () => import('./pages/students/pupil-file').then((m) => m.PupilFilePage);

function moduleRoutes(
  path: string,
  loadList: () => Promise<Record<string, import('@angular/core').Type<unknown>>>,
  exportName: string,
) {
  return {
    path,
    canActivate: [permGuard],
    children: [
      { path: '', loadComponent: () => loadList().then((m) => m[exportName]) },
      { path: 'report', data: { module: path }, loadComponent: report },
      ...(path === 'students'
        ? [
            { path: ':id/card', data: { module: path }, loadComponent: pupilCard },
            { path: ':id', data: { module: path }, loadComponent: pupilFile },
          ]
        : [{ path: ':id', data: { module: path }, loadComponent: detail }]),
    ],
  };
}

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.ShellPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      moduleRoutes('dashboard', () => import('./pages/dashboard/dashboard'), 'DashboardPage'),
      moduleRoutes('students', () => import('./pages/students/students'), 'StudentsPage'),
      moduleRoutes('admissions', () => import('./pages/admissions/admissions'), 'AdmissionsPage'),
      moduleRoutes('hr', () => import('./pages/hr/hr'), 'HrPage'),
      moduleRoutes('curriculum', () => import('./pages/curriculum/curriculum'), 'CurriculumPage'),
      moduleRoutes('academics', () => import('./pages/academics/academics'), 'AcademicsPage'),
      moduleRoutes('assessments', () => import('./pages/assessments/assessments'), 'AssessmentsPage'),
      moduleRoutes('finance', () => import('./pages/finance/finance'), 'FinancePage'),
      moduleRoutes('transport', () => import('./pages/transport/transport'), 'TransportPage'),
      moduleRoutes('library', () => import('./pages/library/library'), 'LibraryPage'),
      moduleRoutes('hostel', () => import('./pages/hostel/hostel'), 'HostelPage'),
      moduleRoutes('visitors', () => import('./pages/visitors/visitors'), 'VisitorsPage'),
      moduleRoutes('comms', () => import('./pages/comms/comms'), 'CommsPage'),
      moduleRoutes('meetings', () => import('./pages/meetings/meetings'), 'MeetingsPage'),
      moduleRoutes('feedback', () => import('./pages/feedback/feedback'), 'FeedbackPage'),
      moduleRoutes('welfare', () => import('./pages/welfare/welfare'), 'WelfarePage'),
      moduleRoutes('lifecycle', () => import('./pages/lifecycle/lifecycle'), 'LifecyclePage'),
      moduleRoutes('documents', () => import('./pages/documents/documents'), 'DocumentsPage'),
      moduleRoutes('reports', () => import('./pages/reports/reports'), 'ReportsPage'),
      moduleRoutes('ai', () => import('./pages/ai/ai'), 'AiPage'),
      moduleRoutes('system', () => import('./pages/system/system'), 'SystemPage'),
      moduleRoutes('profile', () => import('./pages/profile/profile'), 'ProfilePage'),
      moduleRoutes('school', () => import('./pages/school/school'), 'SchoolPage'),
      moduleRoutes('attendance', () => import('./pages/attendance/attendance'), 'AttendancePage'),
      moduleRoutes('calendar', () => import('./pages/calendar/calendar'), 'CalendarPage'),
      moduleRoutes('inventory', () => import('./pages/inventory/inventory'), 'InventoryPage'),
      moduleRoutes('health', () => import('./pages/health/health'), 'HealthPage'),
      moduleRoutes('website', () => import('./pages/website/website'), 'WebsitePage'),
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
