import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { SearchService } from '../core/search.service';
import { ToastService } from '../core/toast.service';

const LABELS: Record<string, string> = {
  dashboard: 'Overview',
  students: 'Students',
  admissions: 'Admissions',
  hr: 'Staff & HR',
  curriculum: 'Curriculum',
  academics: 'Timetable & Exams',
  assessments: 'Assessments',
  finance: 'Fees & Payroll',
  transport: 'Transport',
  library: 'Library',
  hostel: 'Hostel',
  visitors: 'Visitors',
  comms: 'Communication',
  meetings: 'Meetings',
  welfare: 'Welfare',
  lifecycle: 'Promotion & Alumni',
  documents: 'Documents',
  reports: 'Reports',
  ai: 'AI Assistant',
  system: 'System',
  profile: 'My profile',
  school: 'School setup',
  attendance: 'Attendance',
  calendar: 'Calendar',
  inventory: 'Inventory',
  health: 'Health',
  website: 'Website',
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './shell.html',
})
export class ShellPage {
  protected auth = inject(AuthService);
  private search = inject(SearchService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private searchBox = viewChild<ElementRef<HTMLInputElement>>('searchBox');

  protected searchText = '';
  protected readonly bellOpen = signal(false);
  protected readonly avatarOpen = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly page = signal('Overview');

  constructor() {
    this.page.set(labelFor(this.router.url));
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe((e) => {
      this.page.set(labelFor((e as NavigationEnd).urlAfterRedirects));
      this.closeMenu();
    });
  }

  toggleMenu(ev: Event) {
    ev.stopPropagation();
    this.menuOpen.update((v) => !v);
    this.bellOpen.set(false);
    this.avatarOpen.set(false);
    this.syncBodyScroll();
  }

  closeMenu() {
    this.menuOpen.set(false);
    this.syncBodyScroll();
  }

  private syncBodyScroll() {
    document.body.classList.toggle('nav-open', this.menuOpen());
  }

  toggleBell(ev: Event) {
    ev.stopPropagation();
    this.bellOpen.update((v) => !v);
    this.avatarOpen.set(false);
  }

  toggleAvatar(ev: Event) {
    ev.stopPropagation();
    this.avatarOpen.update((v) => !v);
    this.bellOpen.set(false);
  }

  @HostListener('document:click')
  closePopovers() {
    this.bellOpen.set(false);
    this.avatarOpen.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onKeys(ev: KeyboardEvent) {
    if (ev.key === 'Escape') this.closeMenu();
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      this.searchBox()?.nativeElement.focus();
    }
  }

  onSearch() {
    const q = this.searchText.trim();
    if (!q) return;
    this.search.query.set(q);
    this.router.navigate(['/students']);
    this.toast.show('Showing results for "' + q + '"');
  }

  profile(tab?: string) {
    this.avatarOpen.set(false);
    this.router.navigate(['/profile'], tab ? { queryParams: { tab } } : {});
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

function labelFor(url: string): string {
  const path = url.split('?')[0].split('/').filter(Boolean)[0] ?? 'dashboard';
  return LABELS[path] ?? 'Overview';
}
