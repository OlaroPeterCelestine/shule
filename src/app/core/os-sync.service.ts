import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { SchoolOsStore, type Applicant } from './school-os.store';
import { StudentsStore } from './students.store';
import type { Student } from './models';

@Injectable({ providedIn: 'root' })
export class OsSyncService {
  private api = inject(ApiService);
  private students = inject(StudentsStore);
  private os = inject(SchoolOsStore);

  async load(): Promise<boolean> {
    if (!this.api.token()) return false;
    try {
      const [school, students, applicants, register] = await Promise.all([
        this.api.get<Record<string, string>>('/school'),
        this.api.get<Student[]>('/students'),
        this.api.get<Applicant[]>('/admissions'),
        this.api.get<{ adm: string; name: string; cls: string; status: 'P' | 'A' | 'L' | 'E' }[]>('/attendance'),
      ]);
      if (school) this.os.saveSchool(school);
      if (Array.isArray(students) && students.length) this.students.replace(students.map(withStudentDefaults));
      if (Array.isArray(applicants) && applicants.length) this.os.replaceApplicants(applicants.map(withApplicantDefaults));
      if (Array.isArray(register) && register.length) this.os.replaceRegister(register);
      return true;
    } catch {
      return false;
    }
  }
}

function withStudentDefaults(s: Student): Student {
  return {
    ...s,
    attendance: s.attendance || '—',
    fee: s.fee || 'due',
    feeLabel: s.feeLabel || 'Not yet invoiced',
    guardian: s.guardian || '',
    name: s.name || [s.firstName, s.lastName].filter(Boolean).join(' '),
  };
}

function withApplicantDefaults(a: Applicant): Applicant {
  return {
    ...a,
    firstName: a.firstName || '',
    lastName: a.lastName || '',
    dob: a.dob || '',
    sex: a.sex || '',
    religion: a.religion || '',
    location: a.location || '',
    lcZone: a.lcZone || '',
    illness: a.illness || '',
    lin: a.lin || '',
    fatherName: a.fatherName || '',
    fatherPhone: a.fatherPhone || '',
    fatherNin: a.fatherNin || '',
    motherName: a.motherName || '',
    motherPhone: a.motherPhone || '',
    motherNin: a.motherNin || '',
    guardianName: a.guardianName || '',
    guardianPhone: a.guardianPhone || '',
    schoolpay: a.schoolpay || '',
    transport: a.transport || '',
    photo: a.photo || '',
    name: a.name || [a.firstName, a.lastName].filter(Boolean).join(' '),
  };
}
