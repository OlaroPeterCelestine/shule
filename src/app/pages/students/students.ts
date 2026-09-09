import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../../core/search.service';
import { StudentsStore } from '../../core/students.store';
import { SchoolOsStore } from '../../core/school-os.store';
import { ToastService } from '../../core/toast.service';
import type { Student } from '../../core/models';
import { StatCards } from '../../shared/stat-cards';

export interface StudentForm {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  religion: string;
  cls: string;
  admissionDate: string;
  admissionType: string;
  previousSchool: string;
  guardian: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  bloodGroup: string;
  allergies: string;
  medicalNotes: string;
  residentType: string;
  transportRoute: string;
  hostel: string;
  notes: string;
}

const EMPTY: StudentForm = {
  firstName: '', lastName: '', gender: 'Female', dob: '', nationality: 'Ugandan', religion: '',
  cls: '', admissionDate: '', admissionType: 'New', previousSchool: '',
  guardian: '', guardianRelation: 'Mother', guardianPhone: '', guardianEmail: '', address: '',
  emergencyName: '', emergencyPhone: '',
  bloodGroup: '', allergies: '', medicalNotes: '',
  residentType: 'Day', transportRoute: '', hostel: '', notes: '',
};

const REQUIRED: (keyof StudentForm)[] = ['firstName', 'lastName', 'dob', 'cls', 'admissionDate', 'guardian', 'guardianPhone'];

@Component({
  selector: 'app-students',
  imports: [FormsModule, StatCards],
  templateUrl: './students.html',
})
export class StudentsPage {
  private store = inject(StudentsStore);
  protected os = inject(SchoolOsStore);
  private toast = inject(ToastService);
  private search = inject(SearchService);
  private router = inject(Router);

  protected readonly q = signal(this.search.query());
  protected readonly classFilter = signal('');
  protected readonly feeFilter = signal('');
  protected readonly panelOpen = signal(false);
  protected readonly selected = signal<Student | null>(null);
  protected readonly pane = signal('overview');
  protected readonly drawerOpen = signal(false);
  protected readonly successOpen = signal(false);
  protected readonly created = signal<Student | null>(null);
  protected readonly form = signal<StudentForm>({ ...EMPTY });
  protected readonly errors = signal<Partial<Record<keyof StudentForm, boolean>>>({});
  protected readonly saving = signal(false);

  protected readonly classOptions = ['Baby class', 'Middle class', 'Top class', 'Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'];
  protected readonly routes = ['', 'Route 1 — Ntinda', 'Route 2 — Kireka', 'Route 3 — Bweyogerere', 'Route 4 — Namugongo'];
  protected readonly hostels = ['', "St. Mary's Block (Girls)", "St. Peter's Block (Boys)", 'Junior Block (Mixed)'];

  constructor() {
    effect(() => {
      const incoming = this.search.query();
      if (incoming) this.q.set(incoming);
    });
  }

  protected readonly storeCount = computed(() => this.store.students().length);
  protected readonly classes = computed(() => [...new Set(this.store.students().map((s) => s.cls))].sort());
  protected readonly stats = computed(() => {
    const all = this.store.students();
    const due = all.filter((s) => s.fee === 'due').length;
    return [
      { label: 'Enrolled', value: String(all.length), change: this.filtered().length + ' showing', bars: [4, 6, 5, 8, 7, 9, 10] },
      { label: 'Balance due', value: String(due), change: 'Fee follow-up open', bars: [8, 7, 6, 7, 8, 9, 7] },
      { label: 'Fees cleared', value: String(all.length - due), change: 'This term', bars: [3, 4, 5, 6, 7, 8, 9] },
      { label: 'Classes', value: String(this.classes().length), change: 'Across campuses', bars: [5, 5, 6, 6, 7, 7, 8] },
    ];
  });

  protected readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    const cls = this.classFilter();
    const fee = this.feeFilter();
    return this.store.students().filter((s) => {
      const matchesQ = !q || s.name.toLowerCase().includes(q) || s.adm.toLowerCase().includes(q);
      return matchesQ && (!cls || s.cls === cls) && (!fee || s.fee === fee);
    });
  });

  set<K extends keyof StudentForm>(key: K, value: StudentForm[K]) {
    this.form.update((f) => ({ ...f, [key]: value }));
    if (this.errors()[key]) this.errors.update((e) => ({ ...e, [key]: false }));
  }

  marksFor(adm: string) {
    return this.os.register().find((r) => r.adm === adm);
  }

  visitsFor(adm: string) {
    return this.os.visits().filter((v) => v.adm === adm);
  }

  openStudent(s: Student) {
    this.router.navigate(['/students', s.adm]);
  }

  close() {
    this.panelOpen.set(false);
  }

  openAdd() {
    this.form.set({ ...EMPTY, admissionDate: today() });
    this.errors.set({});
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  closeSuccess() {
    this.successOpen.set(false);
  }

  viewCreated() {
    const s = this.created();
    this.successOpen.set(false);
    if (s) this.openStudent(s);
  }

  addAnother() {
    this.successOpen.set(false);
    this.openAdd();
  }

  submit() {
    const f = this.form();
    const invalid: Partial<Record<keyof StudentForm, boolean>> = {};
    for (const key of REQUIRED) {
      if (!String(f[key] ?? '').trim()) invalid[key] = true;
    }
    if (f.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.guardianEmail.trim())) invalid.guardianEmail = true;
    this.errors.set(invalid);
    if (Object.keys(invalid).length) {
      this.toast.show('Please complete the highlighted fields');
      return;
    }
    this.saving.set(true);
    const adm = 'LR-' + Math.floor(1000 + Math.random() * 8999);
    const student: Student = {
      adm,
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      name: f.firstName.trim() + ' ' + f.lastName.trim(),
      cls: f.cls,
      gender: f.gender,
      dob: f.dob,
      nationality: f.nationality.trim() || 'Ugandan',
      religion: f.religion.trim(),
      admissionDate: f.admissionDate,
      admissionType: f.admissionType,
      previousSchool: f.previousSchool.trim(),
      guardian: f.guardian.trim(),
      guardianRelation: f.guardianRelation,
      guardianPhone: f.guardianPhone.trim(),
      guardianEmail: f.guardianEmail.trim(),
      address: f.address.trim(),
      emergencyName: f.emergencyName.trim(),
      emergencyPhone: f.emergencyPhone.trim(),
      bloodGroup: f.bloodGroup,
      allergies: f.allergies.trim(),
      medicalNotes: f.medicalNotes.trim(),
      residentType: f.residentType,
      transportRoute: f.residentType === 'Day' ? f.transportRoute : '',
      hostel: f.residentType === 'Boarder' ? f.hostel : '',
      attendance: '—',
      fee: 'due',
      feeLabel: 'Not yet invoiced',
      notes: f.notes.trim(),
    };
    this.store.add(student);
    this.created.set(student);
    this.saving.set(false);
    this.drawerOpen.set(false);
    this.successOpen.set(true);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.successOpen()) this.closeSuccess();
    else if (this.drawerOpen()) this.closeDrawer();
    else if (this.panelOpen()) this.close();
  }
}

function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}
