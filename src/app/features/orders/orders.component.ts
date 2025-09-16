import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
	selector: 'app-orders',
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './orders.component.html',
	styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
	private readonly orderService = inject(OrderService);
	private readonly authService = inject(AuthService);
	public readonly httpClient = inject(HttpClient);

	loading: boolean = false;
	error: string = '';
	orders: any[] = [];

	ngOnInit(): void {
		this.loadOrders();
	}

	private loadOrders(): void {
		this.loading = true;
		this.error = '';

		this.authService.getCurrentUser().subscribe({
			next: (res: any) => {
				const userId = res?.data?._id || res?._id || res?.user?._id;
				if (!userId) {
					this.error = 'لم يتم العثور على هوية المستخدم';
					this.loading = false;
					return;
				}

				this.orderService.getUserOrders(userId).subscribe({
					next: (apiRes: { data: any[] } | any[]) => {
						// API may return array or { data: array }
						this.orders = Array.isArray(apiRes) ? apiRes : (apiRes?.data ?? []);
						this.loading = false;
					},
					error: (err) => {
						this.error = err?.error?.message || 'فشل في تحميل الطلبات';
						this.loading = false;
					}
				});
			},
			error: (err) => {
				this.error = err?.error?.message || 'فشل في جلب بيانات المستخدم';
				this.loading = false;
			}
		});
	}
}
