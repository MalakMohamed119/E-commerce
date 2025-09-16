import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DetailsService } from './details.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductsService } from '../home/services/products.service';
import { AuthService } from '../../core/auth/auth.service';
import { Product } from '../../core/models/products.interface';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartService } from '../cart/services/cart.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
  standalone: true,
})
export class DetailsComponent implements OnInit, OnDestroy {
private readonly activatedRoute=inject(ActivatedRoute);
private readonly detailsService=inject(DetailsService);
private readonly wishlistService=inject(WishlistService);
private readonly productsService=inject(ProductsService);
private readonly cartService=inject(CartService);
private readonly authService=inject(AuthService);
private readonly router=inject(Router);

id: string | null = null;
productDetails: Product = {} as Product;
recommendedProducts: Product[] = [];
private subscription: Subscription = new Subscription();
isInWishlist: boolean = false;

ngOnInit(): void {
  this.getProductId();
}

ngOnDestroy(): void {
  this.subscription.unsubscribe();
}

getProductId(): void {
  this.subscription.add(
    this.activatedRoute.paramMap.subscribe({
      next: (urlParam) => {
        this.id = urlParam.get('id');
        if (this.id) {
          this.getDetails();
        }
      }
    })
  );
}

getDetails(): void {
  if (this.id) {
    this.subscription.add(
      this.detailsService.getDetails(this.id).subscribe({
        next: (res) => {
          this.productDetails = res.data;
          this.checkWishlistStatus();
          this.getRecommendedProducts();
          console.log('Product details:', this.productDetails);
        },
        error: (err) => {
          console.log('Error loading product details:', err);
        }
      })
    );
  }
}

checkWishlistStatus(): void {
  if (this.productDetails.id) {
    this.isInWishlist = this.wishlistService.isInWishlist(this.productDetails.id);
  }
}

getRecommendedProducts(): void {
  this.subscription.add(
    this.productsService.getAllProducts().subscribe({
      next: (res) => {
        this.recommendedProducts = res.data
          .filter(product => 
            product.category.name === this.productDetails.category.name && 
            product.id !== this.productDetails.id
          )
          .slice(0, 12);
      },
      error: (err) => {
        console.log('Error loading recommended products:', err);
      }
    })
  );
}

toggleWishlist(): void {
  if (!this.authService.hasToken()) {
    this.router.navigate(['/login']);
    return;
  }

  if (this.isInWishlist) {
    this.wishlistService.removeFromWishlist(this.productDetails.id).subscribe({
      next: (success) => {
        if (success) {
          this.isInWishlist = false;
        }
      },
      error: (error: any) => {
        console.error('Error removing from wishlist:', error);
      }
    });
  } else {
    this.wishlistService.addToWishlist(this.productDetails).subscribe({
      next: (success) => {
        if (success) {
          this.isInWishlist = true;
        }
      },
      error: (error: any) => {
        console.error('Error adding to wishlist:', error);
      }
    });
  }
}

onToggleWishlist(productId: string): void {
  const product = this.recommendedProducts.find(p => p.id === productId);
  if (product) {
    this.wishlistService.toggleWishlist(product).subscribe();
  }
}

onAddToCart(productId: string): void {
  if (!this.authService.hasToken()) {
    this.router.navigate(['/login']);
    return;
  }

  this.cartService.addProductToCart(productId).subscribe({
    next: (response) => {
      console.log('Product added to cart:', response);
      this.showToast('Product added to cart successfully!', 'success');
      // Force change detection to update the UI
      setTimeout(() => {
        // This will trigger change detection
      }, 100);
    },
    error: (error: any) => {
      console.error('Error adding to cart:', error);
      this.showToast('Failed to add product to cart', 'error');
    }
  });
}

addToCart(): void {
  if (!this.authService.hasToken()) {
    this.router.navigate(['/login']);
    return;
  }

  this.cartService.addProductToCart(this.productDetails.id).subscribe({
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

isInWishlistCheck(productId: string): boolean {
  return this.wishlistService.isInWishlist(productId);
}

isInCartCheck(productId: string): boolean {
  return this.cartService.isInCart(productId);
}
}
