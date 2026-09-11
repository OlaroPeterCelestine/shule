export interface Activity {
  key: string;
  label: string;
  api: string[];
}

export interface RoleDef {
  key: string;
  label: string;
  locked: boolean;
}

export interface Grant {
  view: boolean;
  create: boolean;
  edit: boolean;
  approve: boolean;
}

export const ACTIVITIES: Activity[] = [
  { key: 'school', label: 'School setup', api: ['/api/school'] },
  { key: 'students', label: 'Students', api: ['/api/students'] },
  { key: 'admissions', label: 'Admissions', api: ['/api/admissions'] },
  { key: 'finance', label: 'Fees & Payroll', api: ['/api/finance'] },
  { key: 'reports', label: 'Report cards', api: ['/api/reports'] },
  { key: 'comms', label: 'Communication', api: [] },
  { key: 'hr', label: 'Staff & HR', api: ['/api/staff'] },
  { key: 'curriculum', label: 'Curriculum', api: [] },
  { key: 'academics', label: 'Timetable & Exams', api: [] },
  { key: 'assessments', label: 'Assessments', api: [] },
  { key: 'attendance', label: 'Attendance', api: ['/api/attendance'] },
  { key: 'transport', label: 'Transport', api: [] },
  { key: 'library', label: 'Library', api: [] },
  { key: 'inventory', label: 'Inventory', api: ['/api/inventory'] },
  { key: 'hostel', label: 'Hostel', api: [] },
  { key: 'visitors', label: 'Visitors & Gate', api: [] },
  { key: 'meetings', label: 'Meetings', api: [] },
  { key: 'calendar', label: 'Calendar', api: ['/api/calendar'] },
  { key: 'welfare', label: 'Welfare', api: [] },
  { key: 'health', label: 'Health', api: ['/api/health'] },
  { key: 'lifecycle', label: 'Promotion & Alumni', api: [] },
  { key: 'documents', label: 'Documents', api: ['/api/documents'] },
  { key: 'website', label: 'Website', api: [] },
  { key: 'ai', label: 'AI Assistant', api: [] },
  { key: 'system', label: 'Permissions', api: ['/api/perms', '/api/roles', '/api/activities', '/api/changelog'] },
  { key: 'clock', label: 'Staff clock', api: ['/api/clock'] },
];

export const SYSTEM_ROLES: RoleDef[] = [
  { key: 'admin', label: 'Admin', locked: true },
  { key: 'teacher', label: 'Teacher', locked: true },
  { key: 'accountant', label: 'Accountant', locked: true },
  { key: 'parent', label: 'Parent', locked: true },
];

export const EXTRA_ROLES: RoleDef[] = [
  { key: 'nurse', label: 'Nurse', locked: false },
  { key: 'registrar', label: 'Registrar', locked: false },
];

const TEACHER_VIEW = new Set([
  'students', 'reports', 'comms', 'curriculum', 'academics', 'assessments',
  'attendance', 'library', 'meetings', 'calendar', 'health', 'ai', 'clock',
]);
const TEACHER_WRITE = new Set(['students', 'admissions', 'attendance', 'health', 'clock']);
const ACCOUNTANT_VIEW = new Set(['students', 'finance', 'reports', 'comms', 'documents', 'calendar']);
const PARENT_VIEW = new Set(['students', 'finance', 'reports', 'comms', 'transport', 'meetings', 'calendar', 'health']);

export function defaultGrant(role: string, module: string): Grant {
  if (role === 'admin') return { view: true, create: true, edit: true, approve: true };
  if (role === 'teacher') {
    const write = TEACHER_WRITE.has(module);
    return { view: TEACHER_VIEW.has(module) || write, create: write, edit: write, approve: false };
  }
  if (role === 'accountant') {
    const finance = module === 'finance';
    return { view: ACCOUNTANT_VIEW.has(module), create: finance, edit: finance, approve: finance };
  }
  if (role === 'parent') {
    return { view: PARENT_VIEW.has(module), create: false, edit: false, approve: false };
  }
  if (role === 'nurse') {
    const health = module === 'health';
    return { view: health || module === 'students', create: health, edit: health, approve: false };
  }
  if (role === 'registrar') {
    const admissions = module === 'admissions';
    return { view: admissions || module === 'students', create: admissions, edit: admissions, approve: admissions };
  }
  return { view: false, create: false, edit: false, approve: false };
}

export function activityForPath(path: string) {
  const clean = path.split('?')[0];
  let best: Activity | null = null;
  let len = 0;
  for (const activity of ACTIVITIES) {
    for (const prefix of activity.api) {
      if ((clean === prefix || clean.startsWith(prefix + '/')) && prefix.length > len) {
        best = activity;
        len = prefix.length;
      }
    }
  }
  return best;
}

export function roleKey(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

export function isRoleKey(value: string) {
  return /^[a-z][a-z0-9_]{0,31}$/.test(value);
}
