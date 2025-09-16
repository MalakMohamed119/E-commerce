import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Product } from '../models/products.interface';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();
  private readonly baseUrl = 'https://ecommerce.routemisr.com/api/v1/wishlist';
  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);

  constructor() {
    this.loadWishlistFromAPI();
  }

  private getToken(): string | null {
    return this.cookieService.get('token') || null;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'token': token || '',
      'Content-Type': 'application/json'
    });
  }

  public loadWishlistFromAPI(): void {
    const token = this.getToken();
    if (token) {
      this.getWishlistFromAPI().subscribe({
        next: (items: Product[]) => {
          this.wishlistSubject.next(items);
        },
        error: (error: any) => {
          console.error('Error loading wishlist from API:', error);
        }
      });
    }
  }

  private getWishlistFromAPI(): Observable<Product[]> {
    const token = this.getToken();
    
    if (!token) {
      return of([]);
    }

    return this.http.get<any>(this.baseUrl, { 
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error loading wishlist from API:', error);
          return of([]);
        })
      );
  }

  addToWishlist(product: Product): Observable<boolean> {
    const token = this.getToken();
    
    if (!token) {
      console.error('No token found for wishlist operation');
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Adding product to wishlist:', product.id);
    console.log('Using token:', token);

    return this.http.post<any>(this.baseUrl, { productId: product.id }, { 
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })
      .pipe(
        tap((response) => {
          console.log('Product added to wishlist via API:', response);
          this.loadWishlistFromAPI();
        }),
        map(response => response.status === 'success'),
        catchError(error => {
          console.error('Error adding to wishlist via API:', error);
          console.error('Error details:', error.error);
          return throwError(() => error);
        })
      );
  }

  toggleWishlist(product: Product): Observable<boolean> {
    if (this.isInWishlist(product.id)) {
      return this.removeFromWishlist(product.id);
    } else {
      return this.addToWishlist(product);
    }
  }

  removeFromWishlist(productId: string): Observable<boolean> {
    const token = this.getToken();
    
    if (!token) {
      console.error('No token found for wishlist remove operation');
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Removing product from wishlist:', productId);
    console.log('Using token:', token);

    return this.http.delete<any>(`${this.baseUrl}/${productId}`, { 
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })
      .pipe(
        tap((response) => {
          console.log('Item removed from wishlist via API:', response);
          this.loadWishlistFromAPI();
        }),
        map(response => response.status === 'success'),
        catchError(error => {
          console.error('Error removing from wishlist via API:', error);
          console.error('Error details:', error.error);
          return throwError(() => error);
        })
      );
  }

  isInWishlist(productId: string): boolean {
    const currentItems = this.wishlistSubject.value;
    return currentItems.some((item: Product) => item.id === productId);
  }

  getWishlistItems(): Product[] {
    return this.wishlistSubject.value;
  }

  clearWishlist(): Observable<boolean> {
    const token = this.getToken();
    
    if (!token) {
      console.error('No token found for clear wishlist operation');
      return throwError(() => new Error('User not authenticated'));
    }

    console.log('Clearing entire wishlist via API');
    console.log('Using token:', token);

    // Get all wishlist items first, then remove them one by one
    const currentItems = this.wishlistSubject.value;
    
    if (currentItems.length === 0) {
      console.log('Wishlist is already empty');
      return of(true);
    }

    // Remove each item individually since there might not be a clear all endpoint
    const removeRequests = currentItems.map(item => 
      this.removeFromWishlist(item.id)
    );

    return forkJoin(removeRequests).pipe(
      map(() => {
        console.log('All wishlist items removed successfully');
        this.wishlistSubject.next([]);
        return true;
      }),
      catchError(error => {
        console.error('Error clearing wishlist:', error);
        return throwError(() => error);
      })
    );
  }

  getWishlistCount(): number {
    return this.wishlistSubject.value.length;
  }

  refreshWishlist(): void {
    this.loadWishlistFromAPI();
  }

  clearAllWishlistData(): void {
    this.wishlistSubject.next([]);
  }
}
