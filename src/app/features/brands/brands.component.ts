import { Component, inject } from '@angular/core';
import { Brand } from '../../core/models/brands.interface';
import { BrandsService } from '../home/services/brands.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brands',
  imports: [CommonModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
  standalone: true,
})
export class BrandsComponent {
  private readonly brandsService = inject(BrandsService);

  brandsList: Brand[] = [];
  selectedBrand: Brand | null = null;
  showModal: boolean = false;

  ngOnInit(): void {
    this.getAllBrandsData();
  }

  getAllBrandsData(): void {
    this.brandsService.getAllBrands().subscribe({
      next: (res) => {
        console.log('Brands loaded:', res);
        this.brandsList = res.data;
      },
      error: (err) => {
        console.log('Error loading brands:', err);
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

  onBrandClick(brand: Brand): void {
    this.selectedBrand = brand;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBrand = null;
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
