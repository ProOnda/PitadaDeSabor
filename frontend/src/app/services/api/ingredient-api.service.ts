// src/app/services/api/ingredient-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Esta interface DEVE CORRESPONDER ao formato que seu BACKEND retorna
export interface BackendIngredient {
  fdc_id: string;
  ingredient_name: string;
  ingredient_category: string;
  // Adicione outros campos que seu backend possa retornar (ex: 'calories', 'protein')
}

@Injectable({
  providedIn: 'root'
})
export class IngredientApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendApiUrl;

  constructor() { }

  // Chama seu backend para obter detalhes de um ingrediente por FDC ID
  getIngredientDetailsFromBackend(id: string): Observable<BackendIngredient> {
    const url = `${this.baseUrl}/ingredients/${id}`;
    return this.http.get<BackendIngredient>(url);
  }

  // Chama seu backend para pesquisar ingredientes
  searchIngredientsFromBackend(query: string, pageNumber: number = 1, pageSize: number = 20): Observable<{ totalHits: number, currentPage: number, pageSize: number, ingredients: BackendIngredient[] }> {
    const url = `${this.baseUrl}/ingredients/search`;
    let params = new HttpParams();
    params = params.append('query', query);
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return this.http.get<any>(url, { params });
  }
}