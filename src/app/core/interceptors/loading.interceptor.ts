import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

let totalRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // Skip loading for specific requests if needed
  if (req.url.includes('some-specific-endpoint')) {
    return next(req);
  }
  
  const loadingService = inject(LoadingService);
  
  // Show loading
  if (totalRequests === 0) {
    loadingService.show();
  }
  totalRequests++;

  return next(req).pipe(
    tap({
      next: () => {},
      error: () => {},
      finalize: () => {
        totalRequests--;
        if (totalRequests === 0) {
          loadingService.hide();
        }
      }
    })
  );
};
