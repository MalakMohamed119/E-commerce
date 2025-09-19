import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  show() {
    console.log('LoadingService: Show loading');
    this.isLoading.next(true);
  }

  hide() {
    console.log('LoadingService: Hide loading');
    this.isLoading.next(false);
  }

  getLoadingState() {
    return this.isLoading$;
  }
}
