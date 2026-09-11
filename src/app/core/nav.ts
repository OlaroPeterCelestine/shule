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
    title: 'TODAY',
    items: [{ path: 'dashboard', label: 'Home', icon: '#i-grid' }],
  },
  {
    title: 'PEOPLE',
    items: [
      { path: 'admissions', label: 'Admissions', icon: '#i-clipboard' },
      { path: 'students', label: 'Pupils', icon: '#i-cap' },
      { path: 'hr', label: 'Staff & HR', icon: '#i-users' },
    ],
  },
  {
    title: 'CLASSROOM',
    items: [
      { path: 'attendance', label: 'Attendance', icon: '#i-clipboard' },
      { path: 'academics', label: 'Timetable & Exams', icon: '#i-book-open' },
      { path: 'assessments', label: 'Assessments', icon: '#i-list-check' },
      { path: 'curriculum', label: 'Curriculum', icon: '#i-layers' },
      { path: 'reports', label: 'Report cards', icon: '#i-bar-chart' },
    ],
  },
  {
    title: 'MONEY',
    items: [{ path: 'finance', label: 'Fees & Payroll', icon: '#i-coin' }],
  },
  {
    title: 'CAMPUS',
    items: [
      { path: 'calendar', label: 'Calendar', icon: '#i-calendar' },
      { path: 'health', label: 'Health', icon: '#i-heart-pulse' },
      { path: 'meetings', label: 'Meetings', icon: '#i-calendar' },
      { path: 'feedback', label: 'Feedback', icon: '#i-clipboard' },
      { path: 'comms', label: 'Communication', icon: '#i-mail' },
      { path: 'transport', label: 'Transport', icon: '#i-bus' },
      { path: 'library', label: 'Library', icon: '#i-book' },
      { path: 'inventory', label: 'Inventory', icon: '#i-layers' },
      { path: 'hostel', label: 'Hostel', icon: '#i-bed' },
      { path: 'visitors', label: 'Visitors & Gate', icon: '#i-shield' },
      { path: 'welfare', label: 'Welfare', icon: '#i-heart-pulse' },
    ],
  },
  {
    title: 'OFFICE',
    items: [
      { path: 'documents', label: 'Documents & reports', icon: '#i-file' },
      { path: 'lifecycle', label: 'Promotion & Alumni', icon: '#i-award' },
      { path: 'website', label: 'Website', icon: '#i-apps' },
      { path: 'ai', label: 'AI Assistant', icon: '#i-bot' },
      { path: 'school', label: 'School setup', icon: '#i-layers' },
      { path: 'system', label: 'Permissions', icon: '#i-gear' },
      { path: 'profile', label: 'My profile', icon: '#i-users' },
    ],
  },
];

export const OPEN_PATHS = new Set(['dashboard', 'profile']);

export const ROLE_VIEW: Record<string, Set<string>> = {
  admin: new Set(NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.path))),
  teacher: new Set([
    'dashboard', 'students', 'reports', 'documents', 'comms', 'curriculum', 'academics',
    'assessments', 'attendance', 'library', 'meetings', 'feedback', 'calendar', 'health', 'inventory', 'ai', 'profile',
  ]),
  accountant: new Set([
    'dashboard', 'students', 'finance', 'reports', 'comms', 'documents', 'calendar', 'inventory', 'profile',
  ]),
  parent: new Set([
    'dashboard', 'students', 'finance', 'reports', 'comms', 'transport',
    'meetings', 'feedback', 'calendar', 'health', 'profile',
  ]),
  nurse: new Set(['dashboard', 'students', 'health', 'profile']),
  registrar: new Set(['dashboard', 'admissions', 'students', 'feedback', 'profile']),
};

const TEACHER_WRITE = new Set(['students', 'admissions', 'attendance', 'health', 'clock', 'academics', 'inventory']);

export function defaultPerms(): PermRow[] {
  const extras: Array<[string, string, PermRow['view'], boolean, boolean, boolean]> = [
    ['nurse', 'health', true, true, true, false],
    ['nurse', 'students', true, false, false, false],
    ['registrar', 'admissions', true, true, true, true],
    ['registrar', 'students', true, false, false, false],
  ];
  const roles: RoleKey[] = ['teacher', 'accountant', 'parent'];
  const modules = [
    ...NAV_SECTIONS.flatMap((s) => s.items).filter((i) => !OPEN_PATHS.has(i.path)).map((i) => ({ key: i.path, label: i.label })),
    { key: 'clock', label: 'Staff clock' },
  ];
  const rows = roles.flatMap((role) =>
    modules.map((m) => {
      const view = ROLE_VIEW[role].has(m.key) || (role === 'teacher' && TEACHER_WRITE.has(m.key));
      const write = role === 'teacher' ? TEACHER_WRITE.has(m.key) : role === 'accountant' && m.key === 'finance';
      return {
        role,
        roleLabel: role.charAt(0).toUpperCase() + role.slice(1),
        module: m.key,
        label: m.label,
        view,
        create: write,
        edit: write,
        approve: role === 'accountant' && m.key === 'finance',
      };
    }),
  );
  const extraRows = extras.map(([role, module, view, create, edit, approve]) => ({
    role,
    roleLabel: role.charAt(0).toUpperCase() + role.slice(1),
    module,
    label: modules.find((m) => m.key === module)?.label || module,
    view,
    create,
    edit,
    approve,
  }));
  return [...rows, ...extraRows];
}
