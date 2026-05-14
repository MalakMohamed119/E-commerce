import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../../features/cart/services/cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly httpClient=inject(HttpClient);
  private readonly cookieService=inject(CookieService);
  private readonly router=inject(Router);
  private wishlistService?: WishlistService;
  private cartService?: CartService;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public environment = environment;

registerForm(data:object):Observable<any>{
  return this.httpClient.post(environment.baseUrl+'auth/signup',data)
}

loginForm(loginData: {email: string, password: string}): Observable<any> {
  return this.httpClient.post(`${environment.baseUrl}auth/signin`, loginData).pipe(
    tap((response: any) => {
      if (response?.token) {
        // Save token in all possible storage locations for compatibility
        localStorage.setItem('userToken', response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('accessToken', response.token);
        
        // Also save in cookies
        this.cookieService.set('userToken', response.token);
        this.cookieService.set('token', response.token);
        
        // Update authentication state
        this.isAuthenticatedSubject.next(true);
      }
    }),
    catchError(error => {
      console.error('Login error:', error);
      return throwError(() => error);
    })
  );
}

forgotPassword(email: string): Observable<any> {
  console.log('Testing forgot password API endpoints...');
  
  // Try different forgot password endpoints
  const forgotEndpoints = [
    'auth/forgotPasswords',
    'auth/forgotPassword',
    'auth/forgot-password',
    'users/forgotPassword',
    'password/forgot'
  ];
  
  const tryForgotEndpoint = (endpointIndex: number): Observable<any> => {
    if (endpointIndex >= forgotEndpoints.length) {
      return throwError(() => new Error('No working forgot password API endpoint found'));
    }
    
    const endpoint = forgotEndpoints[endpointIndex];
    console.log(`Trying forgot password endpoint ${endpointIndex + 1}/${forgotEndpoints.length}: ${endpoint}`);
    
    return this.httpClient.post(environment.baseUrl + endpoint, { email }, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap((response: any) => {
        console.log(`SUCCESS with forgot password ${endpoint}:`, response);
      }),
      catchError((error: any) => {
        console.error(`Failed with forgot password ${endpoint}:`, error.status, error.error?.message);
        
        // If 404, try next endpoint
        if (error.status === 404 && endpointIndex < forgotEndpoints.length - 1) {
          console.log('Forgot password endpoint not found, trying next...');
          return tryForgotEndpoint(endpointIndex + 1);
        }
        
        return throwError(() => error);
      })
    );
  };
  
  return tryForgotEndpoint(0);
}

resetPassword(data: { email: string, resetCode: string, newPassword: string }): Observable<any> {
  console.log('🔄 RESET PASSWORD ATTEMPT');
  console.log('Email:', data.email);
  console.log('Reset Code:', data.resetCode);
  console.log('New Password Length:', data.newPassword?.length);
  
  // Test different payload structures that might work
  const payloadVariations = [
    {
      email: data.email,
      resetCode: data.resetCode,
      newPassword: data.newPassword
    },
    {
      email: data.email,
      resetCode: parseInt(data.resetCode),
      newPassword: data.newPassword
    },
    {
      email: data.email,
      code: data.resetCode,
      newPassword: data.newPassword
    },
    {
      email: data.email,
      code: parseInt(data.resetCode),
      newPassword: data.newPassword
    },
    {
      email: data.email,
      resetCode: data.resetCode,
      password: data.newPassword
    },
    {
      email: data.email,
      resetCode: parseInt(data.resetCode),
      password: data.newPassword
    }
  ];

  const tryPayload = (payloadIndex: number): Observable<any> => {
    if (payloadIndex >= payloadVariations.length) {
      return throwError(() => new Error('All payload variations failed'));
    }

    const payload = payloadVariations[payloadIndex];
    console.log(`🧪 Testing payload ${payloadIndex + 1}/${payloadVariations.length}:`, payload);

    return this.httpClient.put(environment.baseUrl + 'auth/resetPassword', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap((response: any) => {
        console.log('✅ RESET PASSWORD SUCCESS!');
        console.log('Response:', response);
        console.log('Status:', response?.status || 'No status');
        console.log('Message:', response?.message || 'No message');
        
        // Check if response indicates actual success
        if (response?.message?.toLowerCase().includes('success') || 
            response?.status === 'success' ||
            response?.data) {
          console.log('✅ Password actually updated in database');
        } else {
          console.log('⚠️ Response might be fake success - check API implementation');
        }
      }),
      catchError((error: any) => {
        console.error(`❌ Payload ${payloadIndex + 1} failed:`, error.status, error.error?.message);
        
        // Try next payload variation
        if (payloadIndex < payloadVariations.length - 1) {
          console.log('Trying next payload variation...');
          return tryPayload(payloadIndex + 1);
        }
        
        // If all payloads failed, try different HTTP methods
        console.log('🔄 Trying POST method as fallback...');
        return this.httpClient.post(environment.baseUrl + 'auth/resetPassword', payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).pipe(
          tap((response: any) => {
            console.log('✅ POST SUCCESS:', response);
          }),
          catchError((postError: any) => {
            console.error('❌ POST also failed:', postError);
            return throwError(() => error);
          })
        );
      })
    );
  };

  return tryPayload(0);
}

updateUserData(data: { name: string, email: string, phone: string }): Observable<any> {
  const token = this.cookieService.get('token');
  
  if (!token) {
    console.error('No token found for profile update');
    return throwError(() => new Error('User not authenticated'));
  }

  console.log('Updating user profile with data:', data);
  console.log('Using token:', token);

  // The API might expect different field names or structure
  // Let's try different data formats
  const dataFormats = [
    data, // Original format
    { name: data.name, email: data.email, phone: data.phone }, // Explicit format
    { name: data.name, email: data.email, phone: data.phone, _id: this.cookieService.get('userId') }, // With user ID
    { user: data }, // Wrapped in user object
    { data: data } // Wrapped in data object
  ];

  const fullUrl = environment.baseUrl + 'users/updateMe/';
  const headers = new HttpHeaders({
    'token': token,
    'Content-Type': 'application/json'
  });

  console.log(`Using working endpoint: PUT ${fullUrl}`);
  console.log('Headers:', headers);
  
  // Try different data formats
  const tryDataFormat = (index: number): Observable<any> => {
    if (index >= dataFormats.length) {
      return throwError(() => new Error('All data formats failed'));
    }

    const currentData = dataFormats[index];
    console.log(`Trying data format ${index + 1}/${dataFormats.length}:`, currentData);
    
    return this.httpClient.put(fullUrl, currentData, { headers }).pipe(
      tap((response: any) => {
        console.log(`✅ Profile update successful with format ${index + 1}:`, response);
      }),
      catchError((error: any) => {
        console.error(`❌ Data format ${index + 1} failed:`, error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error?.message || error.message);
        console.error('Full error:', error.error);
        
        if (index < dataFormats.length - 1) {
          console.log('🔄 Trying next data format...');
          return tryDataFormat(index + 1);
        } else {
          return throwError(() => error);
        }
      })
    );
  };

  return tryDataFormat(0);
}


verifyToken(): Observable<any> {
  const token = this.cookieService.get('token');
  if (!token) {
    console.error('No token found for verification');
    return throwError(() => new Error('No token found'));
  }
  
  console.log('Verifying token:', token);
  
  return this.httpClient.get(environment.baseUrl + 'auth/verifyToken', {
    headers: {
      'token': token,
      'Content-Type': 'application/json'
    }
  }).pipe(
    tap((response: any) => {
      console.log('Token verification response:', response);
    }),
    catchError((error: any) => {
      console.error('Token verification error:', error);
      console.error('Error details:', error.error);
      return throwError(() => error);
    })
  );
}

getCurrentUser(): Observable<any> {
  const token = this.cookieService.get('token');
  if (!token) {
    console.error('No token found for getCurrentUser');
    return throwError(() => new Error('No token found'));
  }
  
  console.log('Getting current user with token:', token);
  
  return this.httpClient.get(environment.baseUrl + 'users/getMe', {
    headers: {
      'token': token,
      'Content-Type': 'application/json'
    }
  }).pipe(
    tap((response: any) => {
      console.log('Get user response:', response);
    }),
    catchError((error: any) => {
      console.error('Get user error:', error);
      console.error('Error details:', error.error);
      return throwError(() => error);
    })
  );
}

saveToken(token: string): void {
  this.cookieService.set('token', token);
  this.isAuthenticatedSubject.next(true);
  
  // Verify token validity
  this.verifyToken().subscribe({
    next: (response) => {
      console.log('Token is valid:', response);
      // Load cart and wishlist data after successful token verification
      this.loadUserData();
    },
    error: (error) => {
      console.error('Token verification failed:', error);
      // Token is invalid, logout user
      this.logout();
    }
  });
}

private loadUserData(): void {
  try {
    if (!this.wishlistService) {
      this.wishlistService = inject(WishlistService);
    }
    this.wishlistService.loadWishlistFromAPI();
  } catch (error) {
    console.log('WishlistService not available during login');
  }
  
  try {
    if (!this.cartService) {
      this.cartService = inject(CartService);
    }
    this.cartService.loadCartFromAPI();
  } catch (error) {
    console.log('CartService not available during login');
  }
}

getToken(): string | null {
  return this.cookieService.get('token') || null;
}

hasToken(): boolean {
  return !!this.getToken();
}

verifyTokenLegacy(): Observable<any> {
  const token = this.getToken();
  if (!token) {
    return new Observable(observer => {
      observer.error('No token found');
    });
  }
  
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  
  return this.httpClient.get(environment.baseUrl + 'auth/verifyToken', { headers });
}

logout(): void {
  this.cookieService.delete('token');
  this.cookieService.delete('user_wishlist');
  localStorage.removeItem('wishlist');
  localStorage.removeItem('cart');
  
  // Clear wishlist and cart data if services are available
  try {
    if (!this.wishlistService) {
      this.wishlistService = inject(WishlistService);
    }
    this.wishlistService.clearAllWishlistData();
  } catch (error) {
    console.log('WishlistService not available during logout');
  }
  
  try {
    if (!this.cartService) {
      this.cartService = inject(CartService);
    }
    this.cartService.clearAllCartData();
  } catch (error) {
    console.log('CartService not available during logout');
  }
  
  this.isAuthenticatedSubject.next(false);
  this.router.navigate(['/login']);
}

}
