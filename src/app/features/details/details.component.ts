import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, ProductCardComponent, RouterLink],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
  standalone: true,
})
export class DetailsComponent implements OnInit, OnDestroy {
  // Lightbox properties
  @ViewChild('carousel') carouselRef!: ElementRef<HTMLDivElement>;
  
  lightboxOpen = false;
  lightboxImage = '';
  currentSlide = 0;
  canScrollPrev = false;
  canScrollNext = true;
  
  // Carousel configuration
  private scrollAmount = 300; // Adjust this value based on your card width + margin
  private scrollInterval: any;
private readonly activatedRoute=inject(ActivatedRoute);
private readonly detailsService=inject(DetailsService);
private readonly wishlistService=inject(WishlistService);
private readonly productsService=inject(ProductsService);
private readonly cartService=inject(CartService);
private readonly authService=inject(AuthService);

  id: string | null = null;
  productDetails: Product = {} as Product;
  recommendedProducts: Product[] = [];
  private subscription: Subscription = new Subscription();
  isInWishlist: boolean = false;

  // Lightbox methods
  openLightbox(imageUrl: string): void {
    this.lightboxImage = imageUrl;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    document.body.style.overflow = ''; // Re-enable scrolling
  }

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.getProductId();
  }

  ngAfterViewInit(): void {
    this.checkScrollButtons();
    // Recheck on window resize
    window.addEventListener('resize', this.checkScrollButtons.bind(this));
    
    // Auto-scroll functionality (optional)
    this.setupAutoScroll();
  }

  // Carousel Methods
  scrollCarousel(direction: number): void {
    const carousel = this.carouselRef.nativeElement;
    const scrollAmount = this.scrollAmount * direction;
    
    carousel.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    
    // Update button states after scroll
    setTimeout(() => this.checkScrollButtons(), 300);
  }

  private checkScrollButtons(): void {
    if (!this.carouselRef) return;
    
    const carousel = this.carouselRef.nativeElement;
    this.canScrollPrev = carousel.scrollLeft > 0;
    this.canScrollNext = carousel.scrollLeft < (carousel.scrollWidth - carousel.clientWidth - 1);
  }

  private setupAutoScroll(): void {
    // Auto-scroll every 5 seconds (optional)
    this.scrollInterval = setInterval(() => {
      if (this.canScrollNext) {
        this.scrollCarousel(1);
      } else {
        // If at the end, scroll back to start
        this.carouselRef.nativeElement.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
        this.checkScrollButtons();
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // Make sure to re-enable scrolling if component is destroyed while lightbox is open
    if (this.lightboxOpen) {
      document.body.style.overflow = '';
    }
    window.removeEventListener('resize', this.checkScrollButtons.bind(this));
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  getProductId(): void {
    this.subscription.add(
      this.activatedRoute.paramMap.subscribe({
        next: (params) => {
          this.id = params.get('id');
          if (this.id) {
            this.getDetails();
          }
        },
        error: (err) => console.error('Error getting route params:', err)
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
        if (!res.data || res.data.length === 0) {
          this.recommendedProducts = [];
          return;
        }

        // First, get products from the same category (excluding current product)
        const sameCategoryProducts = res.data.filter(
          product => 
            product.category?.name === this.productDetails.category?.name && 
            product.id !== this.productDetails.id
        );

        // If we have enough products from the same category, use them
        if (sameCategoryProducts.length >= 12) {
          this.recommendedProducts = sameCategoryProducts.slice(0, 12);
          return;
        }

        // If not enough products in the same category, get some from other categories
        const otherCategoryProducts = res.data.filter(
          product => 
            product.category?.name !== this.productDetails.category?.name &&
            product.id !== this.productDetails.id
        );

        // Combine both arrays and take up to 12 products
        this.recommendedProducts = [
          ...sameCategoryProducts,
          ...otherCategoryProducts
        ].slice(0, 12);

        // If still not enough products, fill with random products (excluding current product)
        if (this.recommendedProducts.length < 12) {
          const remaining = 12 - this.recommendedProducts.length;
          const additionalProducts = res.data
            .filter(product => 
              product.id !== this.productDetails.id && 
              !this.recommendedProducts.some(p => p.id === product.id)
            )
            .slice(0, remaining);
          
          this.recommendedProducts = [...this.recommendedProducts, ...additionalProducts];
        }
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
