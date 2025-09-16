import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryResponse } from '../../core/models/categories.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
private readonly httpClient=inject(HttpClient)

getAllCategories():Observable<CategoryResponse>{
return this.httpClient.get<CategoryResponse>(environment.baseUrl+"categories")
}
constructor() { }

}
