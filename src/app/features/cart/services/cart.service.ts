import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly httpClient = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  private getToken(): string | null {
    return this.cookieService.get('token') || null;
  }

  constructor() {
    this.loadCartFromAPI();
  }

  public loadCartFromAPI(): void {
    const token = this.getToken();
    if (token) {
      this.getCartItems().subscribe({
        next: (items: CartItem[]) => {
          this.cartItemsSubject.next(items);
          this.cartCountSubject.next(items.length);
        },
        error: (error: any) => {
          console.error('Error loading cart from API:', error);
        }
      });
    }
  }

  addProductToCart(productId: string): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      console.error('No token found for cart operation');
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Adding product to cart:', productId);
    console.log('Using token:', token);

    return this.httpClient.post(`${environment.baseUrl}cart`,
        { productId: productId },
        {
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          }
        }
      ).pipe(
        tap((response: any) => {
          console.log('Product added to cart via API:', response);
          // Set cartId in cookies if it's in the response
          if (response && response.data && response.data._id) {
            this.cookieService.set('cartId', response.data._id);
            console.log('Cart ID set in cookies:', response.data._id);
          }
          this.loadCartFromAPI();
        }),
        catchError((error) => {
          console.error('Failed to add to cart via API:', error);
          console.error('Error details:', error.error);
          return throwError(() => error);
        })
      );
  }


  updateQuantity(productId: string, quantity: number): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.httpClient.put(`${environment.baseUrl}cart/${productId}`, 
      { count: quantity },
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      tap((response) => {
        console.log('Quantity updated via API:', response);
        this.loadCartFromAPI();
      }),
      catchError((error) => {
        console.error('Failed to update quantity via API:', error);
        return throwError(() => error);
      })
    );
  }


  removeFromCart(productId: string): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.httpClient.delete(`${environment.baseUrl}cart/${productId}`, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(() => {
        console.log('Item removed from cart via API');
        this.loadCartFromAPI();
      }),
      catchError((error) => {
        console.error('Failed to remove from cart via API:', error);
        return throwError(() => error);
      })
    );
  }


  getCartItems(): Observable<CartItem[]> {
    const token = this.getToken();
    
    if (!token) {
      return of([]);
    }

    return this.httpClient.get<any>(`${environment.baseUrl}cart`, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    }).pipe(
      map((response) => {
        if (response&& response.data && response.data.products ) {
          this.cookieService.set('cartId' , response.cartId )
          const cartItems = response.data.products.map((item: any) => ({
            ...item,
            productId: item.product._id,
            product: {
              _id: item.product._id,
              title: item.product.title,
              price: item.price,
              imageCover: item.product.imageCover || item.product.image,
              category: {
                name: item.product.category?.name || 'Uncategorized'
              },
              brand: item.product.brand,
              ratingsAverage: item.product.ratingsAverage,
              ratingsQuantity: item.product.ratingsQuantity
            },
            quantity: item.count,
            totalPrice: item.price * item.count,
            addedAt: new Date()
          }));
          return cartItems;
        }
        return [];
      })
    );
  }

  clearCart(): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      console.error('No token found for clear cart operation');
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Clearing entire cart via API');
    console.log('Using token:', token);

    return this.httpClient.delete(`${environment.baseUrl}cart`, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap((response) => {
        console.log('Cart cleared successfully via API:', response);
        this.cartItemsSubject.next([]);
        this.cartCountSubject.next(0);
      }),
      catchError((error) => {
        console.error('Failed to clear cart via API:', error);
        console.error('Error details:', error.error);
        return throwError(() => error);
      })
    );
  }

  isInCart(productId: string): boolean {
    const currentItems = this.cartItemsSubject.value;
    console.log('Checking if product is in cart:', productId);
    console.log('Current cart items:', currentItems);
    const isInCart = currentItems.some(item => item.productId === productId);
    console.log('Is in cart result:', isInCart);
    return isInCart;
  }

  getCartCount(): number {
    return this.cartItemsSubject.value.length;
  }

  clearAllCartData(): void {
    this.cartItemsSubject.next([]);
    this.cartCountSubject.next(0);
  }
}
