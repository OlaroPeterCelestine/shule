import type { PermRow, RoleKey } from './models';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN MENU',
    items: [
      { path: 'dashboard', label: 'Dashboard', icon: '#i-grid' },
      { path: 'school', label: 'School setup', icon: '#i-layers' },
      { path: 'students', label: 'Students', icon: '#i-cap' },
      { path: 'admissions', label: 'Admissions', icon: '#i-clipboard' },
      { path: 'finance', label: 'Fees & Payroll', icon: '#i-coin' },
      { path: 'reports', label: 'Report cards', icon: '#i-bar-chart' },
      { path: 'comms', label: 'Communication', icon: '#i-mail' },
      { path: 'hr', label: 'Staff & HR', icon: '#i-users' },
    ],
  },
  {
    title: 'ACADEMICS',
    items: [
      { path: 'curriculum', label: 'Curriculum', icon: '#i-layers' },
      { path: 'academics', label: 'Timetable & Exams', icon: '#i-book-open' },
      { path: 'assessments', label: 'Assessments', icon: '#i-list-check' },
      { path: 'attendance', label: 'Attendance', icon: '#i-clipboard' },
    ],
  },
  {
    title: 'CAMPUS',
    items: [
      { path: 'transport', label: 'Transport', icon: '#i-bus' },
      { path: 'library', label: 'Library', icon: '#i-book' },
      { path: 'inventory', label: 'Inventory', icon: '#i-layers' },
      { path: 'hostel', label: 'Hostel', icon: '#i-bed' },
      { path: 'visitors', label: 'Visitors & Gate', icon: '#i-shield' },
      { path: 'meetings', label: 'Meetings', icon: '#i-calendar' },
      { path: 'calendar', label: 'Calendar', icon: '#i-calendar' },
      { path: 'welfare', label: 'Welfare', icon: '#i-heart-pulse' },
      { path: 'health', label: 'Health', icon: '#i-heart-pulse' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: 'lifecycle', label: 'Promotion & Alumni', icon: '#i-award' },
      { path: 'documents', label: 'Documents', icon: '#i-file' },
      { path: 'website', label: 'Website', icon: '#i-apps' },
      { path: 'ai', label: 'AI Assistant', icon: '#i-bot' },
      { path: 'system', label: 'Permissions', icon: '#i-gear' },
      { path: 'profile', label: 'My profile', icon: '#i-users' },
    ],
  },
];

export const OPEN_PATHS = new Set(['dashboard', 'profile']);

export const ROLE_VIEW: Record<RoleKey, Set<string>> = {
  admin: new Set(NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.path))),
  teacher: new Set([
    'dashboard', 'students', 'reports', 'comms', 'curriculum', 'academics',
    'assessments', 'attendance', 'library', 'meetings', 'calendar', 'health', 'ai', 'profile',
  ]),
  accountant: new Set([
    'dashboard', 'students', 'finance', 'reports', 'comms', 'documents', 'calendar', 'profile',
  ]),
  parent: new Set([
    'dashboard', 'students', 'finance', 'reports', 'comms', 'transport',
    'meetings', 'calendar', 'health', 'profile',
  ]),
};

export function defaultPerms(): PermRow[] {
  const extras: PermRow[] = [
    { role: 'Nurse', module: 'Health', view: true, create: true, edit: true, approve: false },
    { role: 'Nurse', module: 'Students', view: true, create: false, edit: false, approve: false },
    { role: 'Registrar', module: 'Admissions', view: true, create: true, edit: true, approve: true },
  ];
  const roles: RoleKey[] = ['teacher', 'accountant', 'parent'];
  const rows = roles.flatMap((role) =>
    NAV_SECTIONS.flatMap((s) => s.items)
      .filter((i) => !OPEN_PATHS.has(i.path))
      .map((i) => {
        const view = ROLE_VIEW[role].has(i.path);
        const write = view && (role === 'teacher' || role === 'accountant') && i.path !== 'students';
        return {
          role: role.charAt(0).toUpperCase() + role.slice(1),
          module: i.label,
          view,
          create: write,
          edit: write,
          approve: view && role === 'accountant' && i.path === 'finance',
        };
      }),
  );
  return [...rows, ...extras];
}
