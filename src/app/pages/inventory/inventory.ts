import { Component, computed, inject, signal } from '@angular/core';
import { AccessService } from '../../core/access.service';
import { ApiService } from '../../core/api.service';
import { ModalService } from '../../core/modal.service';
import { paginate } from '../../core/page';
import { SchoolOsStore, type StockItem } from '../../core/school-os.store';
import { ToastService } from '../../core/toast.service';
import { Pager } from '../../shared/pager';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-inventory',
  imports: [StatCards, Pager],
  templateUrl: './inventory.html',
})
export class InventoryPage {
  protected os = inject(SchoolOsStore);
  protected access = inject(AccessService);
  private modal = inject(ModalService);
  private toast = inject(ToastService);
  private api = inject(ApiService);

  protected readonly page = signal(1);
  protected readonly paged = computed(() => paginate(this.os.stock(), this.page()));

  protected readonly stats = computed(() => [
    { label: 'Items', value: String(this.os.stock().length), change: 'Catalogued', bars: [4, 5, 5, 6, 6, 7, 7] },
    { label: 'Units on hand', value: String(this.os.stock().reduce((n, i) => n + i.qty, 0)), change: 'Across stores', bars: [6, 7, 7, 8, 8, 9, 8] },
    { label: 'Low stock', value: String(this.os.stock().filter((i) => i.qty < 20).length), change: 'Below 20 units', bars: [2, 3, 2, 3, 3, 2, 2] },
    { label: 'Stores', value: String(new Set(this.os.stock().map((i) => i.location)).size), change: 'Locations', bars: [3, 3, 4, 4, 4, 5, 5] },
  ]);

  addItem() {
    if (!this.access.can('inventory', 'create')) return;
    this.modal.open({
      title: 'Stock in',
      fields: [
        { key: 'name', placeholder: 'Item name *', required: true },
        { key: 'category', placeholder: 'Category (Stationery, Uniforms…)' },
        { key: 'qty', placeholder: 'Quantity *', required: true },
        { key: 'location', placeholder: 'Store / location' },
      ],
      onConfirm: async (v) => {
        const name = String(v['name']);
        const category = String(v['category'] || 'General');
        const qty = Number(v['qty']) || 1;
        const location = String(v['location'] || 'Main store');
        if (this.api.token()) {
          try {
            const row = await this.api.post<StockItem>('/inventory', { name, category, qty, location });
            this.os.addStock(row.name, row.category, row.qty, row.location, row.id);
          } catch (err) {
            this.toast.show(err instanceof Error ? err.message : 'Could not add that item');
            return false;
          }
        } else {
          this.os.addStock(name, category, qty, location);
        }
        this.page.set(1);
        this.toast.show(name + ' added to inventory');
        return;
      },
    });
  }

  issue(id: number, name: string) {
    this.modal.open({
      title: 'Issue — ' + name,
      fields: [{ key: 'qty', placeholder: 'Quantity to issue *', required: true }],
      onConfirm: async (v) => {
        const qty = Number(v['qty']) || 1;
        if (this.api.token()) {
          try {
            const row = await this.api.patch<StockItem>('/inventory/' + id, { qty });
            this.os.stock.update((list) => list.map((i) => (i.id === id ? row : i)));
          } catch (err) {
            this.toast.show(err instanceof Error ? err.message : 'Could not issue that item');
            return false;
          }
        } else {
          this.os.issueStock(id, qty);
        }
        this.toast.show(name + ' issued');
        return;
      },
    });
  }
}
