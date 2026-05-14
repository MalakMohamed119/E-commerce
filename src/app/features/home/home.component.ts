import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopularCategoriesComponent } from "./components/popularCategories/popularCategories.component";
import { PopularProductsComponent } from "./components/popularProducts/popularProducts.component";
import { MainnComponent } from './components/mainn/mainn.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MainnComponent,
    PopularCategoriesComponent, 
    PopularProductsComponent
  ],
  template: `
    <div class="home-page">
      <section class="mt-0">
        <app-mainn></app-mainn>
      </section>

      <!-- Popular Categories Section -->
      <section class="section">
        <app-popularCategories></app-popularCategories>
      </section>

      <!-- Popular Products Section -->
      <section class="section">
        <app-popularProducts></app-popularProducts>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .section {
      padding: 0 1rem;
    }
  `]
})
export class HomeComponent {}
