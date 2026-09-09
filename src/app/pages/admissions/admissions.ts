import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SchoolOsStore, type Applicant, type ApplicantStage } from '../../core/school-os.store';
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
  schoolpay: string;
  transport: string;
  photo: string;
}

const EMPTY: ApplicationForm = {
  firstName: '', lastName: '', dob: '', sex: 'Female', religion: '',
  location: '', lcZone: '', illness: '', cls: '', lin: '',
  fatherName: '', fatherPhone: '', fatherNin: '',
  motherName: '', motherPhone: '', motherNin: '',
  guardianName: '', guardianPhone: '',
  schoolpay: '', transport: '', photo: '',
};

@Component({
  selector: 'app-admissions',
  imports: [FormsModule, StatCards],
  templateUrl: './admissions.html',
})
export class AdmissionsPage {
  protected os = inject(SchoolOsStore);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected readonly stages = STAGES;
  protected readonly classes = ['Baby class', 'Middle class', 'Top class', 'Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'];
  protected readonly form = signal<ApplicationForm>({ ...EMPTY });
  protected readonly errors = signal<Partial<Record<keyof ApplicationForm, boolean>>>({});
  protected readonly drawerOpen = signal(false);
  protected readonly selected = signal<Applicant | null>(null);
  protected readonly previewOpen = signal(false);
  protected readonly saving = signal(false);

  protected readonly stats = computed(() => [
    { label: 'Applied', value: String(this.inStage('applied').length), change: 'Paper + online', bars: [3, 4, 5, 6, 7, 8, 9] },
    { label: 'In review', value: String(this.inStage('review').length + this.inStage('interview').length), change: 'Docs + interviews', bars: [5, 5, 6, 6, 7, 6, 8] },
    { label: 'Offers', value: String(this.inStage('offered').length), change: 'Awaiting acceptance', bars: [2, 3, 4, 4, 5, 6, 6] },
    { label: 'Enrolled', value: String(this.inStage('enrolled').length), change: 'Student number issued', bars: [1, 2, 3, 4, 5, 6, 7] },
  ]);

  inStage(stage: ApplicantStage) {
    return this.os.applicants().filter((a) => a.stage === stage);
  }

  set<K extends keyof ApplicationForm>(key: K, value: ApplicationForm[K]) {
    this.form.update((f) => ({ ...f, [key]: value }));
    if (this.errors()[key]) this.errors.update((e) => ({ ...e, [key]: false }));
  }

  openForm() {
    this.form.set({ ...EMPTY });
    this.errors.set({});
    this.drawerOpen.set(true);
  }

  closeForm() {
    this.drawerOpen.set(false);
  }

  openApplicant(a: Applicant) {
    this.router.navigate(['/admissions', String(a.id)]);
  }

  closeApplicant() {
    this.selected.set(null);
  }

  onPhoto(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.set('photo', String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  submit() {
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
    this.os.addApplicant({
      ...f,
      name: f.firstName.trim() + ' ' + f.lastName.trim(),
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
    });
    this.saving.set(false);
    this.drawerOpen.set(false);
    this.toast.show(f.firstName.trim() + ' ' + f.lastName.trim() + ' — application received');
  }

  advance(a: Applicant) {
    const next = NEXT[a.stage];
    if (!next) {
      this.toast.show(a.name + ' is already at ' + a.stage);
      return;
    }
    const meta =
      next === 'review' ? 'Docs in check' :
      next === 'interview' ? 'Interview scheduled' :
      next === 'offered' ? 'Offer letter ready' :
      'Adm. no. LR-' + Math.floor(1000 + Math.random() * 8999);
    this.os.moveApplicant(a.id, next, meta);
    this.toast.show(a.name + ' moved to ' + next);
    if (this.selected()?.id === a.id) {
      this.selected.set({ ...a, stage: next, meta });
    }
  }

  waitlist(a: Applicant) {
    this.os.moveApplicant(a.id, 'waitlist', 'Waitlisted today');
    this.toast.show(a.name + ' waitlisted');
    if (this.selected()?.id === a.id) this.selected.set({ ...a, stage: 'waitlist', meta: 'Waitlisted today' });
  }
}
