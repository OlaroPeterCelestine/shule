import { Injectable, computed, signal } from '@angular/core';

export type Mark = 'P' | 'A' | 'L' | 'E';
export type ApplicantStage = 'inquiry' | 'applied' | 'review' | 'interview' | 'offered' | 'enrolled' | 'waitlist';

export interface SchoolProfile {
  name: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  year: string;
  term: string;
  timezone: string;
  currency: string;
  country: string;
  dayBoarding: string;
  levels: string;
}

export interface Campus {
  id: number;
  name: string;
  city: string;
  focus: string;
}

export interface House {
  id: number;
  name: string;
  colour: string;
  members: number;
}

export interface SchoolEvent {
  id: number;
  title: string;
  date: string;
  type: string;
  audience: string;
}

export interface AttendanceRow {
  adm: string;
  name: string;
  cls: string;
  status: Mark;
}

export interface StockItem {
  id: number;
  name: string;
  category: string;
  qty: number;
  location: string;
}

export interface SickVisit {
  id: number;
  adm: string;
  name: string;
  reason: string;
  action: string;
  time: string;
  notified: boolean;
}

export interface Question {
  id: number;
  subject: string;
  topic: string;
  type: string;
  difficulty: string;
  marks: number;
  text: string;
}

export interface ExamRoom {
  id: number;
  room: string;
  exam: string;
  capacity: number;
  seated: number;
  invigilator: string;
}

export interface CmsPage {
  id: number;
  title: string;
  status: 'Draft' | 'Published';
  updated: string;
}

export interface Applicant {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dob: string;
  sex: string;
  religion: string;
  location: string;
  lcZone: string;
  illness: string;
  cls: string;
  lin: string;
  fatherName: string;
  fatherPhone: string;
  fatherNin: string;
  motherName: string;
  motherPhone: string;
  motherNin: string;
  guardianName: string;
  guardianPhone: string;
  schoolpay: string;
  transport: string;
  photo: string;
  stage: ApplicantStage;
  meta: string;
}

export interface PermRow {
  role: string;
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  approve: boolean;
}

const today = '9 Sep 2026';

@Injectable({ providedIn: 'root' })
export class SchoolOsStore {
  readonly school = signal<SchoolProfile>({
    name: 'Little Royals Kindergarten & Primary School',
    motto: 'In God We Trust',
    address: 'Seguku Entebbe Road, P.O. Box 15062, Kampala, Uganda',
    phone: '0772 435 539 · 0704 626 670 · 0754 301 175',
    email: 'info@littleroyalskindergarten.co.ug',
    website: 'www.littleroyalskindergarten.co.ug',
    year: '2026',
    term: 'Term 2',
    timezone: 'Africa/Kampala (EAT)',
    currency: 'UGX',
    country: 'Uganda',
    dayBoarding: 'Day and boarding',
    levels: 'Kindergarten · Primary · O-Level · A-Level',
  });

  readonly campuses = signal<Campus[]>([
    { id: 1, name: 'Main campus — Seguku', city: 'Kampala', focus: 'Kindergarten & Primary' },
    { id: 2, name: 'Day van routes', city: 'Greater Kampala', focus: 'Pick & drop' },
  ]);

  readonly houses = signal<House[]>([
    { id: 1, name: 'Eagle', colour: 'Gold', members: 312 },
    { id: 2, name: 'Lion', colour: 'Maroon', members: 298 },
    { id: 3, name: 'Gazelle', colour: 'Green', members: 274 },
    { id: 4, name: 'Crane', colour: 'Blue', members: 400 },
  ]);

  readonly events = signal<SchoolEvent[]>([
    { id: 1, title: 'Mid-term tests', date: '15–19 Sep', type: 'Exams', audience: 'S1–S6' },
    { id: 2, title: 'Parents’ day', date: '26 Sep', type: 'PTM', audience: 'All parents' },
    { id: 3, title: 'Sports day', date: '3 Oct', type: 'Event', audience: 'Whole school' },
    { id: 4, title: 'Term 2 holiday begins', date: '21 Nov', type: 'Holiday', audience: 'All' },
  ]);

  readonly register = signal<AttendanceRow[]>([
    { adm: 'LR-2291', name: 'Nakiwala Faith', cls: 'S4 East', status: 'P' },
    { adm: 'LR-1187', name: 'Namutebi Racheal', cls: 'S5 Arts', status: 'P' },
    { adm: 'LR-0894', name: 'Okello Derrick', cls: 'S2 East', status: 'A' },
    { adm: 'LR-2456', name: 'Achieng Patricia', cls: 'P7 Blue', status: 'L' },
  ]);

  readonly stock = signal<StockItem[]>([
    { id: 1, name: 'Exercise books (A4)', category: 'Stationery', qty: 840, location: 'Store A' },
    { id: 2, name: 'Science lab coats', category: 'Uniforms', qty: 46, location: 'Lab store' },
    { id: 3, name: 'Football set', category: 'Sports', qty: 12, location: 'PE store' },
    { id: 4, name: 'Desktop computers', category: 'Electronics', qty: 28, location: 'ICT lab' },
  ]);

  readonly visits = signal<SickVisit[]>([
    { id: 1, adm: 'LR-2456', name: 'Achieng Patricia', reason: 'Asthma — inhaler', action: 'Rested 20 min, returned to class', time: 'Today, 9:40am', notified: true },
    { id: 2, adm: 'LR-0894', name: 'Okello Derrick', reason: 'Headache', action: 'Paracetamol, observation', time: 'Today, 11:15am', notified: false },
  ]);

  readonly questions = signal<Question[]>([
    { id: 1, subject: 'Mathematics', topic: 'Quadratic equations', type: 'Short answer', difficulty: 'Medium', marks: 4, text: 'Solve x² − 5x + 6 = 0' },
    { id: 2, subject: 'Physics', topic: "Newton's laws", type: 'MCQ', difficulty: 'Easy', marks: 2, text: 'Which law relates force, mass and acceleration?' },
    { id: 3, subject: 'English', topic: 'Comprehension', type: 'Long answer', difficulty: 'Hard', marks: 10, text: 'Summarise the passage in 120 words.' },
  ]);

  readonly examRooms = signal<ExamRoom[]>([
    { id: 1, room: 'Hall A', exam: 'S4 Mathematics', capacity: 60, seated: 58, invigilator: 'B. Ssentongo' },
    { id: 2, room: 'Lab 2', exam: 'S6 Physics practical', capacity: 24, seated: 21, invigilator: 'J. Namutebi' },
    { id: 3, room: 'Room 12', exam: 'P7 English', capacity: 40, seated: 36, invigilator: 'S. Achieng' },
  ]);

  readonly cms = signal<CmsPage[]>([
    { id: 1, title: 'Home', status: 'Published', updated: '4 Sep' },
    { id: 2, title: 'Admissions — Apply online', status: 'Published', updated: '1 Sep' },
    { id: 3, title: 'Term 2 sports day', status: 'Draft', updated: '8 Sep' },
  ]);

  readonly applicants = signal<Applicant[]>([
    {
      id: 1, name: 'Nailah Kasumbakali', firstName: 'Nailah', lastName: 'Kasumbakali',
      dob: '2019-09-11', sex: 'Female', religion: 'Muslim',
      location: 'Kigo', lcZone: '', illness: 'None',
      cls: 'Primary Two', lin: 'U19F0921A15007',
      fatherName: 'Kasumbakali Umar', fatherPhone: '07002304080', fatherNin: 'CM941011028AJL',
      motherName: 'Nahidah Kasumbakali Kellen', motherPhone: '0742871325', motherNin: 'CF930611068LPJ',
      guardianName: '', guardianPhone: '',
      schoolpay: '1012331836', transport: 'Van — pick & drop',
      photo: 'application-form.jpg',
      stage: 'applied', meta: 'Paper form received',
    },
    { id: 2, name: 'Kirabo Alex', firstName: 'Alex', lastName: 'Kirabo', dob: '', sex: 'Male', religion: '', location: '', lcZone: '', illness: '', cls: 'Baby class', lin: '', fatherName: '', fatherPhone: '', fatherNin: '', motherName: '', motherPhone: '', motherNin: '', guardianName: '', guardianPhone: '', schoolpay: '', transport: '', photo: '', stage: 'applied', meta: 'Submitted 2 Sep' },
    { id: 3, name: 'Nabatanzi Joy', firstName: 'Joy', lastName: 'Nabatanzi', dob: '', sex: 'Female', religion: '', location: '', lcZone: '', illness: '', cls: 'Primary Four', lin: '', fatherName: '', fatherPhone: '', fatherNin: '', motherName: '', motherPhone: '', motherNin: '', guardianName: '', guardianPhone: '', schoolpay: '', transport: '', photo: '', stage: 'review', meta: 'Docs in check' },
    { id: 4, name: 'Mugisha Ruth', firstName: 'Ruth', lastName: 'Mugisha', dob: '', sex: 'Female', religion: '', location: '', lcZone: '', illness: '', cls: 'Top class', lin: '', fatherName: '', fatherPhone: '', fatherNin: '', motherName: '', motherPhone: '', motherNin: '', guardianName: '', guardianPhone: '', schoolpay: '', transport: '', photo: '', stage: 'review', meta: 'Docs complete' },
    { id: 5, name: 'Namuli Grace', firstName: 'Grace', lastName: 'Namuli', dob: '', sex: 'Female', religion: '', location: '', lcZone: '', illness: '', cls: 'Primary One', lin: '', fatherName: '', fatherPhone: '', fatherNin: '', motherName: '', motherPhone: '', motherNin: '', guardianName: '', guardianPhone: '', schoolpay: '', transport: '', photo: '', stage: 'interview', meta: '11 Sep, 10am' },
    { id: 6, name: 'Kato Brian', firstName: 'Brian', lastName: 'Kato', dob: '', sex: 'Male', religion: '', location: '', lcZone: '', illness: '', cls: 'Primary Two', lin: '', fatherName: '', fatherPhone: '', fatherNin: '', motherName: '', motherPhone: '', motherNin: '', guardianName: '', guardianPhone: '', schoolpay: '', transport: '', photo: '', stage: 'offered', meta: 'Adm. no. ready' },
    { id: 7, name: 'Ssali Peter', firstName: 'Peter', lastName: 'Ssali', dob: '', sex: 'Male', religion: '', location: '', lcZone: '', illness: '', cls: 'Primary One', lin: '', fatherName: '', fatherPhone: '', fatherNin: '', motherName: '', motherPhone: '', motherNin: '', guardianName: '', guardianPhone: '', schoolpay: '', transport: '', photo: '', stage: 'waitlist', meta: 'Waitlisted, no. 3' },
  ]);

  readonly perms = signal<PermRow[]>([
    { role: 'Teacher', module: 'Attendance', view: true, create: true, edit: true, approve: false },
    { role: 'Teacher', module: 'Marks', view: true, create: true, edit: true, approve: false },
    { role: 'Teacher', module: 'Students', view: true, create: false, edit: false, approve: false },
    { role: 'Teacher', module: 'Finance', view: false, create: false, edit: false, approve: false },
    { role: 'Accountant', module: 'Finance', view: true, create: true, edit: true, approve: true },
    { role: 'Accountant', module: 'Payroll', view: true, create: true, edit: false, approve: false },
    { role: 'Accountant', module: 'Students', view: true, create: false, edit: false, approve: false },
    { role: 'Nurse', module: 'Health', view: true, create: true, edit: true, approve: false },
    { role: 'Nurse', module: 'Students', view: true, create: false, edit: false, approve: false },
    { role: 'Parent', module: 'Own children', view: true, create: false, edit: false, approve: false },
    { role: 'Parent', module: 'Finance', view: true, create: false, edit: false, approve: false },
    { role: 'Registrar', module: 'Admissions', view: true, create: true, edit: true, approve: true },
  ]);

  readonly presentCount = computed(() => this.register().filter((r) => r.status === 'P' || r.status === 'L').length);
  readonly absentCount = computed(() => this.register().filter((r) => r.status === 'A').length);

  saveSchool(patch: Partial<SchoolProfile>) {
    this.school.update((s) => ({ ...s, ...patch }));
  }

  addCampus(name: string, city: string, focus: string) {
    this.campuses.update((list) => [{ id: Date.now(), name, city, focus }, ...list]);
  }

  addHouse(name: string, colour: string) {
    this.houses.update((list) => [{ id: Date.now(), name, colour, members: 0 }, ...list]);
  }

  addEvent(title: string, date: string, type: string, audience: string) {
    this.events.update((list) => [{ id: Date.now(), title, date, type, audience }, ...list]);
  }

  setMark(adm: string, status: Mark) {
    this.register.update((list) => list.map((r) => (r.adm === adm ? { ...r, status } : r)));
  }

  markAll(status: Mark, cls?: string) {
    this.register.update((list) => list.map((r) => (!cls || r.cls === cls ? { ...r, status } : r)));
  }

  addToRegister(row: AttendanceRow) {
    this.register.update((list) => (list.some((r) => r.adm === row.adm) ? list : [...list, row]));
  }

  addStock(name: string, category: string, qty: number, location: string) {
    this.stock.update((list) => [{ id: Date.now(), name, category, qty, location }, ...list]);
  }

  issueStock(id: number, qty: number) {
    this.stock.update((list) => list.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty - qty) } : i)));
  }

  addVisit(adm: string, name: string, reason: string, action: string) {
    this.visits.update((list) => [
      { id: Date.now(), adm, name, reason, action, time: 'Just now', notified: false },
      ...list,
    ]);
  }

  notifyParent(id: number) {
    this.visits.update((list) => list.map((v) => (v.id === id ? { ...v, notified: true } : v)));
  }

  addQuestion(q: Omit<Question, 'id'>) {
    this.questions.update((list) => [{ id: Date.now(), ...q }, ...list]);
  }

  addExamRoom(room: string, exam: string, capacity: number, invigilator: string) {
    this.examRooms.update((list) => [{ id: Date.now(), room, exam, capacity, seated: 0, invigilator }, ...list]);
  }

  addCms(title: string) {
    this.cms.update((list) => [{ id: Date.now(), title, status: 'Draft', updated: today }, ...list]);
  }

  publishCms(id: number) {
    this.cms.update((list) => list.map((p) => (p.id === id ? { ...p, status: 'Published', updated: today } : p)));
  }

  addApplicant(row: Omit<Applicant, 'id' | 'stage' | 'meta'> & Partial<Pick<Applicant, 'stage' | 'meta'>>) {
    const name = (row.firstName + ' ' + row.lastName).trim() || row.name;
    this.applicants.update((list) => [
      { ...row, id: Date.now(), name, stage: row.stage ?? 'applied', meta: row.meta ?? 'Submitted today' },
      ...list,
    ]);
  }

  moveApplicant(id: number, stage: ApplicantStage, meta: string) {
    this.applicants.update((list) => list.map((a) => (a.id === id ? { ...a, stage, meta } : a)));
  }

  togglePerm(role: string, module: string, key: 'view' | 'create' | 'edit' | 'approve') {
    this.perms.update((list) =>
      list.map((p) => (p.role === role && p.module === module ? { ...p, [key]: !p[key] } : p)),
    );
  }
}
