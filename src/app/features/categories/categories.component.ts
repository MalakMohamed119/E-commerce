import { Component, inject } from '@angular/core';
import { Category } from '../../core/models/categories.interface';
import { CategoriesService } from '../home/services/categories.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
  standalone: true,
})
export class CategoriesComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);

  categoriesList: Category[] = [];

  ngOnInit(): void {
    this.getAllCategoriesData();
  }

  getAllCategoriesData(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (res) => {
        console.log('Categories loaded:', res);
        this.categoriesList = res.data;
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

  onCategoryClick(category: Category): void {
    // Navigate to subcategories page with category ID in URL and name in state
    this.router.navigate(['/subcategories', category._id], {
      state: { categoryName: category.name },
      queryParams: { name: encodeURIComponent(category.name) }
    });
  }
}
