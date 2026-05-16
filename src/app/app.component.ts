import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NgxSpinnerModule],
  template: `
    <div class="flex flex-col min-h-screen relative">
      <app-navbar></app-navbar>
      <main class="flex-grow relative">
        <router-outlet></router-outlet>
      </main>
      <app-footer class="mt-auto"></app-footer>
      <ngx-spinner type="ball-scale-multiple"></ngx-spinner>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'E-commerce';
}
