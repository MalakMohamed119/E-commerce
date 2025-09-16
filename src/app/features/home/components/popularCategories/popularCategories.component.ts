import { CategoriesService } from '../../services/categories.service';
import { Component, inject, OnInit } from '@angular/core';
import { Category } from '../../../../core/models/categories.interface';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-popularCategories',
  templateUrl: './popularCategories.component.html',
  styleUrls: ['./popularCategories.component.css'],
  standalone: true,
  imports:[CarouselModule]
})
export class PopularCategoriesComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['<', '>'],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 6
      }
    },
    // nav: true,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true
  }
  categoriesList:Category[] = [];

  
  constructor() { }

  ngOnInit(): void {
    this.getAllCategoriesData();
  }

  getAllCategoriesData(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (res) => {
        console.log('Categories loaded:', res);
        console.log('Categories data:', res.data);
        this.categoriesList = res.data;
        console.log('categoriesList after assignment:', this.categoriesList);
      },
      error: (err) => {
        console.log('Error loading categories:', err);
      }
    });
  }

  onImageError(event: any): void {
    console.log('Image failed to load:', event.target.src);
    event.target.src = 'assets/images/placeholder.jpg'; // fallback image
  }

  onImageLoad(event: any): void {
    console.log('Image loaded successfully:', event.target.src);
  }
}
