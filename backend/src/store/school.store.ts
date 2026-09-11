import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  APPLICANTS,
  EVENTS,
  INVOICES,
  PERMS,
  REGISTER,
  SCHOOL,
  STAFF,
  STOCK,
  STUDENTS,
  VISITS,
} from '../data/seed.js';
import { allowed, CLASSES, cleanText, isIsoDate, isPhone, MARKS, SEX, STAGES } from '../util/form-safe.js';

@Injectable()
export class SchoolStore {
  school = { ...SCHOOL };
  students = structuredClone(STUDENTS);
  applicants = structuredClone(APPLICANTS);
  register = structuredClone(REGISTER);
  invoices = structuredClone(INVOICES);
  stock = structuredClone(STOCK);
  visits = structuredClone(VISITS);
  events = structuredClone(EVENTS);
  staff = structuredClone(STAFF);
  perms = structuredClone(PERMS);

  saveSchool(body: Record<string, unknown>) {
    const next = { ...this.school };
    for (const key of ['name', 'motto', 'address', 'phone', 'email', 'website', 'year', 'term'] as const) {
      if (body[key] !== undefined) next[key] = cleanText(body[key], key === 'address' ? 120 : 80);
    }
    if (next.year && !/^\d{4}$/.test(next.year)) throw new BadRequestException('Year must be four digits');
    this.school = next;
    return this.school;
  }

  addStudent(body: Record<string, unknown>) {
    const firstName = cleanText(body.firstName, 40);
    const lastName = cleanText(body.lastName, 40);
    const cls = cleanText(body.cls, 40);
    const guardian = cleanText(body.guardian, 60);
    const guardianPhone = cleanText(body.guardianPhone, 16);
    const gender = cleanText(body.gender, 16);
    const dob = cleanText(body.dob, 10);
    if (!firstName || !lastName) throw new BadRequestException('First and last name are required');
    if (!allowed(cls, CLASSES)) throw new BadRequestException('Choose a valid class');
    if (gender && !allowed(gender, SEX)) throw new BadRequestException('Choose a valid gender');
    if (dob && !isIsoDate(dob, 2008, 2026)) throw new BadRequestException('Date of birth is not valid');
    if (guardianPhone && !isPhone(guardianPhone)) throw new BadRequestException('Guardian phone must be a Uganda mobile number');
    const adm = this.nextAdm(cleanText(body.adm, 8).toUpperCase());
    const row = {
      adm,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      cls,
      gender: allowed(gender, SEX) ? gender : 'Female',
      dob,
      guardian,
      guardianPhone,
      attendance: '—',
      fee: 'due',
      feeLabel: 'Not yet invoiced',
    };
    this.students.unshift(row);
    this.register.push({ adm, name: row.name, cls, status: 'P' });
    return row;
  }

  addApplicant(body: Record<string, unknown>) {
    const firstName = cleanText(body.firstName, 40);
    const lastName = cleanText(body.lastName, 40);
    const cls = cleanText(body.cls, 40);
    if (!firstName || !lastName) throw new BadRequestException('First and last name are required');
    if (!allowed(cls, CLASSES)) throw new BadRequestException('Choose a valid class');
    const fatherPhone = cleanText(body.fatherPhone, 16);
    const motherPhone = cleanText(body.motherPhone, 16);
    if (fatherPhone && !isPhone(fatherPhone)) throw new BadRequestException('Father phone is not valid');
    if (motherPhone && !isPhone(motherPhone)) throw new BadRequestException('Mother phone is not valid');
    const adm = this.nextAdm(cleanText(body.adm, 8).toUpperCase());
    const row = {
      id: Date.now(),
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      cls,
      stage: 'applied',
      meta: 'Adm. no. ' + adm,
      lin: cleanText(body.lin, 20),
      adm,
      fatherName: cleanText(body.fatherName, 60),
      motherName: cleanText(body.motherName, 60),
      fatherPhone,
      motherPhone,
    };
    this.applicants.unshift(row);
    return row;
  }

  moveApplicant(id: number, stage: string, meta: string) {
    const row = this.applicants.find((a) => a.id === id);
    if (!row) throw new NotFoundException('Applicant not found');
    if (!allowed(stage, STAGES)) throw new BadRequestException('Unknown application stage');
    row.stage = stage;
    row.meta = cleanText(meta, 80) || row.meta;
    if (stage === 'enrolled' && !row.adm) row.adm = this.nextAdm();
    return row;
  }

  setMark(adm: string, status: string) {
    const row = this.register.find((r) => r.adm === adm);
    if (!row) throw new NotFoundException('Pupil not on today’s register');
    const mark = status.toUpperCase();
    if (!allowed(mark, MARKS)) throw new BadRequestException('Mark must be P, A, L or E');
    row.status = mark;
    return row;
  }

  addVisit(body: Record<string, unknown>) {
    const adm = cleanText(body.adm, 12);
    const student = this.students.find((s) => s.adm === adm);
    if (!student) throw new NotFoundException('Student not found');
    const row = {
      id: Date.now(),
      adm,
      name: student.name,
      reason: cleanText(body.reason, 80) || 'Visit',
      action: cleanText(body.action, 120) || 'Observed',
      time: 'Just now',
      notified: false,
    };
    this.visits.unshift(row);
    return row;
  }

  issueStock(id: number, qty: number) {
    const row = this.stock.find((i) => i.id === id);
    if (!row) throw new NotFoundException('Stock item not found');
    const n = Number(qty);
    if (!Number.isFinite(n) || n < 1) throw new BadRequestException('Quantity must be at least 1');
    row.qty = Math.max(0, row.qty - Math.floor(n));
    return row;
  }

  reports() {
    const due = this.students.filter((s) => s.fee === 'due').length;
    const present = this.register.filter((r) => r.status === 'P' || r.status === 'L').length;
    return {
      school: this.school.name,
      term: this.school.term,
      year: this.school.year,
      generated: new Date().toISOString(),
      pupils: this.students.length,
      applications: this.applicants.length,
      dueFees: due,
      attendanceMarked: this.register.length,
      present,
      invoices: this.invoices.length,
    };
  }

  reportCards() {
    return this.students.map((s) => {
      const seed = [...s.adm].reduce((n, c) => n + c.charCodeAt(0), 0);
      const average = 60 + (seed % 35);
      const grade = average >= 80 ? 'A' : average >= 70 ? 'B' : average >= 60 ? 'C' : 'D';
      return { adm: s.adm, name: s.name, cls: s.cls, average, grade };
    });
  }

  private nextAdm(requested = '') {
    const year = this.school.year || '2026';
    const code = year.slice(-2);
    const prefix = 'LR' + code;
    const ok = new RegExp('^' + prefix + '\\d{3}$').test(requested);
    const taken = new Set([
      ...this.students.map((s) => s.adm),
      ...this.applicants.map((a) => a.adm).filter(Boolean),
    ]);
    if (ok && !taken.has(requested)) return requested;
    let max = 0;
    for (const adm of taken) {
      const m = String(adm).match(new RegExp('^' + prefix + '(\\d{3})$'));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return prefix + String(max + 1).padStart(3, '0');
  }
}
