export type Role = 'admin' | 'teacher' | 'accountant' | 'parent';

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
  label: string;
}

export const DEMO_ACCOUNTS: Record<Role, SessionUser> = {
  admin: { email: 'admin@littleroyals.ac.ug', name: 'Grace Nakato', label: 'Admin', role: 'admin' },
  teacher: { email: 'teacher@littleroyals.ac.ug', name: 'B. Ssentongo', label: 'Teacher', role: 'teacher' },
  accountant: { email: 'accountant@littleroyals.ac.ug', name: 'B. Kato', label: 'Accountant', role: 'accountant' },
  parent: { email: 'parent@littleroyals.ac.ug', name: 'R. Nakiwala', label: 'Parent', role: 'parent' },
};

export const SCHOOL = {
  name: 'Little Royals Kindergarten & Primary School',
  motto: 'In God We Trust',
  address: 'Seguku Entebbe Road, P.O. Box 15062, Kampala, Uganda',
  phone: '0772 435 539 · 0704 626 670 · 0754 301 175',
  email: 'info@littleroyalskindergarten.co.ug',
  website: 'www.littleroyalskindergarten.co.ug',
  year: '2026',
  term: 'Term 2',
};

export const STUDENTS = [
  {
    adm: 'LR-2291', name: 'Nakiwala Faith', firstName: 'Faith', lastName: 'Nakiwala', cls: 'Primary Five',
    gender: 'Female', dob: '2015-03-12', guardian: 'Rose Nakiwala', guardianPhone: '+256772445210',
    attendance: '96%', fee: 'cleared', feeLabel: 'Cleared',
  },
  {
    adm: 'LR-1187', name: 'Namutebi Racheal', firstName: 'Racheal', lastName: 'Namutebi', cls: 'Primary Seven',
    gender: 'Female', dob: '2013-07-04', guardian: 'Joseph Namutebi', guardianPhone: '+256774881902',
    attendance: '88%', fee: 'due', feeLabel: '620,000 due',
  },
  {
    adm: 'LR-0894', name: 'Okello Derrick', firstName: 'Derrick', lastName: 'Okello', cls: 'Primary Three',
    gender: 'Male', dob: '2017-11-21', guardian: 'Peter Okello', guardianPhone: '+256780334551',
    attendance: '91%', fee: 'due', feeLabel: '540,000 due',
  },
  {
    adm: 'LR-2456', name: 'Achieng Patricia', firstName: 'Patricia', lastName: 'Achieng', cls: 'Primary Six',
    gender: 'Female', dob: '2014-01-30', guardian: 'Susan Achieng', guardianPhone: '+256772990214',
    attendance: '99%', fee: 'due', feeLabel: '480,000 due',
  },
];

export const APPLICANTS = [
  { id: 1, name: 'Nailah Kasumbakali', firstName: 'Nailah', lastName: 'Kasumbakali', cls: 'Primary Two', stage: 'applied', meta: 'Paper form received', lin: 'U19F0921A15007', adm: '', fatherName: 'Kasumbakali Umar', motherName: 'Nahidah Kellen' },
  { id: 2, name: 'Kirabo Alex', firstName: 'Alex', lastName: 'Kirabo', cls: 'Baby class', stage: 'applied', meta: 'Submitted 2 Sep', lin: '', adm: '', fatherName: '', motherName: '' },
  { id: 3, name: 'Nabatanzi Joy', firstName: 'Joy', lastName: 'Nabatanzi', cls: 'Primary Four', stage: 'review', meta: 'Docs in check', lin: '', adm: '', fatherName: '', motherName: '' },
  { id: 4, name: 'Mugisha Ruth', firstName: 'Ruth', lastName: 'Mugisha', cls: 'Top class', stage: 'review', meta: 'Docs complete', lin: '', adm: '', fatherName: '', motherName: '' },
  { id: 5, name: 'Namuli Grace', firstName: 'Grace', lastName: 'Namuli', cls: 'Primary One', stage: 'interview', meta: '11 Sep, 10am', lin: '', adm: '', fatherName: '', motherName: '' },
  { id: 6, name: 'Kato Brian', firstName: 'Brian', lastName: 'Kato', cls: 'Primary Two', stage: 'offered', meta: 'Adm. no. ready', lin: '', adm: '', fatherName: '', motherName: '' },
  { id: 7, name: 'Ssali Peter', firstName: 'Peter', lastName: 'Ssali', cls: 'Primary One', stage: 'waitlist', meta: 'Waitlisted, no. 3', lin: '', adm: '', fatherName: '', motherName: '' },
];

export const REGISTER = [
  { adm: 'LR-2291', name: 'Nakiwala Faith', cls: 'Primary Five', status: 'P' },
  { adm: 'LR-1187', name: 'Namutebi Racheal', cls: 'Primary Seven', status: 'P' },
  { adm: 'LR-0894', name: 'Okello Derrick', cls: 'Primary Three', status: 'A' },
  { adm: 'LR-2456', name: 'Achieng Patricia', cls: 'Primary Six', status: 'L' },
];

export const INVOICES = [
  { id: 'INV-4471', student: 'Nakiwala Faith', total: 1020000, paid: 1020000, balance: 0, status: 'Cleared' },
  { id: 'INV-4472', student: 'Namutebi Racheal', total: 980000, paid: 360000, balance: 620000, status: 'Overdue' },
  { id: 'INV-4473', student: 'Okello Derrick', total: 860000, paid: 320000, balance: 540000, status: 'Due' },
  { id: 'INV-4474', student: 'Achieng Patricia', total: 720000, paid: 240000, balance: 480000, status: 'Due' },
];

export const STOCK = [
  { id: 1, name: 'Exercise books (A4)', category: 'Stationery', qty: 840, location: 'Store A' },
  { id: 2, name: 'Science lab coats', category: 'Uniforms', qty: 46, location: 'Lab store' },
  { id: 3, name: 'Football set', category: 'Sports', qty: 12, location: 'PE store' },
  { id: 4, name: 'Desktop computers', category: 'Electronics', qty: 28, location: 'ICT lab' },
];

export const VISITS = [
  { id: 1, adm: 'LR-2456', name: 'Achieng Patricia', reason: 'Asthma — inhaler', action: 'Rested 20 min', time: 'Today, 9:40am', notified: true },
  { id: 2, adm: 'LR-0894', name: 'Okello Derrick', reason: 'Headache', action: 'Paracetamol, observation', time: 'Today, 11:15am', notified: false },
];

export const EVENTS = [
  { id: 1, title: 'Mid-term tests', date: '15–19 Sep', type: 'Exams', audience: 'P1–P7' },
  { id: 2, title: 'Parents’ day', date: '26 Sep', type: 'PTM', audience: 'All parents' },
  { id: 3, title: 'Sports day', date: '3 Oct', type: 'Event', audience: 'Whole school' },
  { id: 4, title: 'Term 2 holiday begins', date: '21 Nov', type: 'Holiday', audience: 'All' },
];

export const STAFF = [
  { id: 'LR-ST-001', name: 'Grace Nakato', role: 'Headteacher', dept: 'Administration', status: 'Active' },
  { id: 'LR-ST-014', name: 'B. Ssentongo', role: 'Teacher — Mathematics', dept: 'Academics', status: 'Active' },
  { id: 'LR-ST-008', name: 'B. Kato', role: 'Accountant', dept: 'Finance', status: 'Active' },
  { id: 'LR-ST-041', name: 'Mugabe S.', role: 'Driver — Route 1', dept: 'Transport', status: 'On leave' },
];

export const PERMS = [
  { role: 'Teacher', module: 'Finance', view: false, create: false, edit: false, approve: false },
  { role: 'Teacher', module: 'Students', view: true, create: true, edit: true, approve: false },
  { role: 'Accountant', module: 'Finance', view: true, create: true, edit: true, approve: true },
  { role: 'Parent', module: 'Students', view: true, create: false, edit: false, approve: false },
];
