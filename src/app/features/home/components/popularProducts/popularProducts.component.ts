import { Component, OnInit, inject } from '@angular/core';
import { ProductCardComponent } from "../../../../shared/components/product-card/product-card.component";
import { Product } from '../../../../core/models/products.interface';
import { ProductsService } from '../../services/products.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-popularProducts',
  templateUrl: './popularProducts.component.html',
  styleUrls: ['./popularProducts.component.css'],
  imports: [ProductCardComponent],
  standalone: true
})
export class PopularProductsComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  productList: Product[] = [];
  
  ngOnInit(): void {
    this.getAllProductsData();
  }
  
  getAllProductsData(): void {
    this.productsService.getAllProducts().subscribe({
      next: (res) => {
        console.log('Products loaded:', res);
        console.log('Products data:', res.data);
        this.productList = res.data;
        console.log('productList after assignment:', this.productList);
      },
      error: (err) => {
        console.log('Error loading products:', err);
      }
    });
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
