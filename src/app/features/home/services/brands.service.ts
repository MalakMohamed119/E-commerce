import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Brand, BrandResponse } from '../../../core/models/brands.interface';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {
  private readonly httpClient = inject(HttpClient);

  getAllBrands(page: number = 1): Observable<BrandResponse> {
    return this.httpClient.get<BrandResponse>(environment.baseUrl + `brands?page=${page}`);
  }

  getBrandById(brandId: string): Observable<{data: Brand}> {
    return this.httpClient.get<{data: Brand}>(environment.baseUrl + `brands/${brandId}`);
  }
}
