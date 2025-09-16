import { Component, inject, OnInit } from '@angular/core';
import { ProductCardComponent } from "../../shared/components/product-card/product-card.component";
import { Product } from '../../core/models/products.interface';
import { ProductsService } from '../home/services/products.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../cart/services/cart.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-products',
  imports: [ProductCardComponent, NgxPaginationModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
})
export class ProductsComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  productList: Product[] = [];
  pageSize!: number;
  p!: number;
  total!: number;

  ngOnInit(): void {
    this.getAllProductsData();
  }

  getAllProductsData(page: number = 1): void {
    this.productsService.getAllProducts(page).subscribe({
      next: (res) => {
        console.log('Products loaded:', res);
        this.productList = res.data;
        this.pageSize = res.metadata.limit;
        this.p = res.metadata.currentPage;
        this.total = res.results;
      },
      error: (err) => {
        console.log('Error loading products:', err);
      }
    });
  }

  PageChanged(page: number): void {
    this.getAllProductsData(page);
  }

  onToggleWishlist(productId: string): void {
    const product = this.productList.find(p => p.id === productId);
    if (product) {
      this.wishlistService.toggleWishlist(product).subscribe({
        next: (success) => {
          if (success) {
            this.showToast(
              this.isInWishlist(productId) ? 'Removed from wishlist' : 'Added to wishlist',
              'success'
            );
          }
        },
        error: (error: any) => {
          console.error('Error toggling wishlist:', error);
          this.showToast('Failed to update wishlist', 'error');
        }
      });
    }
  }

  onAddToCart(productId: string): void {
    this.cartService.addProductToCart(productId).subscribe({
      next: (response) => {
        console.log('Product added to cart:', response);
        this.showToast('Product added to cart successfully!', 'success');
      },
      error: (error: any) => {
        console.error('Error adding to cart:', error);
        this.showToast('Failed to add product to cart', 'error');
      }
    });
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
