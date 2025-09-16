import { CookieService } from 'ngx-cookie-service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  if (cookieService.get('token')) {
    return true;
  } else {
    return router.parseUrl('/login');
  }
};
