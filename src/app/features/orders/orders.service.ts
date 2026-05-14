import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Order {
  _id: string;
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: 'cash' | 'card';
  isPaid: boolean;
  isDelivered: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  cartItems: Array<{
    count: number;
    price: number;
    _id: string;
    product: {
      _id: string;
      title: string;
      imageCover: string;
      category: {
        _id: string;
        name: string;
        slug: string;
        image: string;
      };
      brand: {
        _id: string;
        name: string;
        slug: string;
        image: string;
      };
      ratingsAverage: number;
      ratingsQuantity: number;
    };
  }>;
  createdAt: string;
  updatedAt: string;
  id: number;
  paidAt?: string;
  __v: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly httpClient = inject(HttpClient);

  private getToken(): string | null {
    return localStorage.getItem('token') || 
           localStorage.getItem('userToken') ||
           localStorage.getItem('authToken') ||
           localStorage.getItem('accessToken') ||
           null;
  }

  // Get user orders - simplified approach
  getUserOrders(): Observable<Order[]> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found for orders request');
      return throwError(() => new Error('User not authenticated'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': token
    });

    console.log('Fetching orders from:', `${environment.baseUrl}/orders/`);
    console.log('Using token:', token.substring(0, 20) + '...');

    // Try the main orders endpoint first
    return this.httpClient.get<any>(`${environment.baseUrl}/orders/`, { headers }).pipe(
      map(response => {
        console.log('Raw API response:', response);
        
        // Handle different response structures
        if (Array.isArray(response)) {
          return response;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response?.orders && Array.isArray(response.orders)) {
          return response.orders;
        } else {
          console.warn('Unexpected response structure:', response);
          return [];
        }
      }),
      catchError(error => {
        console.error('Error fetching orders:', error);
        
        // Try alternative endpoint if the first one fails
        if (error.status === 404 || error.status === 403) {
          console.log('Trying alternative endpoint...');
          return this.httpClient.get<any>(`${environment.baseUrl}/orders/user/me`, { headers }).pipe(
            map(response => {
              if (Array.isArray(response)) {
                return response;
              } else if (response?.data && Array.isArray(response.data)) {
                return response.data;
              }
              return [];
            }),
            catchError(altError => {
              console.error('Alternative endpoint also failed:', altError);
              return throwError(() => altError);
            })
          );
        }
        
        return throwError(() => error);
      })
    );
  }

  // Get single order by ID
  getOrderById(orderId: string): Observable<Order> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('User not authenticated'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': token
    });

    return this.httpClient.get<Order>(`${environment.baseUrl}/orders/${orderId}`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching order:', error);
        return throwError(() => error);
      })
    );
  }
}
