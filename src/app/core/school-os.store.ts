import { Injectable, computed, signal } from '@angular/core';
import type { ActivityDef, PermRow, RoleDef } from './models';
import { defaultPerms } from './nav';

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

export interface ExamSitting {
  id: number;
  kind: string;
  title: string;
  cls: string;
  subject: string;
  term: string;
  year: string;
  examDate: string;
  startTime: string;
  duration: number;
  room: string;
  invigilator: string;
  status: string;
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
  fatherSig?: string;
  motherSig?: string;
  guardianSig?: string;
  schoolpay: string;
  transport: string;
  photo: string;
  adm?: string;
  stage: ApplicantStage;
  meta: string;
}

export type { PermRow } from './models';

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
    levels: 'Kindergarten · Primary',
  });

  readonly campuses = signal<Campus[]>([
    { id: 1, name: 'Main campus — Seguku', city: 'Kampala', focus: 'Kindergarten & Primary' },
    { id: 2, name: 'Day van routes', city: 'Greater Kampala', focus: 'Pick & drop' },
  ]);

  readonly houses = signal<House[]>([
    { id: 1, name: 'Eagle', colour: 'Gold', members: 48 },
    { id: 2, name: 'Lion', colour: 'Maroon', members: 46 },
    { id: 3, name: 'Gazelle', colour: 'Green', members: 44 },
    { id: 4, name: 'Crane', colour: 'Blue', members: 48 },
  ]);

  readonly events = signal<SchoolEvent[]>([
    { id: 1, title: 'Mid-term tests', date: '15–19 Sep', type: 'Exams', audience: 'P1–P7' },
    { id: 2, title: 'Parents’ day', date: '26 Sep', type: 'PTM', audience: 'All parents' },
    { id: 3, title: 'Sports day', date: '3 Oct', type: 'Event', audience: 'Whole school' },
    { id: 4, title: 'Term 2 holiday begins', date: '21 Nov', type: 'Holiday', audience: 'All' },
  ]);

  readonly register = signal<AttendanceRow[]>([
    { adm: 'LR-2291', name: 'Nakiwala Faith', cls: 'Primary Five', status: 'P' },
    { adm: 'LR-1187', name: 'Namutebi Racheal', cls: 'Primary Seven', status: 'P' },
    { adm: 'LR-0894', name: 'Okello Derrick', cls: 'Primary Three', status: 'A' },
    { adm: 'LR-2456', name: 'Achieng Patricia', cls: 'Primary Six', status: 'L' },
    { adm: 'LR-1520', name: 'Nailah Kasumbakali', cls: 'Primary Two', status: 'P' },
    { adm: 'LR-1104', name: 'Kirabo Amani', cls: 'Baby class', status: 'P' },
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
    { id: 1, subject: 'Mathematics', topic: 'Place value', type: 'Short answer', difficulty: 'Medium', marks: 4, text: 'Write 347 in expanded form.' },
    { id: 2, subject: 'Science', topic: 'Parts of a plant', type: 'MCQ', difficulty: 'Easy', marks: 2, text: 'Which part of the plant makes food?' },
    { id: 3, subject: 'English', topic: 'Comprehension', type: 'Long answer', difficulty: 'Hard', marks: 10, text: 'Retell the story in your own words.' },
  ]);

  readonly exams = signal<ExamSitting[]>([
    { id: 1, kind: 'Mid-term', title: 'Primary Five Mathematics — mid-term', cls: 'Primary Five', subject: 'Mathematics', term: 'Term 2', year: '2026', examDate: '2026-09-15', startTime: '08:00', duration: 90, room: 'Hall A', invigilator: 'B. Ssentongo', status: 'Scheduled' },
    { id: 2, kind: 'Mid-term', title: 'Primary Five Science — mid-term', cls: 'Primary Five', subject: 'Science', term: 'Term 2', year: '2026', examDate: '2026-09-16', startTime: '08:00', duration: 90, room: 'Hall A', invigilator: 'J. Namutebi', status: 'Scheduled' },
    { id: 3, kind: 'End of term', title: 'Primary Seven English — end of term', cls: 'Primary Seven', subject: 'English', term: 'Term 2', year: '2026', examDate: '2026-11-02', startTime: '08:00', duration: 120, room: 'Hall A', invigilator: 'S. Achieng', status: 'Scheduled' },
  ]);

  readonly examRooms = signal<ExamRoom[]>([
    { id: 1, room: 'Hall A', exam: 'Primary Five Mathematics', capacity: 40, seated: 36, invigilator: 'B. Ssentongo' },
    { id: 2, room: 'Room 4', exam: 'Primary Seven Science', capacity: 36, seated: 34, invigilator: 'J. Namutebi' },
    { id: 3, room: 'Room 12', exam: 'Primary Two English', capacity: 32, seated: 30, invigilator: 'S. Achieng' },
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
      fatherSig: 'Kasumbakali Umar', motherSig: 'Nahidah Kellen', guardianSig: '',
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

  readonly perms = signal<PermRow[]>(defaultPerms());
  readonly roles = signal<RoleDef[]>([
    { key: 'admin', label: 'Admin', locked: true, users: 1 },
    { key: 'teacher', label: 'Teacher', locked: true, users: 1 },
    { key: 'accountant', label: 'Accountant', locked: true, users: 1 },
    { key: 'parent', label: 'Parent', locked: true, users: 1 },
    { key: 'nurse', label: 'Nurse', locked: false, users: 0 },
    { key: 'registrar', label: 'Registrar', locked: false, users: 0 },
  ]);
  readonly activities = signal<ActivityDef[]>([]);

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

  addStock(name: string, category: string, qty: number, location: string, id = Date.now()) {
    this.stock.update((list) => [{ id, name, category, qty, location }, ...list]);
  }

  replaceStock(rows: StockItem[]) {
    this.stock.set(rows);
  }

  issueStock(id: number, qty: number) {
    this.stock.update((list) => list.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty - qty) } : i)));
  }

  addVisit(adm: string, name: string, reason: string, action: string, id = Date.now()) {
    this.visits.update((list) => [
      { id, adm, name, reason, action, time: 'Just now', notified: false },
      ...list,
    ]);
  }

  replaceVisits(rows: SickVisit[]) {
    this.visits.set(rows);
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

  addExam(row: Omit<ExamSitting, 'id'> & Partial<Pick<ExamSitting, 'id'>>) {
    this.exams.update((list) => [{ ...row, id: row.id ?? Date.now() }, ...list]);
  }

  replaceExams(rows: ExamSitting[]) {
    this.exams.set(rows);
  }

  replaceEvents(rows: SchoolEvent[]) {
    this.events.set(rows);
  }

  patchExam(id: number, patch: Partial<ExamSitting>) {
    this.exams.update((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  addCms(title: string) {
    this.cms.update((list) => [{ id: Date.now(), title, status: 'Draft', updated: today }, ...list]);
  }

  publishCms(id: number) {
    this.cms.update((list) => list.map((p) => (p.id === id ? { ...p, status: 'Published', updated: today } : p)));
  }

  replaceApplicants(rows: Applicant[]) {
    this.applicants.set(rows);
  }

  replaceRegister(rows: AttendanceRow[]) {
    this.register.set(rows);
  }

  addApplicant(row: Omit<Applicant, 'id' | 'stage' | 'meta'> & Partial<Pick<Applicant, 'id' | 'stage' | 'meta'>>) {
    const name = (row.firstName + ' ' + row.lastName).trim() || row.name;
    this.applicants.update((list) => [
      { ...row, id: row.id ?? Date.now(), name, stage: row.stage ?? 'applied', meta: row.meta ?? 'Submitted today' },
      ...list,
    ]);
  }

  moveApplicant(id: number, stage: ApplicantStage, meta: string) {
    this.applicants.update((list) => list.map((a) => (a.id === id ? { ...a, stage, meta } : a)));
  }

  patchApplicant(id: number, patch: Partial<Applicant>) {
    this.applicants.update((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  togglePerm(role: string, module: string, key: 'view' | 'create' | 'edit' | 'approve') {
    this.perms.update((list) =>
      list.map((p) => {
        if (p.role !== role || p.module !== module) return p;
        const next = { ...p, [key]: !p[key] };
        if ((next.create || next.edit || next.approve) && !next.view) next.view = true;
        if (!next.view) {
          next.create = false;
          next.edit = false;
          next.approve = false;
        }
        return next;
      }),
    );
  }

  applyPerm(row: PermRow) {
    this.perms.update((list) => {
      const i = list.findIndex((p) => p.role === row.role && p.module === row.module);
      if (i < 0) return [...list, row];
      const next = [...list];
      next[i] = { ...next[i], ...row };
      return next;
    });
  }

  replacePerms(rows: PermRow[]) {
    if (rows.length) this.perms.set(rows);
  }

  replaceRoles(rows: RoleDef[]) {
    if (rows.length) this.roles.set(rows);
  }

  replaceActivities(rows: ActivityDef[]) {
    if (rows.length) this.activities.set(rows);
  }
}
