import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subcategory } from '../../core/models/subcategories.interface';
import { CategoriesService } from '../home/services/categories.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.css'
})
export class SubcategoriesComponent implements OnInit, OnDestroy {
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);

  subcategoriesList: Subcategory[] = [];
  categoryId: string = '';
  categoryName: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadSubcategories();
  }

  private loadSubcategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // First try to get the category name from the current navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['categoryName']) {
      this.categoryName = navigation.extras.state['categoryName'];
      this.setPageTitle();
    }
    
    // Then check query parameters for the name
    this.route.queryParams.subscribe(params => {
      if (params['name']) {
        this.categoryName = decodeURIComponent(params['name']);
        this.setPageTitle();
      }
    });
    
    // Set up the route params subscription for categoryId
    this.route.paramMap.subscribe(params => {
      const categoryId = params.get('categoryId');
      if (categoryId) {
        this.categoryId = categoryId;
        this.getSubcategoriesData(categoryId);
      } else {
        this.errorMessage = 'Invalid category ID';
        this.isLoading = false;
      }
    });
  }
  
  

  getSubcategoriesData(categoryId: string): void {
    this.isLoading = true;
    this.categoriesService.getSubcategories(categoryId).subscribe({
      next: (res) => {
        if (res?.data?.length) {
          this.subcategoriesList = res.data.map((item: any) => ({
            _id: item._id,
            name: item.name,
            slug: item.slug,
            category: item.category,
            image: item.image || 'assets/images/default-subcategory.jpg',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
          }));
        } else {
          this.subcategoriesList = [];
          this.errorMessage = 'No subcategories found for this category';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
        this.subcategoriesList = [];
        this.errorMessage = 'Failed to load subcategories. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  

  private setPageTitle(): void {
    const baseTitle = 'EvoShop';
    if (this.categoryName) {
      this.titleService.setTitle(`${this.categoryName} - Subcategories | ${baseTitle}`);
    } else {
      this.titleService.setTitle(`Subcategories | ${baseTitle}`);
    }
  }

  goBackToCategories(): void {
    this.router.navigate(['/categories']);
  }

  ngOnDestroy(): void {
    // Reset the title when component is destroyed
    this.titleService.setTitle('EvoShop');
  }

  // Add this method to handle subcategory click
  onSubcategoryClick(subcategory: Subcategory): void {
    this.router.navigate(['/products', subcategory._id], { 
      state: { subcategoryName: subcategory.name }
    });
  }
}
