export type DocPick = 'student' | 'staff' | 'applicant' | 'visit' | 'none';

export interface DocType {
  key: string;
  title: string;
  description: string;
  pick: DocPick;
}

export const DOC_TYPES: DocType[] = [
  { key: 'report-card', title: 'Report card', description: 'End-of-term pupil progress report', pick: 'student' },
  { key: 'sick-leave', title: 'Sickbay / sick leave note', description: 'Nurse note for a pupil sent home or resting', pick: 'visit' },
  { key: 'staff-leave', title: 'Staff leave letter', description: 'Approved leave letter for a staff member', pick: 'staff' },
  { key: 'student-id', title: 'Student ID card', description: 'Admission number, class and validity', pick: 'student' },
  { key: 'admission-letter', title: 'Admission letter', description: 'Offer of a place for an applicant', pick: 'applicant' },
  { key: 'transfer-certificate', title: 'Transfer certificate', description: 'Release letter when a pupil leaves', pick: 'student' },
  { key: 'completion-certificate', title: 'Completion certificate', description: 'Issued at the end of Primary Seven', pick: 'student' },
  { key: 'fee-statement', title: 'Fee statement', description: 'Balance and payment status', pick: 'student' },
  { key: 'payslip', title: 'Staff payslip', description: 'Latest payroll line', pick: 'staff' },
  { key: 'visitor-badge', title: 'Visitor badge', description: 'Day pass for a campus visitor', pick: 'none' },
  { key: 'feedback', title: 'Feedback form', description: 'Parent, teacher or visitor form you can print blank or filled', pick: 'none' },
];
