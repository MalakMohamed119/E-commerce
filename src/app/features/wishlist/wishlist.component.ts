import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../cart/services/cart.service';
import { Product } from '../../core/models/products.interface';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit, OnDestroy {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  wishlistItems: Product[] = [];
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.wishlistService.wishlist$.subscribe(items => {
        this.wishlistItems = items;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(productId).subscribe();
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist().subscribe({
      next: (success) => {
        if (success) {
          this.showToast('Wishlist cleared successfully!', 'success');
        }
      },
      error: (error) => {
        console.error('Error clearing wishlist:', error);
        this.showToast('Failed to clear wishlist', 'error');
      }
    });
  }

  onAddToCart(productId: string): void {
    this.cartService.addProductToCart(productId).subscribe({
      next: (response) => {
        console.log('Product added to cart:', response);
        this.showToast('Product added to cart successfully!', 'success');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.showToast('Failed to add product to cart', 'error');
      }
    });
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  private showToast(message: string, type: 'success' | 'error'): void {
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
    
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
