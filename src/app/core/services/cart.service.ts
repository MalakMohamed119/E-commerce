import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    imageCover: string;
  };
  count: number;
  price: number;
}

export interface CartResponse {
  status: string;
  numOfCartItems: number;
  data: {
    _id: string;
    cartOwner: string;
    products: CartItem[];
    totalCartPrice: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = environment.baseUrl;
  cartId: string | null = null;
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartId();
  }

  private loadCartId(): void {
    this.cartId = localStorage.getItem('cartId');
  }

  private saveCartId(id: string): void {
    this.cartId = id;
    localStorage.setItem('cartId', id);
  }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}cart`);
  }

  addToCart(productId: string, count: number = 1): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.baseUrl}cart`, {
      productId,
      count
    });
  }

  updateCartItem(productId: string, count: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.baseUrl}cart/${productId}`, {
      count
    });
  }

  removeFromCart(productId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.baseUrl}cart/${productId}`);
  }

  clearCart(): void {
    if (this.cartId) {
      this.http.delete(`${this.baseUrl}cart`).subscribe({
        next: () => {
          this.cartId = null;
          localStorage.removeItem('cartId');
          this.cartCount.next(0);
        },
        error: (error) => console.error('Error clearing cart:', error)
      });
    }
  }

  updateCartCount(count: number): void {
    this.cartCount.next(count);
  }
}
