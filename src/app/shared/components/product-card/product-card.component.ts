import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Product } from '../../../core/models/products.interface';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  standalone: true,
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showButtonAlways: boolean = false;
  @Input() isInWishlist: boolean = false;
  @Input() isInCart: boolean = false;
  @Output() toggleWishlist = new EventEmitter<string>();
  @Output() addToCart = new EventEmitter<string>();
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onHeartClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.toggleWishlist.emit(this.product.id);
  }

  onCartClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('Adding product to cart:', this.product.id);
    console.log('Current isInCart state:', this.isInCart);
    this.addToCart.emit(this.product.id);
  }
}
