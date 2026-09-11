import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { allowed, cleanText, isIsoDate, isLin, isNin, isPhone, isSchoolpay } from '../../core/form-safe';
import type { Student } from '../../core/models';
import { SCHOOL_ABBREV } from '../../core/models';
import { SchoolOsStore, type Applicant, type ApplicantStage } from '../../core/school-os.store';
import { formatAdm, parseAdmNum, StudentsStore, yearCode } from '../../core/students.store';
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

const SEX = ['Female', 'Male'] as const;
const TRANSPORT = ['Van — pick & drop', 'Day scholar — own transport'] as const;
const CLASSES = ['Baby class', 'Middle class', 'Top class', 'Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'] as const;

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
  protected readonly classes = CLASSES;
  protected readonly form = signal<ApplicationForm>({ ...EMPTY });
  protected readonly errors = signal<Partial<Record<keyof ApplicationForm, boolean>>>({});
  protected readonly viewing = signal<Applicant | null>(null);
  protected readonly drawerOpen = signal(false);
  protected readonly previewOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly admSeq = signal(1);

  constructor() {
    this.admSeq.set(this.nextNumber());
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
    return [
      ...this.os.applicants().map((a) => a.adm ?? ''),
      ...this.students.students().map((s) => s.adm),
    ];
  }

  nextNumber() {
    return this.students.nextNumber(this.takenAdms(), this.year());
  }

  setSeq(value: string | number) {
    const n = Number(value);
    this.admSeq.set(Number.isFinite(n) && n >= 1 && n <= 999 ? Math.floor(n) : this.nextNumber());
  }

  generateAdm() {
    const n = this.admSeq() || this.nextNumber();
    const adm = formatAdm(n, this.year());
    const viewing = this.viewing();
    const taken = this.takenAdms().filter((x) => x && x !== viewing?.adm);
    if (taken.includes(adm)) {
      this.toast.show(adm + ' is already used');
      return;
    }
    this.set('adm', adm);
    if (viewing) {
      this.os.patchApplicant(viewing.id, { adm, meta: 'Adm. no. ' + adm });
      this.viewing.set({ ...viewing, adm, meta: 'Adm. no. ' + adm });
    }
    this.toast.show('Generated ' + adm);
  }

  openAdd() {
    const n = this.nextNumber();
    this.admSeq.set(n);
    this.form.set({ ...EMPTY, adm: formatAdm(n, this.year()) });
    this.errors.set({});
    this.viewing.set(null);
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
    this.viewing.set(null);
  }

  openApplicant(a: Applicant) {
    this.viewing.set(a);
    this.errors.set({});
    this.form.set({
      firstName: a.firstName,
      lastName: a.lastName,
      dob: a.dob,
      sex: allowed(a.sex, SEX) ? a.sex : 'Female',
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
      transport: allowed(a.transport, TRANSPORT) ? a.transport : TRANSPORT[0],
      photo: a.photo,
      adm: a.adm || '',
    });
    this.admSeq.set(a.adm ? parseAdmNum(a.adm, this.year()) || this.nextNumber() : this.nextNumber());
    this.drawerOpen.set(true);
  }

  submit() {
    if (this.viewing() || this.saving()) return;
    const raw = this.form();
    const f: ApplicationForm = {
      firstName: cleanText(raw.firstName, 40),
      lastName: cleanText(raw.lastName, 40),
      dob: cleanText(raw.dob, 10),
      sex: allowed(raw.sex, SEX) ? raw.sex : '',
      religion: cleanText(raw.religion, 40),
      location: cleanText(raw.location, 60),
      lcZone: cleanText(raw.lcZone, 60),
      illness: cleanText(raw.illness, 240),
      cls: allowed(raw.cls, CLASSES) ? raw.cls : '',
      lin: cleanText(raw.lin, 20).replace(/\s/g, ''),
      fatherName: cleanText(raw.fatherName, 60),
      fatherPhone: cleanText(raw.fatherPhone, 16),
      fatherNin: cleanText(raw.fatherNin, 16).replace(/\s/g, ''),
      motherName: cleanText(raw.motherName, 60),
      motherPhone: cleanText(raw.motherPhone, 16),
      motherNin: cleanText(raw.motherNin, 16).replace(/\s/g, ''),
      guardianName: cleanText(raw.guardianName, 60),
      guardianPhone: cleanText(raw.guardianPhone, 16),
      fatherSig: cleanText(raw.fatherSig, 60),
      motherSig: cleanText(raw.motherSig, 60),
      guardianSig: cleanText(raw.guardianSig, 60),
      schoolpay: cleanText(raw.schoolpay, 12).replace(/\s/g, ''),
      transport: allowed(raw.transport, TRANSPORT) ? raw.transport : TRANSPORT[0],
      photo: '',
      adm: cleanText(raw.adm, 8).replace(/\s/g, '').toUpperCase(),
    };

    const year = this.year();
    const adm = f.adm || formatAdm(this.admSeq() || this.nextNumber(), year);
    const invalid: Partial<Record<keyof ApplicationForm, boolean>> = {};
    if (!f.firstName) invalid.firstName = true;
    if (!f.lastName) invalid.lastName = true;
    if (!isIsoDate(f.dob, 2008, 2026)) invalid.dob = true;
    if (!f.cls) invalid.cls = true;
    if (!f.sex) invalid.sex = true;
    if (!f.fatherName && !f.motherName && !f.guardianName) invalid.fatherName = true;
    if (f.fatherPhone && !isPhone(f.fatherPhone)) invalid.fatherPhone = true;
    if (f.motherPhone && !isPhone(f.motherPhone)) invalid.motherPhone = true;
    if (f.guardianPhone && !isPhone(f.guardianPhone)) invalid.guardianPhone = true;
    if (f.fatherNin && !isNin(f.fatherNin)) invalid.fatherNin = true;
    if (f.motherNin && !isNin(f.motherNin)) invalid.motherNin = true;
    if (f.lin && !isLin(f.lin)) invalid.lin = true;
    if (f.schoolpay && !isSchoolpay(f.schoolpay)) invalid.schoolpay = true;
    const admOk = new RegExp('^' + SCHOOL_ABBREV + yearCode(year) + '\\d{3}$').test(adm);
    if (!admOk) invalid.adm = true;
    const taken = this.takenAdms().filter(Boolean);
    if (admOk && taken.includes(adm)) invalid.adm = true;

    this.errors.set(invalid);
    if (Object.keys(invalid).length) {
      this.toast.show('Check the highlighted fields — names, date, class, and a parent are required');
      return;
    }

    this.saving.set(true);
    this.os.addApplicant({
      ...f,
      adm,
      name: f.firstName + ' ' + f.lastName,
      firstName: f.firstName,
      lastName: f.lastName,
      meta: 'Adm. no. ' + adm,
    });
    this.saving.set(false);
    this.drawerOpen.set(false);
    this.toast.show(f.firstName + ' ' + f.lastName + ' — ' + adm);
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
  }

  private enrollStudent(a: Applicant) {
    const adm = a.adm;
    if (!adm || this.students.hasAdm(adm)) return;
    const guardian = cleanText(a.motherName || a.fatherName || a.guardianName, 60);
    const phone = cleanText(a.motherPhone || a.fatherPhone || a.guardianPhone, 16);
    const student: Student = {
      adm,
      name: cleanText(a.name, 80),
      firstName: cleanText(a.firstName, 40),
      lastName: cleanText(a.lastName, 40),
      cls: allowed(a.cls, CLASSES) ? a.cls : CLASSES[0],
      gender: allowed(a.sex, SEX) ? a.sex : 'Female',
      dob: a.dob,
      nationality: 'Ugandan',
      religion: cleanText(a.religion, 40),
      admissionDate: new Date().toISOString().slice(0, 10),
      admissionType: 'New',
      previousSchool: '',
      guardian,
      guardianRelation: a.motherName ? 'Mother' : a.fatherName ? 'Father' : 'Guardian',
      guardianPhone: phone,
      address: cleanText([a.location, a.lcZone].filter(Boolean).join(', '), 80),
      emergencyName: cleanText(a.fatherName || a.motherName || guardian, 60),
      emergencyPhone: cleanText(a.fatherPhone || a.motherPhone || phone, 16),
      medicalNotes: cleanText(a.illness, 240),
      residentType: 'Day',
      transportRoute: allowed(a.transport, TRANSPORT) ? a.transport : '',
      hostel: '',
      attendance: '—',
      fee: 'due',
      feeLabel: 'New admission',
    };
    this.students.add(student);
    this.os.addToRegister({ adm, name: student.name, cls: student.cls, status: 'P' });
  }

  waitlist(a: Applicant) {
    this.os.moveApplicant(a.id, 'waitlist', 'Waitlisted today');
    this.toast.show(a.name + ' waitlisted');
    if (this.viewing()?.id === a.id) this.viewing.set({ ...a, stage: 'waitlist', meta: 'Waitlisted today' });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.previewOpen()) this.previewOpen.set(false);
    else if (this.drawerOpen()) this.closeDrawer();
  }
}
