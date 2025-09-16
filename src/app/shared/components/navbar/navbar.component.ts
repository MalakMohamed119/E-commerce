import { Component, AfterViewInit, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AuthService } from '../../../core/auth/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../features/cart/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [RouterLink,],
  standalone: true,
})
export class NavbarComponent implements AfterViewInit, OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  
  wishlistCount: number = 0;
  cartCount: number = 0;
  private subscription = new Subscription();

  // Deprecated: kept for compatibility with template until fully removed
  @Input() isLogin: boolean = false;

  // New explicit flag (true when authenticated)
  isAuthenticated: boolean = false;

  ngOnInit(): void {
    // Subscribe to authentication state
    this.subscription.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        // Maintain backward-compat value but avoid confusion
        this.isLogin = !isAuth;

        if (isAuth) {
          // User is logged in, subscribe to counts
          this.subscribeToServices();
        } else {
          // User is logged out, reset counts
          this.wishlistCount = 0;
          this.cartCount = 0;
        }
      })
    );
  }

  private subscribeToServices(): void {
    this.subscription.add(
      this.wishlistService.wishlist$.subscribe(items => {
        this.wishlistCount = items.length;
        console.log('Navbar wishlist count updated:', this.wishlistCount);
      })
    );
    
    this.subscription.add(
      this.cartService.cartCount$.subscribe(count => {
        this.cartCount = count;
        console.log('Navbar cart count updated:', this.cartCount);
      })
    );
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  signOut(): void {
    this.authService.logout();
  }
}
