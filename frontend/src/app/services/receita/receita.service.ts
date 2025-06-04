// src/app/services/receita/receita.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Importe as interfaces atualizadas
import { RecipeDetail, RecipeListItem, RecipeContent, IngredientDetail, RecipeCreationPayload } from '../../interfaces/recipe.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  // A URL base do seu backend (ex: 'http://localhost:3000')
  private readonly backendBaseUrl = environment.backendApiUrl;

  // A URL completa para as rotas de receita, que o backend espera.
  // Se o seu server.js tem `app.use('/api/recipes', recipeRoutes);`,
  // então a URL completa é `http://localhost:3000/api/recipes`.
  private readonly recipesApiBaseUrl = `${this.backendBaseUrl}/api/recipes`;

  private http = inject(HttpClient);

  constructor() { }

  /**
   * Busca os detalhes de uma receita específica pelo ID.
   * @param id O ID da receita.
   * @returns Um Observable que emite os detalhes da receita ou undefined em caso de erro.
   */
  buscarReceitaPorIdComDetalhes(id: string): Observable<RecipeDetail | undefined> {
    // Ex: GET http://localhost:3000/api/recipes/SEU_ID_DA_RECEITA
    return this.http.get<RecipeDetail>(`${this.recipesApiBaseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar receita por ID do backend:', error);
        return of(undefined);
      })
    );
  }

  /**
   * Lista todas as receitas, com filtros opcionais.
   * @param foodType Filtra por tipo de alimento.
   * @param categoryId Filtra por ID de categoria.
   * @param userId Filtra por ID do usuário criador.
   * @returns Um Observable que emite uma lista de itens de receita.
   */
  getRecipes(foodType?: string, categoryId?: string, userId?: string): Observable<RecipeListItem[]> {
    let params = new HttpParams();
    if (foodType) {
      params = params.set('foodType', foodType);
    }
    if (categoryId) {
        params = params.set('categoryId', categoryId);
    }
    if (userId) {
        params = params.set('userId', userId);
    }

    // Ex: GET http://localhost:3000/api/recipes?foodType=Frutas
    return this.http.get<RecipeListItem[]>(this.recipesApiBaseUrl, { params }).pipe(
      catchError(error => {
        console.error('Erro ao listar receitas do backend:', error);
        return of([]);
      })
    );
  }

  /**
   * Salva uma nova receita (POST).
   * @param recipeData Os dados da receita a serem salvos.
   * @returns Um Observable que emite uma mensagem de sucesso e o ID da receita.
   */
  saveRecipe(recipeData: RecipeCreationPayload): Observable<{ message: string; recipeId?: string }> {
    // Ex: POST http://localhost:3000/api/recipes
    return this.http.post<{ message: string; recipeId?: string }>(this.recipesApiBaseUrl, recipeData).pipe(
      catchError(error => {
        console.error('Erro ao criar receita no backend:', error);
        throw error;
      })
    );
  }

  /**
   * Atualiza uma receita existente (PUT).
   * @param recipeId O ID da receita a ser atualizada.
   * @param recipeData Os dados da receita a serem atualizados.
   * @returns Um Observable que emite uma mensagem de sucesso.
   */
  updateRecipe(recipeId: string, recipeData: RecipeCreationPayload): Observable<{ message: string }> {
    // Ex: PUT http://localhost:3000/api/recipes/:id
    return this.http.put<{ message: string }>(`${this.recipesApiBaseUrl}/${recipeId}`, recipeData).pipe(
      catchError(error => {
        console.error('Erro ao atualizar receita no backend:', error);
        throw error;
      })
    );
  }

  /**
   * Deleta uma receita do backend com o ID especificado.
   * @param id O ID da receita a ser deletada.
   * @returns Um Observable que emite um objeto any com o resultado da operação.
   */
  deleteRecipe(id: string): Observable<any> {
    // Ex: DELETE http://localhost:3000/api/recipes/:id
    return this.http.delete(`${this.recipesApiBaseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Erro ao deletar receita no backend:', error);
        throw error;
      })
    );
  }
}