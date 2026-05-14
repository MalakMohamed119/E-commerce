import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, ProductResponse } from '../../../core/models/products.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly httpClient = inject(HttpClient);
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Get all products with pagination
   * @param page Page number
   * @returns Observable of ProductResponse
   */
  getAllProducts(page: number = 1): Observable<ProductResponse> {
    const cacheKey = `products_page_${page}`;
    const cachedData = this.getFromCache<ProductResponse>(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    return this.httpClient.get<ProductResponse>(
      `${environment.baseUrl}products?page=${page}`,
      { params: { limit: '20' } } // Limit to 20 items per page
    ).pipe(
      map(response => {
        this.setToCache(cacheKey, response);
        return response;
      }),
      catchError(this.handleError<ProductResponse>('getAllProducts', {
        results: 0,
        metadata: { currentPage: 1, numberOfPages: 1, limit: 20 },
        data: []
      })),
      shareReplay(1) // Cache the last response
    );
  }

  /**
   * Get a single product by ID
   * @param productId Product ID
   * @returns Observable of Product
   */
  getProductById(productId: string): Observable<Product> {
    const cacheKey = `product_${productId}`;
    const cachedData = this.getFromCache<Product>(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    return this.httpClient.get<{ data: Product }>(
      `${environment.baseUrl}products/${productId}`
    ).pipe(
      map(response => {
        this.setToCache(cacheKey, response.data);
        return response.data;
      }),
      catchError(this.handleError<Product>('getProductById')),
      shareReplay(1) // Cache the last response
    );
  }

  /**
   * Search products by name or description
   * @param query Search query
   * @returns Observable of Product[]
   */
  searchProducts(query: string): Observable<Product[]> {
    if (!query.trim()) {
      return of([]);
    }

    return this.httpClient.get<{ data: Product[] }>(
      `${environment.baseUrl}products?title[regex]=${encodeURIComponent(query)}`
    ).pipe(
      map(response => response.data || []),
      catchError(this.handleError<Product[]>('searchProducts', []))
    );
  }

  /**
   * Get products by category
   * @param categoryId Category ID
   * @returns Observable of Product[]
   */
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.httpClient.get<{ data: Product[] }>(
      `${environment.baseUrl}products?category=${categoryId}`
    ).pipe(
      map(response => response.data || []),
      catchError(this.handleError<Product[]>('getProductsByCategory', []))
    );
  }

  // Cache management methods
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const { timestamp, data } = cached;
    const now = Date.now();
    
    if (now - timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return data as T;
  }

  private setToCache(key: string, data: any): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    });
  }

  // Error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Log to a remote logging service if available
      // this.logService.error(`${operation} failed: ${error.message}`);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}
