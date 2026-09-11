import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { SchoolStore } from '../store/school.store.js';
import { DOC_TYPES } from './catalog.js';

export interface PdfQuery {
  adm?: string;
  staff?: string;
  visit?: string;
  applicant?: string;
  name?: string;
}

@Injectable()
export class PdfService {
  constructor(private readonly store: SchoolStore) {}

  catalog() {
    return DOC_TYPES;
  }

  async build(key: string, query: PdfQuery) {
    const type = DOC_TYPES.find((d) => d.key === key);
    if (!type) throw new NotFoundException('Unknown document');
    const school = (await this.store.school()) as Record<string, string>;
    const buffer = await this.render(key, school, query);
    const who = slug(query.adm || query.staff || query.visit || query.applicant || query.name || 'document');
    return { buffer, filename: `little-royals-${key}-${who}.pdf`, title: type.title };
  }

  private async render(key: string, school: Record<string, string>, q: PdfQuery) {
    switch (key) {
      case 'report-card':
        return this.reportCard(school, await this.requireStudent(q.adm));
      case 'sick-leave':
        return this.sickLeave(school, await this.requireVisit(q.visit, q.adm));
      case 'staff-leave':
        return this.staffLeave(school, await this.requireStaff(q.staff));
      case 'student-id':
        return this.studentId(school, await this.requireStudent(q.adm));
      case 'admission-letter':
        return this.admissionLetter(school, await this.requireApplicant(q.applicant));
      case 'transfer-certificate':
        return this.transfer(school, await this.requireStudent(q.adm));
      case 'completion-certificate':
        return this.completion(school, await this.requireStudent(q.adm));
      case 'fee-statement':
        return this.fees(school, await this.requireStudent(q.adm));
      case 'payslip':
        return this.payslip(school, await this.requireStaff(q.staff));
      case 'visitor-badge':
        return this.visitor(school, q.name || 'Campus visitor');
      default:
        throw new BadRequestException('Cannot generate that document');
    }
  }

  private async requireStudent(adm?: string) {
    if (!adm) throw new BadRequestException('Choose a pupil');
    const row = await this.store.student(adm);
    if (!row) throw new NotFoundException('Student not found');
    return row as StudentRow;
  }

  private async requireStaff(id?: string) {
    if (!id) throw new BadRequestException('Choose a staff member');
    const row = (await this.store.staff()).find((s) => String(s.id) === id);
    if (!row) throw new NotFoundException('Staff member not found');
    return row as StaffRow;
  }

  private async requireApplicant(id?: string) {
    if (!id) throw new BadRequestException('Choose an applicant');
    const row = await this.store.applicant(id);
    if (!row) throw new NotFoundException('Applicant not found');
    return row as unknown as ApplicantRow;
  }

  private async requireVisit(id?: string, adm?: string) {
    const visits = await this.store.visits();
    const row = id
      ? visits.find((v) => String(v.id) === id)
      : visits.find((v) => v.adm === adm) ?? visits[0];
    if (!row) throw new NotFoundException('No sickbay visit on file');
    return row as VisitRow;
  }

  private reportCard(school: Record<string, string>, s: StudentRow) {
    const subjects = subjectsFor(s.cls, s.adm);
    const avg = Math.round(subjects.reduce((n, x) => n + x.score, 0) / subjects.length);
    return draw(school, 'End of term report', (doc) => {
      kv(doc, [
        ['Name', s.name],
        ['Admission no.', s.adm],
        ['Class', s.cls],
        ['Gender', String(s.gender || '—')],
        ['Attendance', String(s.attendance || '—')],
        ['Period', `${school.term}, ${school.year}`],
      ]);
      doc.moveDown(0.6).font('Helvetica-Bold').text('Learning areas');
      doc.font('Helvetica');
      table(doc, ['Area', 'Score', 'Grade', 'Remark'], subjects.map((x) => [x.subject, String(x.score), x.grade, x.remark]));
      doc.moveDown(0.8).font('Helvetica-Bold').text(`Overall average  ${avg}    Grade  ${gradeFor(avg)}`);
      doc.font('Helvetica').moveDown(0.4).text('Class teacher: Steady progress this term. Continue reading at home.');
      sign(doc, ['Class teacher', 'Head teacher']);
    });
  }

  private sickLeave(school: Record<string, string>, v: VisitRow) {
    return draw(school, 'Sickbay / sick leave note', (doc) => {
      kv(doc, [
        ['Pupil', v.name],
        ['Admission no.', v.adm],
        ['Time', v.time],
        ['Reason', v.reason],
        ['Action taken', v.action],
        ['Parent notified', v.notified ? 'Yes' : 'Pending'],
      ]);
      doc.moveDown(0.8).text(
        'This note confirms that the pupil was attended to in the school sickbay. They may rest at home and return when well enough for class.',
      );
      sign(doc, ['School nurse', 'Parent / guardian']);
    });
  }

  private staffLeave(school: Record<string, string>, s: StaffRow) {
    return draw(school, 'Staff leave letter', (doc) => {
      kv(doc, [
        ['Staff', s.name],
        ['Staff ID', s.id],
        ['Role', s.role],
        ['Department', s.dept],
        ['Status', s.status],
        ['Period', school.term + ', ' + school.year],
      ]);
      doc.moveDown(0.8).text(
        `This letter confirms leave for ${s.name}. Cover should be arranged in ${s.dept} for the approved dates.`,
      );
      sign(doc, ['Head teacher', 'Staff member']);
    });
  }

  private studentId(school: Record<string, string>, s: StudentRow) {
    return draw(school, 'Student identity card', (doc) => {
      kv(doc, [
        ['Name', s.name],
        ['Admission no.', s.adm],
        ['Class', s.cls],
        ['Guardian', String(s.guardian || '—')],
        ['Valid', `${school.term}, ${school.year}`],
      ]);
      doc.moveDown(0.8).text('Carry this card on campus and on school vans. It is not a fee receipt.');
    }, { size: [400, 280], margin: 28 });
  }

  private admissionLetter(school: Record<string, string>, a: ApplicantRow) {
    return draw(school, 'Offer of admission', (doc) => {
      doc.font('Helvetica').text(`Dear Parent / Guardian of ${a.name},`).moveDown(0.5);
      doc.text(
        `We are pleased to offer ${a.name} a place in ${a.cls} at Little Royals for ${school.term}, ${school.year}.`,
      );
      kv(doc, [
        ['Applicant', a.name],
        ['Class offered', a.cls],
        ['Admission no.', a.adm || 'To be issued on enrolment'],
        ['Stage', a.stage],
      ]);
      doc.moveDown(0.5).text('Please complete enrolment at the registrar’s office within two weeks of this letter.');
      sign(doc, ['Registrar', 'Head teacher']);
    });
  }

  private transfer(school: Record<string, string>, s: StudentRow) {
    return draw(school, 'Transfer certificate', (doc) => {
      doc.text(`This is to certify that ${s.name}, admission no. ${s.adm}, was a bona fide pupil of ${s.cls} and is released in good standing.`);
      kv(doc, [
        ['Fees', String(s.feeLabel || s.fee)],
        ['Attendance', String(s.attendance || '—')],
        ['Date', today()],
      ]);
      sign(doc, ['Class teacher', 'Head teacher']);
    });
  }

  private completion(school: Record<string, string>, s: StudentRow) {
    return draw(school, 'Certificate of completion', (doc) => {
      doc.fontSize(16).font('Helvetica-Bold').text(s.name, { align: 'center' });
      doc.fontSize(11).font('Helvetica').moveDown(0.6).text(
        `has completed the course of study for ${s.cls} in the academic year ${school.year}.`,
        { align: 'center' },
      );
      sign(doc, ['Head teacher', 'Date']);
    });
  }

  private fees(school: Record<string, string>, s: StudentRow) {
    return draw(school, 'Fee statement', (doc) => {
      kv(doc, [
        ['Pupil', s.name],
        ['Admission no.', s.adm],
        ['Class', s.cls],
        ['Status', String(s.fee)],
        ['Balance', String(s.feeLabel)],
        ['Period', `${school.term}, ${school.year}`],
      ]);
      doc.moveDown(0.6).text('Pay through Schoolpay or at the accounts office. This statement is not a receipt.');
    });
  }

  private payslip(school: Record<string, string>, s: StaffRow) {
    return draw(school, 'Staff payslip', (doc) => {
      kv(doc, [
        ['Employee', s.name],
        ['Staff ID', s.id],
        ['Role', s.role],
        ['Department', s.dept],
        ['Month', 'September ' + school.year],
      ]);
      table(doc, ['Item', 'Amount (UGX)'], [
        ['Basic salary', '1,800,000'],
        ['Allowances', '200,000'],
        ['PAYE / NSSF', '−312,000'],
        ['Net pay', '1,688,000'],
      ]);
    });
  }

  private visitor(school: Record<string, string>, name: string) {
    return draw(school, 'Visitor badge', (doc) => {
      doc.fontSize(18).font('Helvetica-Bold').text(name, { align: 'center' });
      doc.fontSize(11).font('Helvetica').moveDown(0.4).text('Valid for today only · ' + today(), { align: 'center' });
      doc.moveDown(0.8).text(school.address, { align: 'center' });
    }, { size: [360, 240], margin: 24 });
  }
}

interface StudentRow {
  adm: string;
  name: string;
  cls: string;
  gender?: string;
  attendance?: string;
  guardian?: string;
  fee?: string;
  feeLabel?: string;
}
interface StaffRow {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: string;
}
interface ApplicantRow {
  name: string;
  cls: string;
  adm?: string;
  stage: string;
}
interface VisitRow {
  name: string;
  adm: string;
  time: string;
  reason: string;
  action: string;
  notified: boolean;
}

function draw(
  school: Record<string, string>,
  subtitle: string,
  body: (doc: PDFKit.PDFDocument) => void,
  page?: { size: [number, number]; margin: number },
) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: page?.size ?? 'A4',
      margin: page?.margin ?? 48,
      info: { Title: subtitle, Author: school.name },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fillColor('#14213D').fontSize(14).font('Helvetica-Bold').text(school.name);
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(school.address);
    doc.text(school.phone + '  ·  ' + school.motto);
    doc.moveDown(0.4).fillColor('#14213D').fontSize(13).font('Helvetica-Bold').text(subtitle);
    doc.moveTo(doc.page.margins.left, doc.y + 6).lineTo(doc.page.width - doc.page.margins.right, doc.y + 6).stroke('#e2e8f0');
    doc.moveDown(1).fontSize(11).font('Helvetica').fillColor('#0f172a');
    body(doc);
    doc.end();
  });
}

function kv(doc: PDFKit.PDFDocument, rows: [string, string][]) {
  doc.moveDown(0.3);
  for (const [k, v] of rows) {
    doc.font('Helvetica').fillColor('#64748b').text(k, { continued: true, width: 160 });
    doc.fillColor('#0f172a').font('Helvetica-Bold').text('  ' + (v || '—'));
  }
  doc.font('Helvetica').fillColor('#0f172a');
}

function table(doc: PDFKit.PDFDocument, headers: string[], rows: string[][]) {
  doc.moveDown(0.4).font('Helvetica-Bold').fontSize(10);
  doc.text(headers.map((h) => h.padEnd(18)).join('  '));
  doc.font('Helvetica');
  for (const row of rows) doc.text(row.map((c) => String(c).padEnd(18)).join('  '));
  doc.fontSize(11);
}

function sign(doc: PDFKit.PDFDocument, labels: string[]) {
  doc.moveDown(2);
  const w = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / labels.length;
  const y = doc.y;
  labels.forEach((label, i) => {
    const x = doc.page.margins.left + i * w;
    doc.moveTo(x, y).lineTo(x + w - 24, y).stroke('#94a3b8');
    doc.fontSize(9).fillColor('#64748b').text(label, x, y + 6);
  });
}

function subjectsFor(cls: string, adm: string) {
  const kg = /baby|middle|top/i.test(cls);
  const names = kg
    ? ['Language', 'Mathematics', 'Discovery', 'Creative', 'Social habits']
    : ['English', 'Mathematics', 'Science', 'Social Studies', 'Literacy'];
  return names.map((subject, i) => {
    const score = 62 + ((adm.charCodeAt(i % adm.length) + i * 7) % 33);
    return { subject, score, grade: gradeFor(score), remark: score >= 75 ? 'Very good' : score >= 65 ? 'Good' : 'Keep working' };
  });
}

function gradeFor(n: number) {
  return n >= 80 ? 'A' : n >= 70 ? 'B' : n >= 60 ? 'C' : 'D';
}

function today() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'document';
}
