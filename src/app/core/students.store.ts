import { Injectable, signal } from '@angular/core';
import { SCHOOL_ABBREV, type Student } from './models';

export function parseAdmNum(adm: string, year?: string): number {
  if (year) {
    const m = String(adm).match(new RegExp('^' + SCHOOL_ABBREV + year + '(\\d{3})$'));
    return m ? parseInt(m[1], 10) : 0;
  }
  const m = String(adm).match(new RegExp('^' + SCHOOL_ABBREV + '\\d{4}(\\d{3})$'));
  if (m) return parseInt(m[1], 10);
  const n = parseInt(String(adm).replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

export function formatAdm(n: number, year = '2026'): string {
  return SCHOOL_ABBREV + year + String(Math.max(1, Math.floor(n))).padStart(3, '0');
}

@Injectable({ providedIn: 'root' })
export class StudentsStore {
  readonly students = signal<Student[]>([
    {
      adm: 'LR-1104', name: 'Kirabo Amani', firstName: 'Amani', lastName: 'Kirabo', cls: 'Baby class',
      gender: 'Female', dob: '2023-02-11', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2026-01-20', admissionType: 'New', previousSchool: 'Home',
      guardian: 'Sarah Kirabo', guardianRelation: 'Mother', guardianPhone: '+256 772 101 440',
      guardianEmail: 's.kirabo@gmail.com', address: 'Seguku',
      emergencyName: 'Paul Kirabo', emergencyPhone: '+256 701 118 220',
      bloodGroup: 'O+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 1 — Ntinda', hostel: '',
      attendance: '97%', fee: 'cleared', feeLabel: 'Cleared',
    },
    {
      adm: 'LR-1208', name: 'Wasswa Ethan', firstName: 'Ethan', lastName: 'Wasswa', cls: 'Middle class',
      gender: 'Male', dob: '2022-06-04', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2025-02-03', admissionType: 'Continuing', previousSchool: 'Little Royals — Baby',
      guardian: 'Mary Wasswa', guardianRelation: 'Mother', guardianPhone: '+256 754 220 118',
      guardianEmail: 'm.wasswa@gmail.com', address: 'Kigo',
      emergencyName: 'John Wasswa', emergencyPhone: '+256 772 334 009',
      bloodGroup: 'A+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 2 — Kireka', hostel: '',
      attendance: '94%', fee: 'due', feeLabel: '320,000 due',
    },
    {
      adm: 'LR-1312', name: 'Nabatanzi Joy', firstName: 'Joy', lastName: 'Nabatanzi', cls: 'Top class',
      gender: 'Female', dob: '2021-09-18', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2024-01-22', admissionType: 'Continuing', previousSchool: 'Little Royals — Middle',
      guardian: 'Ruth Nabatanzi', guardianRelation: 'Mother', guardianPhone: '+256 772 100 221',
      guardianEmail: 'r.nabatanzi@gmail.com', address: 'Namugongo',
      emergencyName: 'David Nabatanzi', emergencyPhone: '+256 703 441 880',
      bloodGroup: 'B+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 4 — Namugongo', hostel: '',
      attendance: '98%', fee: 'cleared', feeLabel: 'Cleared',
    },
    {
      adm: 'LR-1402', name: 'Kato Brian', firstName: 'Brian', lastName: 'Kato', cls: 'Primary One',
      gender: 'Male', dob: '2019-11-02', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2026-01-20', admissionType: 'New', previousSchool: 'Little Royals — Top',
      guardian: 'Grace Kato', guardianRelation: 'Mother', guardianPhone: '+256 701 334 110',
      guardianEmail: 'g.kato@gmail.com', address: 'Bweyogerere',
      emergencyName: 'Peter Kato', emergencyPhone: '+256 752 118 440',
      bloodGroup: 'O+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 3 — Bweyogerere', hostel: '',
      attendance: '93%', fee: 'due', feeLabel: '410,000 due',
    },
    {
      adm: 'LR-1520', name: 'Nailah Kasumbakali', firstName: 'Nailah', lastName: 'Kasumbakali', cls: 'Primary Two',
      gender: 'Female', dob: '2019-09-11', nationality: 'Ugandan', religion: 'Muslim',
      admissionDate: '2026-02-01', admissionType: 'New', previousSchool: 'Home',
      guardian: 'Nahidah Kasumbakali Kellen', guardianRelation: 'Mother', guardianPhone: '0742871325',
      guardianEmail: 'n.kasumbakali@gmail.com', address: 'Kigo',
      emergencyName: 'Kasumbakali Umar', emergencyPhone: '07002304080',
      bloodGroup: 'A+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Van — pick & drop', hostel: '',
      attendance: '99%', fee: 'cleared', feeLabel: 'Cleared', notes: 'Paper admission form on file.',
    },
    {
      adm: 'LR-0894', name: 'Okello Derrick', firstName: 'Derrick', lastName: 'Okello', cls: 'Primary Three',
      gender: 'Male', dob: '2018-11-03', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2024-01-22', admissionType: 'Transfer', previousSchool: 'Kitante Primary',
      guardian: 'Peter Okello', guardianRelation: 'Father', guardianPhone: '+256 780 334 551',
      guardianEmail: 'p.okello@gmail.com', address: 'Bweyogerere',
      emergencyName: 'Mary Okello', emergencyPhone: '+256 703 119 440',
      bloodGroup: 'B+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 3 — Bweyogerere', hostel: '',
      attendance: '91%', fee: 'due', feeLabel: '540,000 due',
    },
    {
      adm: 'LR-1688', name: 'Namuli Grace', firstName: 'Grace', lastName: 'Namuli', cls: 'Primary Four',
      gender: 'Female', dob: '2017-04-21', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2023-02-06', admissionType: 'Continuing', previousSchool: 'Little Royals — P3',
      guardian: 'James Namuli', guardianRelation: 'Father', guardianPhone: '+256 772 880 114',
      guardianEmail: 'j.namuli@gmail.com', address: 'Ntinda, Kampala',
      emergencyName: 'Agnes Namuli', emergencyPhone: '+256 701 220 330',
      bloodGroup: 'O+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 1 — Ntinda', hostel: '',
      attendance: '95%', fee: 'cleared', feeLabel: 'Cleared',
    },
    {
      adm: 'LR-2291', name: 'Nakiwala Faith', firstName: 'Faith', lastName: 'Nakiwala', cls: 'Primary Five',
      gender: 'Female', dob: '2015-03-14', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2023-02-06', admissionType: 'Continuing', previousSchool: 'Little Royals — P4',
      guardian: 'Rose Nakiwala', guardianRelation: 'Mother', guardianPhone: '+256 772 445 210',
      guardianEmail: 'rose.nakiwala@gmail.com', address: 'Ntinda, Kampala',
      emergencyName: 'James Nakiwala', emergencyPhone: '+256 701 220 118',
      bloodGroup: 'O+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 2 — Kireka', hostel: '',
      attendance: '96%', fee: 'cleared', feeLabel: 'Cleared', notes: 'Selected for the inter-school quiz.',
    },
    {
      adm: 'LR-2456', name: 'Achieng Patricia', firstName: 'Patricia', lastName: 'Achieng', cls: 'Primary Six',
      gender: 'Female', dob: '2014-05-19', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2022-02-01', admissionType: 'New', previousSchool: 'Home',
      guardian: 'Susan Achieng', guardianRelation: 'Mother', guardianPhone: '+256 772 990 214',
      guardianEmail: 's.achieng@gmail.com', address: 'Namugongo',
      emergencyName: 'Paul Achieng', emergencyPhone: '+256 756 228 771',
      bloodGroup: 'O-', allergies: 'Dust', medicalNotes: 'Mild asthma — inhaler at nurse',
      residentType: 'Day', transportRoute: 'Route 4 — Namugongo', hostel: '',
      attendance: '99%', fee: 'due', feeLabel: '480,000 due',
    },
    {
      adm: 'LR-1187', name: 'Namutebi Racheal', firstName: 'Racheal', lastName: 'Namutebi', cls: 'Primary Seven',
      gender: 'Female', dob: '2013-07-22', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2021-01-18', admissionType: 'Continuing', previousSchool: 'Little Royals — P6',
      guardian: 'Joseph Namutebi', guardianRelation: 'Father', guardianPhone: '+256 774 881 902',
      guardianEmail: 'j.namutebi@gmail.com', address: 'Naalya, Wakiso',
      emergencyName: 'Jane Namutebi', emergencyPhone: '+256 752 441 009',
      bloodGroup: 'A+', allergies: 'Peanuts', medicalNotes: 'Carries an EpiPen',
      residentType: 'Day', transportRoute: 'Route 2 — Kireka', hostel: '',
      attendance: '88%', fee: 'due', feeLabel: '620,000 due',
    },
  ]);

  add(student: Student) {
    this.students.update((list) => [student, ...list]);
  }

  hasAdm(adm: string) {
    return this.students().some((s) => s.adm === adm);
  }

  nextNumber(extra: string[] = [], year = '2026'): number {
    const nums = [
      ...this.students().map((s) => parseAdmNum(s.adm, year)),
      ...extra.map((a) => parseAdmNum(a, year)),
    ];
    return Math.max(0, ...nums) + 1;
  }

  nextAdm(extra: string[] = [], year = '2026'): string {
    return formatAdm(this.nextNumber(extra, year), year);
  }
}
