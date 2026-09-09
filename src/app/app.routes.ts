import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.ShellPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage) },
      { path: 'students', loadComponent: () => import('./pages/students/students').then((m) => m.StudentsPage) },
      { path: 'admissions', loadComponent: () => import('./pages/admissions/admissions').then((m) => m.AdmissionsPage) },
      { path: 'hr', loadComponent: () => import('./pages/hr/hr').then((m) => m.HrPage) },
      { path: 'curriculum', loadComponent: () => import('./pages/curriculum/curriculum').then((m) => m.CurriculumPage) },
      { path: 'academics', loadComponent: () => import('./pages/academics/academics').then((m) => m.AcademicsPage) },
      { path: 'assessments', loadComponent: () => import('./pages/assessments/assessments').then((m) => m.AssessmentsPage) },
      { path: 'finance', loadComponent: () => import('./pages/finance/finance').then((m) => m.FinancePage) },
      { path: 'transport', loadComponent: () => import('./pages/transport/transport').then((m) => m.TransportPage) },
      { path: 'library', loadComponent: () => import('./pages/library/library').then((m) => m.LibraryPage) },
      { path: 'hostel', loadComponent: () => import('./pages/hostel/hostel').then((m) => m.HostelPage) },
      { path: 'visitors', loadComponent: () => import('./pages/visitors/visitors').then((m) => m.VisitorsPage) },
      { path: 'comms', loadComponent: () => import('./pages/comms/comms').then((m) => m.CommsPage) },
      { path: 'meetings', loadComponent: () => import('./pages/meetings/meetings').then((m) => m.MeetingsPage) },
      { path: 'welfare', loadComponent: () => import('./pages/welfare/welfare').then((m) => m.WelfarePage) },
      { path: 'lifecycle', loadComponent: () => import('./pages/lifecycle/lifecycle').then((m) => m.LifecyclePage) },
      { path: 'documents', loadComponent: () => import('./pages/documents/documents').then((m) => m.DocumentsPage) },
      { path: 'reports', loadComponent: () => import('./pages/reports/reports').then((m) => m.ReportsPage) },
      { path: 'ai', loadComponent: () => import('./pages/ai/ai').then((m) => m.AiPage) },
      { path: 'system', loadComponent: () => import('./pages/system/system').then((m) => m.SystemPage) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
