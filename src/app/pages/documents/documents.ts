import { Component, inject } from '@angular/core';
import { DOC_TEMPLATES } from './doc-templates';
import { ReportService } from '../../core/report.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.html',
})
export class DocumentsPage {
  private report = inject(ReportService);

  genDoc(type: string) {
    this.report.open(type, DOC_TEMPLATES[type] ?? ('<p>' + type + '</p>'));
  }
}
