import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service.js';
import { allowed, CLASSES, cleanText, isIsoDate, isPhone, MARKS, SEX, STAGES } from '../util/form-safe.js';

@Injectable()
export class SchoolStore {
  constructor(private readonly db: DbService) {}

  async school() {
    const row = await this.db.one('SELECT name, motto, address, phone, email, website, year, term FROM school WHERE id = 1');
    if (!row) throw new NotFoundException('School profile missing');
    return row;
  }

  async saveSchool(body: Record<string, unknown>) {
    const current = await this.school();
    const next = { ...current };
    for (const key of ['name', 'motto', 'address', 'phone', 'email', 'website', 'year', 'term'] as const) {
      if (body[key] !== undefined) next[key] = cleanText(body[key], key === 'address' ? 120 : 80);
    }
    if (next.year && !/^\d{4}$/.test(next.year)) throw new BadRequestException('Year must be four digits');
    await this.db.query(
      `UPDATE school SET name=$1, motto=$2, address=$3, phone=$4, email=$5, website=$6, year=$7, term=$8 WHERE id = 1`,
      [next.name, next.motto, next.address, next.phone, next.email, next.website, next.year, next.term],
    );
    return next;
  }

  async students() {
    const rows = await this.db.query(
      `SELECT adm, first_name, last_name, name, cls, gender, to_char(dob, 'YYYY-MM-DD') AS dob,
              guardian, guardian_phone, attendance, fee, fee_label
       FROM students ORDER BY name`,
    );
    return rows.map(mapStudent);
  }

  async student(adm: string) {
    const row = await this.db.one(
      `SELECT adm, first_name, last_name, name, cls, gender, to_char(dob, 'YYYY-MM-DD') AS dob,
              guardian, guardian_phone, attendance, fee, fee_label
       FROM students WHERE adm = $1`,
      [adm],
    );
    return row ? mapStudent(row) : null;
  }

  async addStudent(body: Record<string, unknown>) {
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
    const adm = await this.nextAdm(cleanText(body.adm, 8).toUpperCase());
    const name = `${firstName} ${lastName}`;
    await this.db.query(
      `INSERT INTO students (adm, first_name, last_name, name, cls, gender, dob, guardian, guardian_phone, attendance, fee, fee_label)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'—','due','Not yet invoiced')`,
      [adm, firstName, lastName, name, cls, allowed(gender, SEX) ? gender : 'Female', dob || null, guardian, guardianPhone],
    );
    await this.db.query('INSERT INTO attendance (adm, name, cls, status) VALUES ($1,$2,$3,$4)', [adm, name, cls, 'P']);
    return this.student(adm);
  }

  async applicants() {
    const rows = await this.db.query(
      `SELECT id, adm, first_name, last_name, name, cls, stage, meta, lin, father_name, mother_name, father_phone, mother_phone
       FROM applicants ORDER BY id DESC`,
    );
    return rows.map(mapApplicant);
  }

  async applicant(id: string) {
    const row = await this.db.one(
      `SELECT id, adm, first_name, last_name, name, cls, stage, meta, lin, father_name, mother_name, father_phone, mother_phone
       FROM applicants WHERE id = $1`,
      [id],
    );
    return row ? mapApplicant(row) : null;
  }

  async addApplicant(body: Record<string, unknown>) {
    const firstName = cleanText(body.firstName, 40);
    const lastName = cleanText(body.lastName, 40);
    const cls = cleanText(body.cls, 40);
    if (!firstName || !lastName) throw new BadRequestException('First and last name are required');
    if (!allowed(cls, CLASSES)) throw new BadRequestException('Choose a valid class');
    const fatherPhone = cleanText(body.fatherPhone, 16);
    const motherPhone = cleanText(body.motherPhone, 16);
    if (fatherPhone && !isPhone(fatherPhone)) throw new BadRequestException('Father phone is not valid');
    if (motherPhone && !isPhone(motherPhone)) throw new BadRequestException('Mother phone is not valid');
    const adm = await this.nextAdm(cleanText(body.adm, 8).toUpperCase());
    const name = `${firstName} ${lastName}`;
    const row = await this.db.one(
      `INSERT INTO applicants (adm, first_name, last_name, name, cls, stage, meta, lin, father_name, mother_name, father_phone, mother_phone)
       VALUES ($1,$2,$3,$4,$5,'applied',$6,$7,$8,$9,$10,$11)
       RETURNING id, adm, first_name, last_name, name, cls, stage, meta, lin, father_name, mother_name, father_phone, mother_phone`,
      [
        adm,
        firstName,
        lastName,
        name,
        cls,
        'Adm. no. ' + adm,
        cleanText(body.lin, 20),
        cleanText(body.fatherName, 60),
        cleanText(body.motherName, 60),
        fatherPhone,
        motherPhone,
      ],
    );
    return mapApplicant(row!);
  }

  async moveApplicant(id: number, stage: string, meta: string) {
    if (!allowed(stage, STAGES)) throw new BadRequestException('Unknown application stage');
    const current = await this.applicant(String(id));
    if (!current) throw new NotFoundException('Applicant not found');
    let adm = current.adm || null;
    if (stage === 'enrolled' && !adm) adm = await this.nextAdm();
    const row = await this.db.one(
      `UPDATE applicants SET stage=$2, meta=$3, adm=COALESCE($4, adm)
       WHERE id = $1
       RETURNING id, adm, first_name, last_name, name, cls, stage, meta, lin, father_name, mother_name, father_phone, mother_phone`,
      [id, stage, cleanText(meta, 80) || current.meta, adm],
    );
    return mapApplicant(row!);
  }

  async register() {
    return this.db.query('SELECT adm, name, cls, status FROM attendance ORDER BY cls, name');
  }

  async setMark(adm: string, status: string) {
    const mark = status.toUpperCase();
    if (!allowed(mark, MARKS)) throw new BadRequestException('Mark must be P, A, L or E');
    const row = await this.db.one(
      'UPDATE attendance SET status = $2 WHERE adm = $1 RETURNING adm, name, cls, status',
      [adm, mark],
    );
    if (!row) throw new NotFoundException('Pupil not on today’s register');
    return row;
  }

  async invoices() {
    return this.db.query('SELECT id, student, total, paid, balance, status FROM invoices ORDER BY id');
  }

  async invoice(id: string) {
    return this.db.one('SELECT id, student, total, paid, balance, status FROM invoices WHERE id = $1', [id]);
  }

  async stock() {
    return this.db.query('SELECT id, name, category, qty, location FROM stock ORDER BY id');
  }

  async issueStock(id: number, qty: number) {
    const n = Number(qty);
    if (!Number.isFinite(n) || n < 1) throw new BadRequestException('Quantity must be at least 1');
    const row = await this.db.one(
      'UPDATE stock SET qty = GREATEST(0, qty - $2) WHERE id = $1 RETURNING id, name, category, qty, location',
      [id, Math.floor(n)],
    );
    if (!row) throw new NotFoundException('Stock item not found');
    return row;
  }

  async visits() {
    return this.db.query('SELECT id, adm, name, reason, action, time, notified FROM visits ORDER BY id DESC');
  }

  async addVisit(body: Record<string, unknown>) {
    const adm = cleanText(body.adm, 12);
    const student = await this.student(adm);
    if (!student) throw new NotFoundException('Student not found');
    const row = await this.db.one(
      `INSERT INTO visits (adm, name, reason, action, time, notified)
       VALUES ($1,$2,$3,$4,'Just now', false)
       RETURNING id, adm, name, reason, action, time, notified`,
      [adm, student.name, cleanText(body.reason, 80) || 'Visit', cleanText(body.action, 120) || 'Observed'],
    );
    return row;
  }

  async events() {
    return this.db.query('SELECT id, title, date, type, audience FROM events ORDER BY id');
  }

  async staff() {
    return this.db.query('SELECT id, name, role, dept, status FROM staff ORDER BY name');
  }

  async perms() {
    const rows = await this.db.query(
      'SELECT role, module, can_view, can_create, can_edit, can_approve FROM perms ORDER BY role, module',
    );
    return rows.map((p) => ({
      role: p.role,
      module: p.module,
      view: p.can_view,
      create: p.can_create,
      edit: p.can_edit,
      approve: p.can_approve,
    }));
  }

  async reports() {
    const row = await this.db.one<{
      school: string;
      term: string;
      year: string;
      pupils: string;
      applications: string;
      due_fees: string;
      attendance_marked: string;
      present: string;
      invoices: string;
    }>(`
      SELECT
        (SELECT name FROM school WHERE id = 1) AS school,
        (SELECT term FROM school WHERE id = 1) AS term,
        (SELECT year FROM school WHERE id = 1) AS year,
        (SELECT count(*)::text FROM students) AS pupils,
        (SELECT count(*)::text FROM applicants) AS applications,
        (SELECT count(*)::text FROM students WHERE fee = 'due') AS due_fees,
        (SELECT count(*)::text FROM attendance) AS attendance_marked,
        (SELECT count(*)::text FROM attendance WHERE status IN ('P', 'L')) AS present,
        (SELECT count(*)::text FROM invoices) AS invoices
    `);
    return {
      school: row?.school,
      term: row?.term,
      year: row?.year,
      generated: new Date().toISOString(),
      pupils: Number(row?.pupils ?? 0),
      applications: Number(row?.applications ?? 0),
      dueFees: Number(row?.due_fees ?? 0),
      attendanceMarked: Number(row?.attendance_marked ?? 0),
      present: Number(row?.present ?? 0),
      invoices: Number(row?.invoices ?? 0),
    };
  }

  async reportCards() {
    const students = await this.students();
    return students.map((s) => {
      const seed = [...String(s.adm)].reduce((n, c) => n + c.charCodeAt(0), 0);
      const average = 60 + (seed % 35);
      const grade = average >= 80 ? 'A' : average >= 70 ? 'B' : average >= 60 ? 'C' : 'D';
      return { adm: s.adm, name: s.name, cls: s.cls, average, grade };
    });
  }

  private async nextAdm(requested = '') {
    const school = await this.school();
    const prefix = 'LR' + (school.year || '2026').slice(-2);
    const ok = new RegExp('^' + prefix + '\\d{3}$').test(requested);
    if (ok) {
      const taken = await this.db.one(
        `SELECT 1 AS x FROM students WHERE adm = $1
         UNION ALL
         SELECT 1 FROM applicants WHERE adm = $1
         LIMIT 1`,
        [requested],
      );
      if (!taken) return requested;
    }
    const row = await this.db.one<{ n: string }>(
      `SELECT COALESCE(MAX(SUBSTRING(adm FROM $2::int FOR 3)::int), 0)::text AS n
       FROM (
         SELECT adm FROM students WHERE adm ~ ('^' || $1 || '[0-9]{3}$')
         UNION ALL
         SELECT adm FROM applicants WHERE adm ~ ('^' || $1 || '[0-9]{3}$')
       ) t`,
      [prefix, prefix.length + 1],
    );
    return prefix + String(Number(row?.n ?? 0) + 1).padStart(3, '0');
  }
}

function mapStudent(r: Record<string, unknown>) {
  return {
    adm: r.adm,
    name: r.name,
    firstName: r.first_name,
    lastName: r.last_name,
    cls: r.cls,
    gender: r.gender,
    dob: r.dob ?? '',
    guardian: r.guardian,
    guardianPhone: r.guardian_phone,
    attendance: r.attendance,
    fee: r.fee,
    feeLabel: r.fee_label,
  };
}

function mapApplicant(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    adm: r.adm ?? '',
    name: r.name,
    firstName: r.first_name,
    lastName: r.last_name,
    cls: r.cls,
    stage: r.stage,
    meta: r.meta,
    lin: r.lin,
    fatherName: r.father_name,
    motherName: r.mother_name,
    fatherPhone: r.father_phone,
    motherPhone: r.mother_phone,
  };
}
