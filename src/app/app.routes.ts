import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { BrandsComponent } from './features/brands/brands.component';
import { CartComponent } from './features/cart/cart.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { DetailsComponent } from './features/details/details.component';
import { HomeComponent } from './features/home/home.component';
import { NotfoundComponent } from './features/notfound/notfound.component';
import { ProductsComponent } from './features/products/products.component';
import { WishlistComponent } from './features/wishlist/wishlist.component';
import { AblankLayoutComponent } from './core/layouts/ablank-layout/ablank-layout.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { SubcategoriesComponent } from './features/subcategories/subcategories.component';
import { isLoggedGuard } from './core/guards/is-logged.guard';
import { ProfileComponent } from './features/profile/profile.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrdersComponent } from './features/orders/orders.component';

export const routes: Routes = [
	{path: '', redirectTo: 'home', pathMatch: 'full'},
	{path: '' , component: AuthLayoutComponent,canActivate:[isLoggedGuard] , children: [
		{path: 'login', component: LoginComponent , title: 'Login page'},
		{path: 'register', component: RegisterComponent , title: 'Register page'},
		{path: 'forgot-password', component: ForgotPasswordComponent , title: 'Forgot Password page'},
		{path: 'reset-password', component: ResetPasswordComponent , title: 'Reset Password page'}
	]},
	
	// Public routes (no authentication required)
	{path: '', component: AblankLayoutComponent, children: [
		{path: 'home', component: HomeComponent, title: 'Home page'},
		{path: 'products', component: ProductsComponent, title: 'Products page'},
		{path: 'categories', component: CategoriesComponent, title: 'Categories page'},
		{path: 'brands', component: BrandsComponent, title: 'Brands page'},
		{path: 'details/:id/:slug?', component: DetailsComponent, title: 'Product Details'},
		{path: 'subcategories/:categoryId', component: SubcategoriesComponent, title: 'Subcategories'},
	]},
	
	// Protected routes (authentication required)
	{path: '', component: AblankLayoutComponent, canActivate: [authGuard], children: [
		{path: 'profile', component: ProfileComponent, title: 'Profile'},
		{path: 'wishlist', component: WishlistComponent, title: 'Wishlist'},
		{path: 'cart', component: CartComponent, title: 'Shopping Cart'},
		{path: 'checkout', component: CheckoutComponent, title: 'Checkout'},
		{path: 'orders', component: OrdersComponent, title: 'My Orders'},
		{path: 'allorders', component: OrdersComponent, title: 'My Orders'},
	]},
	
	// 404 Not Found (must be last)
	{path: '**', component: NotfoundComponent, title: 'Page Not Found'}
];
