import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  product: string;
  count: number;
  price: number;
}

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
}

export interface Order {
  _id: string;
  user: string;
  cartItems: OrderItem[];
  shippingAddress: ShippingAddress;
  totalOrderPrice: number;
  paymentMethod: string;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutResponse {
  status: string;
  session?: {
    url: string;
  };
  data?: Order;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  checkoutSession(cartId: string, orderData: any): Observable<CheckoutResponse> {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const url = `${this.baseUrl}orders/checkout-session/${cartId}?url=${window.location.origin}`;
    console.log('Checkout session URL:', url);
    
    return this.http.post(
      url,
      orderData,
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ).pipe(
      map((response: any) => response as CheckoutResponse)
    );
  }

  createCashOrder(cartId: string, orderData: any): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const url = `${this.baseUrl}orders/${cartId}`;
    console.log('Sending cash order request to:', url);
    console.log('Order data:', orderData);
    console.log('Token:', token);
    
    return this.http.post(
      url,
      orderData,
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ).pipe(
      map((response: any) => {
        console.log('Raw API response:', response);
        return response;
      })
    );
  }

  getUserOrders(userId: string): Observable<{ data: Order[] }> {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.http.get(
      `${this.baseUrl}orders/user/${userId}`,
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ).pipe(
      map((response: any) => response as { data: Order[] })
    );
  }

  getOrderById(orderId: string): Observable<{ data: Order }> {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return this.http.get(
      `${this.baseUrl}orders/${orderId}`,
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ).pipe(
      map((response: any) => response as { data: Order })
    );
  }
}
