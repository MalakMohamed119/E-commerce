import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from './services/cart.service';
import { ProductsService } from '../home/services/products.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import { Product } from '../../core/models/products.interface';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface CartItemWithProduct extends CartItem {
  product?: Product;
  totalPrice?: number;
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  standalone: true,
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly productsService = inject(ProductsService);
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService)

  cartItems: CartItemWithProduct[] = [];
  totalAmount: number = 0;
  loading: boolean = false;
  userCartId!:string

  ngOnInit(): void {
    console.log('CartComponent initialized');
    this.userCartId = this.cookieService.get('cartId');
    console.log('Retrieved cartId from cookies:', this.userCartId);
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.loading = true;
    this.cartService.getCartItems().subscribe({
      next: (res) => {
        console.log(res)
        this.cartItems = res;
        this.calculateTotal();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
        this.cartItems = [];
        this.loading = false;
      }
    });
  }
  

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.cartService.updateQuantity(productId, newQuantity).subscribe({
      next: (response: any) => {
        if (response && response.status === 'success') {
          // Reload cart items to get the updated data
          this.loadCartItems();
        }
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        // Reload cart items to sync with server state
        this.loadCartItems();
      }
    });
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: (response: any) => {
        if (response && response.status === 'success') {
          // Reload cart items to get the updated data
          this.loadCartItems();
        }
      },
      error: (error) => {
        console.error('Error removing item from cart:', error);
        // Reload cart items to sync with server state
        this.loadCartItems();
      }
    });
  }

  increaseQuantity(productId: string): void {
    const item = this.cartItems.find(item => item.productId === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: string): void {
    const item = this.cartItems.find(item => item.productId === productId);
    if (item && item.quantity > 1) {
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  private calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce((total, item) => {
      return total + (item.totalPrice || 0);
    }, 0);
  }


  

  clearCart(): void {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.clearCart().subscribe({
      next: () => {
        this.cartItems = [];
        this.totalAmount = 0;
        this.showToast('Cart cleared successfully', 'success');
      },
      error: (error: any) => {
        console.error('Error clearing cart:', error);
        this.showToast('Failed to clear cart', 'error');
      }
    });
  }

  toggleWishlist(product: Product): void {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }

    if (product) {
      this.wishlistService.toggleWishlist(product).subscribe({
        next: (success) => {
          if (success) {
            this.showToast(
              this.isInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist',
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

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
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

  OnDestroy():void{
    this.cookieService.delete('cartId')
  }
}
