export const SCHOOL_NAME = 'Little Royals Kindergarten & Primary School';
export const SCHOOL_SHORT = 'Little Royals';

export type RoleKey = 'admin' | 'teacher' | 'accountant' | 'parent';

export interface DemoAccount {
  email: string;
  name: string;
  label: string;
  role: RoleKey;
}

export interface SessionUser {
  name: string;
  email: string;
  role: RoleKey;
  label: string;
  phone?: string;
  title?: string;
  department?: string;
  staffId?: string;
  campus?: string;
  bio?: string;
  language?: string;
  dateFormat?: string;
  notifyEmail?: boolean;
  notifySms?: boolean;
  notifyPush?: boolean;
  twoFactor?: boolean;
}

export const DEMO_ACCOUNTS: Record<RoleKey, DemoAccount> = {
  admin: { email: 'admin@littleroyals.ac.ug', name: 'Grace Nakato', label: 'Admin', role: 'admin' },
  teacher: { email: 'teacher@littleroyals.ac.ug', name: 'B. Ssentongo', label: 'Teacher', role: 'teacher' },
  accountant: { email: 'accountant@littleroyals.ac.ug', name: 'B. Kato', label: 'Accountant', role: 'accountant' },
  parent: { email: 'parent@littleroyals.ac.ug', name: 'R. Nakiwala', label: 'Parent', role: 'parent' },
};

export interface Student {
  adm: string;
  name: string;
  firstName?: string;
  lastName?: string;
  cls: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  religion?: string;
  admissionDate?: string;
  admissionType?: string;
  previousSchool?: string;
  guardian: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  address?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalNotes?: string;
  residentType?: string;
  transportRoute?: string;
  hostel?: string;
  attendance: string;
  fee: 'cleared' | 'due';
  feeLabel: string;
  notes?: string;
}

export interface ModalField {
  key: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}

export interface ModalOptions {
  title: string;
  message?: string;
  fields?: ModalField[];
  select?: { key: string; options: string[] };
  file?: { key: string; accept: string };
  confirmLabel?: string;
  onConfirm: (values: Record<string, string | File | undefined>) => boolean | void;
}
