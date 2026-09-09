import { Component, inject } from '@angular/core';
import { DOC_TEMPLATES } from './doc-templates';
import { ReportService } from '../../core/report.service';
import { StatCards } from '../../shared/stat-cards';

@Component({
  selector: 'app-documents',
  imports: [StatCards],
  templateUrl: './documents.html',
})
export class DocumentsPage {
  private report = inject(ReportService);

  protected readonly stats = [
    { label: 'Templates', value: '6', change: 'Ready to generate', bars: [4, 5, 5, 6, 6, 6, 6] },
    { label: 'Issued this term', value: '214', change: 'IDs & letters', bars: [5, 6, 6, 7, 8, 8, 9] },
    { label: 'Certificates', value: '48', change: 'Completion & transfer', bars: [2, 3, 3, 4, 4, 5, 5] },
    { label: 'Payslips', value: '86', change: 'Latest payroll run', bars: [6, 6, 7, 7, 7, 8, 8] },
  ];

  genDoc(type: string) {
    this.report.open(type, DOC_TEMPLATES[type] ?? ('<p>' + type + '</p>'));
  }
}
