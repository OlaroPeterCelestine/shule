import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AccessService } from './access.service';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree(['/dashboard']) : true;
};

export const permGuard: CanActivateFn = (route) => {
  const access = inject(AccessService);
  const router = inject(Router);
  const path = route.routeConfig?.path ?? '';
  return access.canView(path) ? true : router.createUrlTree(['/dashboard']);
};
