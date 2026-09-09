import { Component, computed, inject } from '@angular/core';
import { SchoolOsStore } from '../../core/school-os.store';
import { ModalService } from '../../core/modal.service';
import { ToastService } from '../../core/toast.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-inventory',
  imports: [StatCards],
  templateUrl: './inventory.html',
})
export class InventoryPage {
  protected os = inject(SchoolOsStore);
  private modal = inject(ModalService);
  private toast = inject(ToastService);

  protected readonly stats = computed(() => [
    { label: 'Items', value: String(this.os.stock().length), change: 'Catalogued', bars: [4, 5, 5, 6, 6, 7, 7] },
    { label: 'Units on hand', value: String(this.os.stock().reduce((n, i) => n + i.qty, 0)), change: 'Across stores', bars: [6, 7, 7, 8, 8, 9, 8] },
    { label: 'Low stock', value: String(this.os.stock().filter((i) => i.qty < 20).length), change: 'Below 20 units', bars: [2, 3, 2, 3, 3, 2, 2] },
    { label: 'Stores', value: String(new Set(this.os.stock().map((i) => i.location)).size), change: 'Locations', bars: [3, 3, 4, 4, 4, 5, 5] },
  ]);

  addItem() {
    this.modal.open({
      title: 'Stock in',
      fields: [
        { key: 'name', placeholder: 'Item name *', required: true },
        { key: 'category', placeholder: 'Category (Stationery, Uniforms…)' },
        { key: 'qty', placeholder: 'Quantity *', required: true },
        { key: 'location', placeholder: 'Store / location' },
      ],
      onConfirm: (v) => {
        this.os.addStock(String(v['name']), String(v['category'] || 'General'), Number(v['qty']) || 1, String(v['location'] || 'Main store'));
        this.toast.show(v['name'] + ' added to inventory');
      },
    });
  }

  issue(id: number, name: string) {
    this.modal.open({
      title: 'Issue — ' + name,
      fields: [{ key: 'qty', placeholder: 'Quantity to issue *', required: true }],
      onConfirm: (v) => {
        this.os.issueStock(id, Number(v['qty']) || 1);
        this.toast.show(name + ' issued');
      },
    });
  }
}
