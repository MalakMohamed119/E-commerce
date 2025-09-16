import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService, CartItem } from '../cart/services/cart.service';
import { OrderService, ShippingAddress } from '../../core/services/order.service';
import { AuthService } from '../../core/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface CartItemWithProduct {
  _id: string;
  productId: string;
  product?: {
    _id: string;
    title: string;
    price: number;
    imageCover: string;
  };
  count: number;
  quantity: number;
  price: number;
  totalPrice: number;
  addedAt: Date;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);
  private readonly fb = inject(FormBuilder);

  checkoutForm!: FormGroup;
  cartItems: CartItemWithProduct[] = [];
  totalAmount: number = 0;
  loading: boolean = false;
  submitting: boolean = false;
  userCartId: string | null = null;
  paymentMethod: string = 'card';
  isAuthenticated: boolean = false;

  // Payment methods
  paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: 'fas fa-credit-card' },
    { value: 'cash', label: 'Cash on Delivery', icon: 'fas fa-money-bill-wave' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.checkAuthentication();
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      shippingAddress: this.fb.group({
        details: ['', [Validators.required, Validators.minLength(10)]],
        phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
        city: ['', [Validators.required, Validators.minLength(2)]]
      }),
      paymentMethod: ['card', Validators.required]
    });
  }

  private checkAuthentication(): void {
    this.isAuthenticated = this.authService.hasToken();
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
  }

  private loadCartItems(): void {
    this.loading = true;
    this.userCartId = this.cookieService.get('cartId');
    
    if (!this.userCartId) {
      this.router.navigate(['/cart']);
      return;
    }

    this.cartService.getCartItems().subscribe({
      next: (items: any[]) => {
        this.cartItems = items.map(item => ({
          _id: item.productId || item._id,
          productId: item.productId,
          product: {
            _id: item.product?._id || item.productId,
            title: item.product?.title || 'Unknown Product',
            price: item.product?.price || item.price || 0,
            imageCover: item.product?.imageCover || '/assets/images/placeholder.jpg'
          },
          count: item.quantity || item.count,
          quantity: item.quantity || item.count,
          price: item.product?.price || item.price || 0,
          totalPrice: item.totalPrice || (item.product?.price || item.price || 0) * (item.quantity || item.count),
          addedAt: item.addedAt || new Date()
        }));
        this.totalAmount = this.cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.router.navigate(['/cart']);
      }
    });
  }

  onPaymentMethodChange(method: string): void {
    this.paymentMethod = method;
    this.checkoutForm.patchValue({ paymentMethod: method });
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.submitting) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formData = this.checkoutForm.value;
    const orderData = {
      shippingAddress: formData.shippingAddress,
      paymentMethod: formData.paymentMethod
    };

    if (formData.paymentMethod === 'card') {
      this.processCardPayment(orderData);
    } else {
      this.processCashOrder(orderData);
    }
  }

  private processCardPayment(orderData: any): void {
    if (!this.userCartId) {
      this.showToast('Cart not found', 'error');
      this.submitting = false;
      return;
    }

    this.orderService.checkoutSession(this.userCartId, orderData).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.session?.url) {
          // Redirect to payment gateway
          window.location.href = response.session.url;
        } else {
          this.showToast('Payment session failed', 'error');
          this.submitting = false;
        }
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.showToast('Payment failed. Please try again.', 'error');
        this.submitting = false;
      }
    });
  }

  private processCashOrder(orderData: any): void {
    if (!this.userCartId) {
      this.showToast('Cart not found', 'error');
      this.submitting = false;
      return;
    }

    console.log('Creating cash order with data:', orderData);
    console.log('Cart ID:', this.userCartId);

    this.orderService.createCashOrder(this.userCartId, orderData).subscribe({
      next: (response) => {
        console.log('Cash order response:', response);
        
        // Check for different possible response structures
        if (response && (response.data || response.status === 'success' || response._id)) {
          this.showToast('Order created successfully!', 'success');
          this.cartService.clearCart().subscribe({
            next: () => {
              this.router.navigate(['/orders']);
            },
            error: (clearError) => {
              console.error('Error clearing cart:', clearError);
              this.router.navigate(['/orders']);
            }
          });
        } else {
          console.error('Unexpected response structure:', response);
          this.showToast('Failed to create order - unexpected response', 'error');
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Order error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error?.message || error.message);
        
        let errorMessage = 'Failed to create order. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 401) {
          errorMessage = 'Please login first';
        } else if (error.status === 400) {
          errorMessage = 'Invalid order data';
        }
        
        this.showToast(errorMessage, 'error');
        this.submitting = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  getFieldError(fieldPath: string): string {
    const field = this.checkoutForm.get(fieldPath);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldPath)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldPath)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldLabel(fieldPath)} format is invalid`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldPath: string): string {
    const labels: { [key: string]: string } = {
      'shippingAddress.details': 'Address Details',
      'shippingAddress.phone': 'Phone Number',
      'shippingAddress.city': 'City',
      'paymentMethod': 'Payment Method'
    };
    return labels[fieldPath] || fieldPath;
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

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
