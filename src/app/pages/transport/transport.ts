import { Component } from '@angular/core';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-transport',
  imports: [StatCards],
  templateUrl: './transport.html',
})
export class TransportPage {
  protected readonly stats = [
    { label: 'Routes', value: '4', change: 'Day vans from Seguku', bars: [4, 5, 5, 6, 6, 6, 6] },
    { label: 'Pupils on vans', value: '62', change: 'Baby–P7 day scholars', bars: [6, 7, 7, 8, 8, 9, 9] },
    { label: 'Vehicles', value: '4', change: '1 inspection today', bars: [5, 5, 6, 5, 6, 6, 5] },
    { label: 'On schedule', value: '3 / 4', change: 'This morning', bars: [7, 7, 8, 7, 8, 8, 9] },
  ];
}
