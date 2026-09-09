import type { Student } from './models';

export const KG_CLASSES = ['Baby class', 'Middle class', 'Top class'];
export const PRIMARY_CLASSES = [
  'Primary One', 'Primary Two', 'Primary Three', 'Primary Four',
  'Primary Five', 'Primary Six', 'Primary Seven',
];
export const SCHOOL_CLASSES = [...KG_CLASSES, ...PRIMARY_CLASSES];

export function isKindergarten(cls: string) {
  const n = cls.toLowerCase();
  return n.includes('baby') || n.includes('middle') || n.includes('top');
}

export interface SubjectMark {
  subject: string;
  score: string;
  grade: string;
  remark: string;
}

export interface PupilReport {
  student: Student;
  section: 'Kindergarten' | 'Primary';
  term: string;
  year: string;
  subjects: SubjectMark[];
  average: string;
  grade: string;
  position: string;
  classSize: number;
  attendance: string;
  daysPresent: string;
  classTeacher: string;
  classRemark: string;
  headRemark: string;
  nextTerm: string;
}

const KG_SUBJECTS = [
  'Oral language',
  'Reading readiness',
  'Number work',
  'Writing / pre-writing',
  'Creative activity',
  'Physical development',
  'Social & personal habits',
  'Religious / moral',
];

const PRIMARY_SUBJECTS = [
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'Literacy',
  'Religious Education',
  'Art & Technology',
  'Physical Education',
];

const KG_BANDS: { min: number; grade: string; remark: string }[] = [
  { min: 90, grade: 'E', remark: 'Excellent — keep it up' },
  { min: 80, grade: 'VG', remark: 'Very good progress' },
  { min: 70, grade: 'G', remark: 'Good effort this term' },
  { min: 55, grade: 'S', remark: 'Satisfactory — more practice at home' },
  { min: 0, grade: 'N', remark: 'Needs support — we shall follow up' },
];

const PRI_BANDS: { min: number; grade: string; remark: string }[] = [
  { min: 90, grade: 'D1', remark: 'Distinction — outstanding' },
  { min: 80, grade: 'D2', remark: 'Distinction — very strong' },
  { min: 70, grade: 'C3', remark: 'Credit — good work' },
  { min: 60, grade: 'C4', remark: 'Credit — keep practising' },
  { min: 50, grade: 'C5', remark: 'Credit — more revision needed' },
  { min: 40, grade: 'C6', remark: 'Pass — extra coaching advised' },
  { min: 0, grade: 'P7', remark: 'Below average — parent meeting needed' },
];

function seed(adm: string, i: number) {
  let n = 0;
  for (let k = 0; k < adm.length; k++) n += adm.charCodeAt(k) * (k + 3);
  return 52 + ((n * (i + 2)) % 46);
}

function band(score: number, kg: boolean) {
  return (kg ? KG_BANDS : PRI_BANDS).find((b) => score >= b.min)!;
}

export function buildPupilReport(student: Student, classSize = 8): PupilReport {
  const kg = isKindergarten(student.cls);
  const names = kg ? KG_SUBJECTS : PRIMARY_SUBJECTS;
  const subjects = names.map((subject, i) => {
    const score = seed(student.adm, i);
    const b = band(score, kg);
    return {
      subject,
      score: kg ? b.grade : String(score) + '%',
      grade: b.grade,
      remark: b.remark,
    };
  });
  const nums = names.map((_, i) => seed(student.adm, i));
  const avg = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  const overall = band(avg, kg);
  const rank = 1 + (Number(student.adm.replace(/\D/g, '')) % Math.max(1, classSize));
  const present = 58 + (avg % 8);

  return {
    student,
    section: kg ? 'Kindergarten' : 'Primary',
    term: 'Term 2',
    year: '2026',
    subjects,
    average: kg ? overall.grade : avg + '%',
    grade: overall.grade,
    position: rank + ' of ' + classSize,
    classSize,
    attendance: student.attendance,
    daysPresent: present + ' / 64',
    classTeacher: kg ? 'S. Achieng' : 'B. Ssentongo',
    classRemark: kg
      ? (student.firstName || student.name.split(' ')[0]) + ' is settling well. Please practise counting and letter sounds at home.'
      : (student.firstName || student.name.split(' ')[0]) + ' has worked steadily this term. Continue reading aloud every evening.',
    headRemark: 'A pleasing term at Little Royals. In God We Trust.',
    nextTerm: 'Term 3 begins 11 January 2027',
  };
}

export function reportsFor(students: Student[]): PupilReport[] {
  return students.map((s) => {
    const size = students.filter((x) => x.cls === s.cls).length || 1;
    return buildPupilReport(s, size);
  });
}
