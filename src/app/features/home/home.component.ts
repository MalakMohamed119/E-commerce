import { Product } from '../../core/models/products.interface';
import { ProductsService } from './services/products.service';
import { Component, inject, OnInit } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MainSliderComponent } from "./components/main-slider/main-slider.component";
import { PopularCategoriesComponent } from "./components/popularCategories/popularCategories.component";
import { PopularProductsComponent } from "./components/popularProducts/popularProducts.component";

@Component({
  selector: 'app-home',
  imports: [MainSliderComponent, PopularCategoriesComponent, PopularProductsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent {

}
