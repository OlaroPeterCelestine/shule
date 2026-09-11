import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { PdfViewerService } from '../../core/pdf-viewer.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

export interface DocType {
  key: string;
  title: string;
  description: string;
  pick: 'student' | 'staff' | 'applicant' | 'visit' | 'none';
}

@Component({
  selector: 'app-documents',
  imports: [FormsModule, StatCards],
  templateUrl: './documents.html',
})
export class DocumentsPage {
  private api = inject(ApiService);
  private pdf = inject(PdfViewerService);
  private toast = inject(ToastService);

  protected readonly types = signal<DocType[]>([]);
  protected readonly students = signal<{ adm: string; name: string; cls: string }[]>([]);
  protected readonly staff = signal<{ id: string; name: string; role: string }[]>([]);
  protected readonly applicants = signal<{ id: number; name: string; cls: string }[]>([]);
  protected readonly visits = signal<{ id: number; name: string; reason: string; adm: string }[]>([]);
  protected readonly selected = signal('');
  protected readonly pickId = signal('');
  protected readonly busy = signal(false);

  protected readonly current = computed(() => this.types().find((t) => t.key === this.selected()) ?? null);
  protected readonly stats = computed(() => [
    { label: 'Templates', value: String(this.types().length), change: 'Generated on the server', bars: [4, 5, 5, 6, 6, 6, 6] },
    { label: 'Pupils', value: String(this.students().length), change: 'Ready for letters', bars: [5, 6, 6, 7, 8, 8, 9] },
    { label: 'Sickbay notes', value: String(this.visits().length), change: 'From health visits', bars: [2, 3, 3, 4, 4, 5, 5] },
    { label: 'Staff letters', value: String(this.staff().length), change: 'Leave & payslips', bars: [6, 6, 7, 7, 7, 8, 8] },
  ]);

  constructor() {
    void this.load();
  }

  async load() {
    try {
      const [types, students, staff, applicants, visits] = await Promise.all([
        this.api.get<DocType[]>('/documents'),
        this.api.get<{ adm: string; name: string; cls: string }[]>('/students'),
        this.api.get<{ id: string; name: string; role: string }[]>('/staff'),
        this.api.get<{ id: number; name: string; cls: string }[]>('/admissions'),
        this.api.get<{ id: number; name: string; reason: string; adm: string }[]>('/health'),
      ]);
      this.types.set(types);
      this.students.set(students);
      this.staff.set(staff);
      this.applicants.set(applicants);
      this.visits.set(visits);
      if (!this.selected() && types[0]) this.choose(types[0].key);
    } catch {
      this.toast.show('Start the backend to generate PDFs');
    }
  }

  choose(key: string) {
    this.selected.set(key);
    const type = this.types().find((t) => t.key === key);
    if (type?.pick === 'student') this.pickId.set(this.students()[0]?.adm ?? '');
    else if (type?.pick === 'staff') this.pickId.set(String(this.staff()[0]?.id ?? ''));
    else if (type?.pick === 'applicant') this.pickId.set(String(this.applicants()[0]?.id ?? ''));
    else if (type?.pick === 'visit') this.pickId.set(String(this.visits()[0]?.id ?? ''));
    else this.pickId.set('');
  }

  async generate() {
    const type = this.current();
    if (!type) return;
    const params = new URLSearchParams();
    if (type.pick === 'student') params.set('adm', this.pickId());
    if (type.pick === 'staff') params.set('staff', this.pickId());
    if (type.pick === 'applicant') params.set('applicant', this.pickId());
    if (type.pick === 'visit') params.set('visit', this.pickId());
    const q = params.toString();
    this.busy.set(true);
    try {
      await this.pdf.open(type.title, '/documents/' + type.key + '/pdf' + (q ? '?' + q : ''));
    } catch (err) {
      this.toast.show(err instanceof Error ? err.message : 'Could not generate that PDF');
    } finally {
      this.busy.set(false);
    }
  }
}
