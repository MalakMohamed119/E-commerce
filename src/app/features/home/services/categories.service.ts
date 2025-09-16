import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoryResponse } from '../../../core/models/categories.interface';
import { SubcategoryResponse } from '../../../core/models/subcategories.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private readonly httpClient = inject(HttpClient);

  getAllCategories(page: number = 1): Observable<CategoryResponse> {
    return this.httpClient.get<CategoryResponse>(environment.baseUrl + `categories?page=${page}`);
  }

  getSubcategories(categoryId: string): Observable<SubcategoryResponse> {
    return this.httpClient.get<SubcategoryResponse>(environment.baseUrl + `categories/${categoryId}/subcategories`);
  }
}
