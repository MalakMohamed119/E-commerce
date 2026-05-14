import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 w-full h-full flex items-center justify-center z-[9999]" [ngClass]="showBackdrop ? 'bg-black bg-opacity-70' : 'pointer-events-none'">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0d6efd]"></div>
        @if (message) {
          <p class="mt-4 text-white text-lg font-medium">{{message}}</p>
        }
      </div>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Loading...';
  @Input() showBackdrop: boolean = true;
}
