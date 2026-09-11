import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconSprite } from './shared/icon-sprite';
import { ToastHost } from './shared/toast-host';
import { AppModal } from './shared/app-modal';
import { PdfViewer } from './shared/pdf-viewer';
import { ReportModal } from './shared/report-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconSprite, ToastHost, AppModal, ReportModal, PdfViewer],
  template: `
    <app-icon-sprite />
    <router-outlet />
    <app-modal />
    <app-report-modal />
    <app-pdf-viewer />
    <app-toast-host />
  `,
})
export class App {}
