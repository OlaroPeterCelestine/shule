import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { SearchService } from '../core/search.service';
import { ToastService } from '../core/toast.service';

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

  protected searchText = '';
  protected readonly bellOpen = signal(false);
  protected readonly avatarOpen = signal(false);

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

  onSearch() {
    const q = this.searchText.trim();
    if (!q) return;
    this.search.query.set(q);
    this.router.navigate(['/students']);
    this.toast.show('Showing results for "' + q + '"');
  }

  profile() {
    this.avatarOpen.set(false);
    this.toast.show('Profile settings opened');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
