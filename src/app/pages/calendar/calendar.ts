import { Component, computed, inject, signal } from '@angular/core';
import { AccessService } from '../../core/access.service';
import { ApiService } from '../../core/api.service';
import { ModalService } from '../../core/modal.service';
import { SchoolOsStore } from '../../core/school-os.store';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

export interface CalItem {
  key: string;
  title: string;
  type: string;
  audience: string;
  time: string;
  iso: string;
  source: 'event' | 'exam';
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};
const TYPES = ['All', 'Exams', 'PTM', 'Holiday', 'Event', 'Meeting'];

@Component({
  selector: 'app-calendar',
  imports: [StatCards],
  templateUrl: './calendar.html',
})
export class CalendarPage {
  protected os = inject(SchoolOsStore);
  protected access = inject(AccessService);
  private modal = inject(ModalService);
  private toast = inject(ToastService);
  private api = inject(ApiService);

  protected readonly types = TYPES;
  protected readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  protected readonly filter = signal('All');
  protected readonly cursor = signal({ year: 2026, month: 9 });
  protected readonly selected = signal('2026-09-11');

  protected readonly items = computed(() => this.collect());

  protected readonly visible = computed(() => {
    const kind = this.filter();
    return this.items().filter((i) => kind === 'All' || i.type === kind);
  });

  protected readonly byDay = computed(() => {
    const map = new Map<string, CalItem[]>();
    for (const item of this.visible()) {
      const list = map.get(item.iso) ?? [];
      list.push(item);
      map.set(item.iso, list);
    }
    return map;
  });

  protected readonly monthLabel = computed(() => {
    const c = this.cursor();
    return MONTHS[c.month - 1] + ' ' + c.year;
  });

  protected readonly cells = computed(() => {
    const { year, month } = this.cursor();
    const first = new Date(year, month - 1, 1);
    const startPad = (first.getDay() + 6) % 7;
    const days = new Date(year, month, 0).getDate();
    const cells: Array<{ iso: string; day: number; inMonth: boolean; items: CalItem[] }> = [];
    for (let i = 0; i < startPad; i++) {
      const d = new Date(year, month - 1, -startPad + i + 1);
      cells.push(this.cell(d, false));
    }
    for (let d = 1; d <= days; d++) cells.push(this.cell(new Date(year, month - 1, d), true));
    while (cells.length % 7) {
      const last = cells[cells.length - 1];
      const next = new Date(last.iso + 'T12:00:00');
      next.setDate(next.getDate() + 1);
      cells.push(this.cell(next, false));
    }
    return cells;
  });

  protected readonly dayItems = computed(() => this.byDay().get(this.selected()) ?? []);

  protected readonly upcoming = computed(() => {
    const start = this.selected();
    return this.visible()
      .filter((i) => i.iso >= start)
      .sort((a, b) => a.iso.localeCompare(b.iso) || a.time.localeCompare(b.time))
      .slice(0, 16);
  });

  protected readonly stats = computed(() => {
    const all = this.items();
    return [
      { label: 'All events', value: String(all.length), change: this.os.school().term + ' · whole school', bars: [3, 4, 4, 5, 6, 6, 7] },
      { label: 'Exams', value: String(all.filter((e) => e.type === 'Exams').length), change: 'Papers and sittings', bars: [4, 5, 5, 6, 5, 6, 6] },
      { label: 'PTMs', value: String(all.filter((e) => e.type === 'PTM').length), change: 'Parents', bars: [2, 3, 3, 4, 4, 5, 4] },
      { label: 'Holidays', value: String(all.filter((e) => e.type === 'Holiday').length), change: 'Term close', bars: [1, 1, 2, 2, 2, 3, 3] },
    ];
  });

  shift(delta: number) {
    const c = this.cursor();
    const next = new Date(c.year, c.month - 1 + delta, 1);
    this.cursor.set({ year: next.getFullYear(), month: next.getMonth() + 1 });
  }

  pick(iso: string) {
    this.selected.set(iso);
  }

  goTo(iso: string) {
    this.selected.set(iso);
    this.cursor.set({ year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) });
  }

  typeClass(type: string) {
    if (type === 'Exams') return 'bg-amber-100 text-amber-800';
    if (type === 'PTM') return 'bg-emerald-100 text-emerald-800';
    if (type === 'Holiday') return 'bg-rose-100 text-rose-800';
    if (type === 'Meeting') return 'bg-sky-100 text-sky-800';
    return 'bg-slate-100 text-slate-700';
  }

  addEvent() {
    if (!this.access.can('calendar', 'create')) return;
    this.modal.open({
      title: 'Add school event',
      confirmLabel: 'Add to calendar',
      select: { key: 'type', options: ['Event', 'Exams', 'PTM', 'Holiday', 'Meeting'] },
      fields: [
        { key: 'title', placeholder: 'Event title *', required: true },
        { key: 'date', placeholder: 'Date *', required: true, type: 'date' },
        { key: 'audience', placeholder: 'Who (e.g. All, P1–P7, Parents)' },
      ],
      onConfirm: async (v) => {
        const title = String(v['title']);
        const date = String(v['date']);
        const type = String(v['type'] || 'Event');
        const audience = String(v['audience'] || 'Whole school');
        if (this.api.token()) {
          try {
            await this.api.post('/calendar', { title, date, type, audience });
          } catch (err) {
            this.toast.show(err instanceof Error ? err.message : 'Could not add that event');
            return false;
          }
        }
        this.os.addEvent(title, date, type, audience);
        this.toast.show(title + ' added to the school calendar');
        const parsed = parseDates(date, this.year());
        if (parsed[0]) {
          this.selected.set(parsed[0]);
          this.cursor.set({ year: Number(parsed[0].slice(0, 4)), month: Number(parsed[0].slice(5, 7)) });
        }
        return;
      },
    });
  }

  private year() {
    return Number(this.os.school().year) || 2026;
  }

  private cell(d: Date, inMonth: boolean) {
    const iso = toIso(d);
    return { iso, day: d.getDate(), inMonth, items: this.byDay().get(iso) ?? [] };
  }

  private collect(): CalItem[] {
    const year = this.year();
    const items: CalItem[] = [];
    for (const e of this.os.events()) {
      for (const iso of parseDates(e.date, year)) {
        items.push({
          key: 'ev-' + e.id + '-' + iso,
          title: e.title,
          type: e.type || 'Event',
          audience: e.audience,
          time: '',
          iso,
          source: 'event',
        });
      }
    }
    for (const e of this.os.exams()) {
      const iso = parseDates(e.examDate, year)[0];
      if (!iso) continue;
      items.push({
        key: 'ex-' + e.id,
        title: e.cls + ' · ' + e.subject,
        type: 'Exams',
        audience: e.cls + ' · ' + e.kind,
        time: e.startTime,
        iso,
        source: 'exam',
      });
    }
    return items.sort((a, b) => a.iso.localeCompare(b.iso) || a.time.localeCompare(b.time) || a.title.localeCompare(b.title));
  }
}

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function parseDates(raw: string, year: number): string[] {
  const text = String(raw || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return [text];
  const range = text.match(/^(\d{1,2})\s*[–-]\s*(\d{1,2})\s+([A-Za-z]{3,})(?:\s+(\d{4}))?$/);
  if (range) {
    const y = Number(range[4] || year);
    const month = MONTH_SHORT[range[3].slice(0, 3).toLowerCase()];
    if (!month) return [];
    const start = Number(range[1]);
    const end = Number(range[2]);
    const days: string[] = [];
    for (let d = start; d <= end; d++) days.push(toIso(new Date(y, month - 1, d)));
    return days;
  }
  const single = text.match(/^(\d{1,2})\s+([A-Za-z]{3,})(?:\s+(\d{4}))?$/);
  if (single) {
    const y = Number(single[3] || year);
    const month = MONTH_SHORT[single[2].slice(0, 3).toLowerCase()];
    if (!month) return [];
    return [toIso(new Date(y, month - 1, Number(single[1])))];
  }
  return [];
}
