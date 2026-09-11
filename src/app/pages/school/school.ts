import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessService } from '../../core/access.service';
import { ApiService } from '../../core/api.service';
import { SchoolOsStore } from '../../core/school-os.store';
import { ModalService } from '../../core/modal.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-school',
  imports: [FormsModule, StatCards],
  templateUrl: './school.html',
})
export class SchoolPage {
  protected os = inject(SchoolOsStore);
  protected access = inject(AccessService);
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  private api = inject(ApiService);
  protected readonly tab = signal<'profile' | 'campuses' | 'houses'>('profile');
  protected readonly saving = signal(false);

  protected readonly stats = computed(() => [
    { label: 'Campuses', value: String(this.os.campuses().length), change: this.os.school().country, bars: [3, 4, 4, 5, 5, 6, 6] },
    { label: 'Houses', value: String(this.os.houses().length), change: 'Whole school', bars: [4, 4, 5, 5, 6, 6, 6] },
    { label: 'Academic year', value: this.os.school().year, change: this.os.school().term, bars: [5, 6, 6, 7, 7, 8, 8] },
    { label: 'Currency', value: this.os.school().currency, change: this.os.school().timezone, bars: [6, 6, 7, 7, 7, 8, 8] },
  ]);

  set(key: string, value: string) {
    this.os.saveSchool({ [key]: value });
  }

  async save() {
    if (!this.access.can('school', 'edit')) return;
    if (this.saving()) return;
    this.saving.set(true);
    if (this.api.token()) {
      try {
        const row = await this.api.patch<Record<string, string>>('/school', this.os.school());
        this.os.saveSchool(row);
        this.toast.show('School profile saved');
      } catch (err) {
        this.toast.show(err instanceof Error ? err.message : 'Could not save the school profile');
      }
    } else {
      this.toast.show('School profile saved on this device');
    }
    this.saving.set(false);
  }

  addCampus() {
    if (!this.access.can('school', 'create')) return;
    this.modal.open({
      title: 'Add campus',
      fields: [
        { key: 'name', placeholder: 'Campus name *', required: true },
        { key: 'city', placeholder: 'City *', required: true },
        { key: 'focus', placeholder: 'Levels (e.g. KG–P3)' },
      ],
      onConfirm: (v) => {
        this.os.addCampus(String(v['name']), String(v['city']), String(v['focus'] || 'General'));
        this.toast.show(v['name'] + ' added');
      },
    });
  }

  addHouse() {
    if (!this.access.can('school', 'create')) return;
    this.modal.open({
      title: 'Add house',
      fields: [
        { key: 'name', placeholder: 'House name *', required: true },
        { key: 'colour', placeholder: 'Colour (e.g. Gold)' },
      ],
      onConfirm: (v) => {
        this.os.addHouse(String(v['name']), String(v['colour'] || 'Navy'));
        this.toast.show(v['name'] + ' house created');
      },
    });
  }
}
