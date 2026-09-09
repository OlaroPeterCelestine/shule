import { Injectable, signal } from '@angular/core';
import type { Student } from './models';

@Injectable({ providedIn: 'root' })
export class StudentsStore {
  readonly students = signal<Student[]>([
    {
      adm: 'LR-2291', name: 'Nakiwala Faith', firstName: 'Faith', lastName: 'Nakiwala', cls: 'S4 East',
      gender: 'Female', dob: '2009-03-14', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2023-02-06', admissionType: 'Continuing', previousSchool: 'Little Royals — P7',
      guardian: 'Rose Nakiwala', guardianRelation: 'Mother', guardianPhone: '+256 772 445 210',
      guardianEmail: 'rose.nakiwala@gmail.com', address: 'Ntinda, Kampala',
      emergencyName: 'James Nakiwala', emergencyPhone: '+256 701 220 118',
      bloodGroup: 'O+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 2 — Kireka', hostel: '',
      attendance: '96%', fee: 'cleared', feeLabel: 'Cleared', notes: 'Selected for national science fair.',
    },
    {
      adm: 'LR-1187', name: 'Namutebi Racheal', firstName: 'Racheal', lastName: 'Namutebi', cls: 'S5 Arts',
      gender: 'Female', dob: '2008-07-22', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2021-01-18', admissionType: 'Continuing', previousSchool: 'St. Mary’s Kisubi',
      guardian: 'Joseph Namutebi', guardianRelation: 'Father', guardianPhone: '+256 774 881 902',
      guardianEmail: 'j.namutebi@gmail.com', address: 'Naalya, Wakiso',
      emergencyName: 'Jane Namutebi', emergencyPhone: '+256 752 441 009',
      bloodGroup: 'A+', allergies: 'Peanuts', medicalNotes: 'Carries an EpiPen',
      residentType: 'Boarder', transportRoute: '', hostel: "St. Mary's — B14",
      attendance: '88%', fee: 'due', feeLabel: '620,000 due',
    },
    {
      adm: 'LR-0894', name: 'Okello Derrick', firstName: 'Derrick', lastName: 'Okello', cls: 'S2 East',
      gender: 'Male', dob: '2011-11-03', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2024-01-22', admissionType: 'Transfer', previousSchool: 'Kitante Primary',
      guardian: 'Peter Okello', guardianRelation: 'Father', guardianPhone: '+256 780 334 551',
      guardianEmail: 'p.okello@gmail.com', address: 'Bweyogerere',
      emergencyName: 'Mary Okello', emergencyPhone: '+256 703 119 440',
      bloodGroup: 'B+', allergies: 'None', medicalNotes: '',
      residentType: 'Day', transportRoute: 'Route 3 — Bweyogerere', hostel: '',
      attendance: '91%', fee: 'due', feeLabel: '540,000 due',
    },
    {
      adm: 'LR-2456', name: 'Achieng Patricia', firstName: 'Patricia', lastName: 'Achieng', cls: 'P7 Blue',
      gender: 'Female', dob: '2013-05-19', nationality: 'Ugandan', religion: 'Christian',
      admissionDate: '2022-02-01', admissionType: 'New', previousSchool: 'Home',
      guardian: 'Susan Achieng', guardianRelation: 'Mother', guardianPhone: '+256 772 990 214',
      guardianEmail: 's.achieng@gmail.com', address: 'Namugongo',
      emergencyName: 'Paul Achieng', emergencyPhone: '+256 756 228 771',
      bloodGroup: 'O-', allergies: 'Dust', medicalNotes: 'Mild asthma — inhaler at nurse',
      residentType: 'Day', transportRoute: 'Route 4 — Namugongo', hostel: '',
      attendance: '99%', fee: 'due', feeLabel: '480,000 due',
    },
  ]);

  add(student: Student) {
    this.students.update((list) => [student, ...list]);
  }
}
