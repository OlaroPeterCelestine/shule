import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Student } from '../../core/models';
import { SchoolOsStore, type Applicant, type ApplicantStage } from '../../core/school-os.store';
import { formatAdm, parseAdmNum, StudentsStore } from '../../core/students.store';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

const STAGES: { key: ApplicantStage; label: string }[] = [
  { key: 'applied', label: 'Applied' },
  { key: 'review', label: 'Documents' },
  { key: 'interview', label: 'Interview' },
  { key: 'offered', label: 'Offer' },
  { key: 'enrolled', label: 'Enrolled' },
  { key: 'waitlist', label: 'Waitlist' },
];

const NEXT: Partial<Record<ApplicantStage, ApplicantStage>> = {
  applied: 'review',
  review: 'interview',
  interview: 'offered',
  offered: 'enrolled',
};

export interface ApplicationForm {
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
  fatherSig: string;
  motherSig: string;
  guardianSig: string;
  schoolpay: string;
  transport: string;
  photo: string;
  adm: string;
}

const EMPTY: ApplicationForm = {
  firstName: '', lastName: '', dob: '', sex: 'Female', religion: '',
  location: '', lcZone: '', illness: '', cls: '', lin: '',
  fatherName: '', fatherPhone: '', fatherNin: '',
  motherName: '', motherPhone: '', motherNin: '',
  guardianName: '', guardianPhone: '',
  fatherSig: '', motherSig: '', guardianSig: '',
  schoolpay: '', transport: 'Van — pick & drop', photo: '', adm: '',
};

@Component({
  selector: 'app-admissions',
  imports: [FormsModule, StatCards],
  templateUrl: './admissions.html',
  styleUrl: './admissions.css',
})
export class AdmissionsPage {
  protected os = inject(SchoolOsStore);
  private students = inject(StudentsStore);
  private toast = inject(ToastService);
  protected readonly stages = STAGES;
  protected readonly classes = ['Baby class', 'Middle class', 'Top class', 'Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'];
  protected readonly rail = ['😊', '⭐', '😃', '🌞', '😊', '⭐', '😃', '🌞', '😊', '⭐', '😃', '🌞', '😊', '⭐', '😃', '🌞'];
  protected readonly form = signal<ApplicationForm>({ ...EMPTY });
  protected readonly errors = signal<Partial<Record<keyof ApplicationForm, boolean>>>({});
  protected readonly viewing = signal<Applicant | null>(null);
  protected readonly previewOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly admSeq = signal(this.nextNumber());

  constructor() {
    const n = this.nextNumber();
    this.admSeq.set(n);
    this.form.update((f) => ({ ...f, adm: formatAdm(n, this.year()) }));
  }

  protected readonly stats = computed(() => [
    { label: 'Applied', value: String(this.inStage('applied').length), change: 'Paper + online', bars: [3, 4, 5, 6, 7, 8, 9] },
    { label: 'In review', value: String(this.inStage('review').length + this.inStage('interview').length), change: 'Docs + interviews', bars: [5, 5, 6, 6, 7, 6, 8] },
    { label: 'Offers', value: String(this.inStage('offered').length), change: 'Awaiting acceptance', bars: [2, 3, 4, 4, 5, 6, 6] },
    { label: 'Enrolled', value: String(this.inStage('enrolled').length), change: 'Student number issued', bars: [1, 2, 3, 4, 5, 6, 7] },
  ]);

  protected readonly nextAdmPreview = computed(() => formatAdm(this.nextNumber(), this.year()));
  protected readonly generatedAdm = computed(() => formatAdm(this.admSeq() || this.nextNumber(), this.year()));

  inStage(stage: ApplicantStage) {
    return this.os.applicants().filter((a) => a.stage === stage);
  }

  set<K extends keyof ApplicationForm>(key: K, value: ApplicationForm[K]) {
    this.form.update((f) => ({ ...f, [key]: value }));
    if (this.errors()[key]) this.errors.update((e) => ({ ...e, [key]: false }));
  }

  year() {
    return this.os.school().year || '2026';
  }

  takenAdms() {
    return this.os.applicants().map((a) => a.adm ?? '');
  }

  nextNumber() {
    return this.students.nextNumber(this.takenAdms(), this.year());
  }

  setSeq(value: string | number) {
    const n = Number(value);
    this.admSeq.set(Number.isFinite(n) && n > 0 ? Math.floor(n) : this.nextNumber());
  }

  generateAdm() {
    const n = this.admSeq() || this.nextNumber();
    const adm = formatAdm(n, this.year());
    this.set('adm', adm);
    const viewing = this.viewing();
    if (viewing) {
      this.os.patchApplicant(viewing.id, { adm, meta: 'Adm. no. ' + adm });
      this.viewing.set({ ...viewing, adm, meta: 'Adm. no. ' + adm });
    }
    this.toast.show('Generated ' + adm);
  }

  blankForm() {
    const n = this.nextNumber();
    this.admSeq.set(n);
    this.form.set({ ...EMPTY, adm: formatAdm(n, this.year()) });
    this.errors.set({});
    this.viewing.set(null);
  }

  openApplicant(a: Applicant) {
    this.viewing.set(a);
    this.errors.set({});
    this.form.set({
      firstName: a.firstName,
      lastName: a.lastName,
      dob: a.dob,
      sex: a.sex || 'Female',
      religion: a.religion,
      location: a.location,
      lcZone: a.lcZone,
      illness: a.illness,
      cls: a.cls,
      lin: a.lin,
      fatherName: a.fatherName,
      fatherPhone: a.fatherPhone,
      fatherNin: a.fatherNin,
      motherName: a.motherName,
      motherPhone: a.motherPhone,
      motherNin: a.motherNin,
      guardianName: a.guardianName,
      guardianPhone: a.guardianPhone,
      fatherSig: a.fatherSig ?? '',
      motherSig: a.motherSig ?? '',
      guardianSig: a.guardianSig ?? '',
      schoolpay: a.schoolpay,
      transport: a.transport || 'Van — pick & drop',
      photo: a.photo,
      adm: a.adm || '',
    });
    this.admSeq.set(a.adm ? parseAdmNum(a.adm, this.year()) || this.nextNumber() : this.nextNumber());
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  submit() {
    if (this.viewing()) return;
    const f = this.form();
    const invalid: Partial<Record<keyof ApplicationForm, boolean>> = {};
    if (!f.firstName.trim()) invalid.firstName = true;
    if (!f.lastName.trim()) invalid.lastName = true;
    if (!f.dob) invalid.dob = true;
    if (!f.cls) invalid.cls = true;
    if (!f.fatherName.trim() && !f.motherName.trim() && !f.guardianName.trim()) invalid.fatherName = true;
    this.errors.set(invalid);
    if (Object.keys(invalid).length) {
      this.toast.show('Complete the child particulars and at least one parent / guardian');
      return;
    }
    this.saving.set(true);
    const adm = f.adm.trim() || formatAdm(this.admSeq() || this.nextNumber(), this.year());
    this.os.addApplicant({
      ...f,
      adm,
      name: f.firstName.trim() + ' ' + f.lastName.trim(),
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      meta: 'Adm. no. ' + adm,
    });
    this.saving.set(false);
    this.blankForm();
    this.toast.show(f.firstName.trim() + ' ' + f.lastName.trim() + ' — ' + adm);
  }

  advance(a: Applicant) {
    const next = NEXT[a.stage];
    if (!next) {
      this.toast.show(a.name + ' is already at ' + a.stage);
      return;
    }
    let adm = a.adm;
    let meta =
      next === 'review' ? 'Docs in check' :
      next === 'interview' ? 'Interview scheduled' :
      next === 'offered' ? 'Offer letter ready' :
      '';
    if (next === 'enrolled') {
      adm = adm || this.students.nextAdm(this.takenAdms(), this.year());
      meta = 'Adm. no. ' + adm;
      this.os.patchApplicant(a.id, { adm, stage: next, meta });
      this.enrollStudent({ ...a, adm, stage: next, meta });
    } else {
      this.os.moveApplicant(a.id, next, meta);
    }
    this.toast.show(a.name + ' moved to ' + next + (adm && next === 'enrolled' ? ' · ' + adm : ''));
    if (this.viewing()?.id === a.id) this.viewing.set({ ...a, adm, stage: next, meta });
    if (this.form().adm === a.adm || !this.form().adm) this.set('adm', adm || this.form().adm);
  }

  private enrollStudent(a: Applicant) {
    const adm = a.adm;
    if (!adm || this.students.hasAdm(adm)) return;
    const guardian = a.motherName || a.fatherName || a.guardianName;
    const phone = a.motherPhone || a.fatherPhone || a.guardianPhone;
    const student: Student = {
      adm,
      name: a.name,
      firstName: a.firstName,
      lastName: a.lastName,
      cls: a.cls,
      gender: a.sex,
      dob: a.dob,
      nationality: 'Ugandan',
      religion: a.religion,
      admissionDate: new Date().toISOString().slice(0, 10),
      admissionType: 'New',
      previousSchool: '',
      guardian,
      guardianRelation: a.motherName ? 'Mother' : a.fatherName ? 'Father' : 'Guardian',
      guardianPhone: phone,
      address: [a.location, a.lcZone].filter(Boolean).join(', '),
      emergencyName: a.fatherName || a.motherName || guardian,
      emergencyPhone: a.fatherPhone || a.motherPhone || phone,
      medicalNotes: a.illness,
      residentType: 'Day',
      transportRoute: a.transport,
      hostel: '',
      attendance: '—',
      fee: 'due',
      feeLabel: 'New admission',
    };
    this.students.add(student);
    this.os.addToRegister({ adm, name: a.name, cls: a.cls, status: 'P' });
  }

  waitlist(a: Applicant) {
    this.os.moveApplicant(a.id, 'waitlist', 'Waitlisted today');
    this.toast.show(a.name + ' waitlisted');
    if (this.viewing()?.id === a.id) this.viewing.set({ ...a, stage: 'waitlist', meta: 'Waitlisted today' });
  }
}
