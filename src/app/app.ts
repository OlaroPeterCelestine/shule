import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconSprite } from './shared/icon-sprite';
import { ToastHost } from './shared/toast-host';
import { AppModal } from './shared/app-modal';
import { ReportModal } from './shared/report-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconSprite, ToastHost, AppModal, ReportModal],
  template: `
    <app-icon-sprite />
    <router-outlet />
    <app-modal />
    <app-report-modal />
    <app-toast-host />
  `,
})
export class App {}
