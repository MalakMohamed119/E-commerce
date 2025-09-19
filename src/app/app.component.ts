import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, LoadingSpinnerComponent],
  template: `
    <div class="flex flex-col min-h-screen relative">
      <app-navbar></app-navbar>
      <main class="flex-grow relative">
        <router-outlet></router-outlet>
      </main>
      <app-footer class="mt-auto"></app-footer>
      @if (isLoading) {
        <div class="fixed inset-0 z-[9999]">
          <app-loading-spinner [message]="'جاري التحميل...'" [showBackdrop]="true"></app-loading-spinner>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'E-commerce';
  isLoading = false;
  private loadingService = inject(LoadingService);

  ngOnInit() {
    this.loadingService.isLoading$.subscribe(loading => {
      console.log('AppComponent: Loading state changed to', loading);
      this.isLoading = loading;
    });
  }
}
