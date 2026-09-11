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

const TEACHER_WRITE = new Set(['students', 'admissions', 'attendance', 'health', 'clock']);

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
