export function cleanText(value: unknown, max = 80): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>"`]/g, '')
    .trim()
    .slice(0, max);
}

export function isPhone(value: string): boolean {
  const d = value.replace(/[\s-]/g, '');
  return /^(\+?256|0)7\d{8}$/.test(d);
}

export function isIsoDate(iso: string, minYear: number, maxYear: number): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return false;
  return y >= minYear && y <= maxYear;
}

export function isEmail(value: string): boolean {
  if (value.length > 80 || value.includes('..')) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}

export function allowed(value: string, options: readonly string[]): boolean {
  return options.includes(value);
}

export const CLASSES = [
  'Baby class',
  'Middle class',
  'Top class',
  'Primary One',
  'Primary Two',
  'Primary Three',
  'Primary Four',
  'Primary Five',
  'Primary Six',
  'Primary Seven',
] as const;

export const STAGES = ['applied', 'review', 'interview', 'offered', 'enrolled', 'waitlist'] as const;
export const MARKS = ['P', 'A', 'L', 'E'] as const;
export const SEX = ['Female', 'Male', 'Other'] as const;
export const EXAM_KINDS = ['End of term', 'Mid-term', 'Continuous'] as const;
export const EXAM_STATUS = ['Scheduled', 'Running', 'Marked', 'Published'] as const;
export const SUBJECTS_KG = [
  'Oral language',
  'Reading readiness',
  'Number work',
  'Writing / pre-writing',
  'Creative activity',
  'Physical development',
  'Social & personal habits',
  'Religious / moral',
] as const;
export const SUBJECTS_PRIMARY = [
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'Literacy',
  'Religious Education',
  'Art & Technology',
  'Physical Education',
] as const;
export const SUBJECTS = [...SUBJECTS_KG, ...SUBJECTS_PRIMARY] as const;

export function isKindergarten(cls: string) {
  const n = cls.toLowerCase();
  return n.includes('baby') || n.includes('middle') || n.includes('top') || n === 'kindergarten';
}

export function subjectsForClass(cls: string): string[] {
  if (cls === 'Whole school') return [...SUBJECTS_PRIMARY];
  if (cls === 'Primary' || cls.startsWith('Primary')) return [...SUBJECTS_PRIMARY];
  return [...SUBJECTS_KG];
}

export function classesForSitting(cls: string): string[] {
  if (cls === 'Whole school') return [...CLASSES];
  if (cls === 'Kindergarten') return CLASSES.filter((c) => isKindergarten(c));
  if (cls === 'Primary') return CLASSES.filter((c) => !isKindergarten(c));
  return allowed(cls, CLASSES) ? [cls] : [];
}
