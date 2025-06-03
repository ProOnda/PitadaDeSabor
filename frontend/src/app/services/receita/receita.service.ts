// src/app/services/receita/receita.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Importe as interfaces atualizadas (incluindo as novas de payload)
import { RecipeDetail, RecipeListItem, RecipeContent, IngredientDetail, RecipeCreationPayload } from '../../interfaces/recipe.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private readonly backendApiUrl = environment.backendApiUrl;
  private http = inject(HttpClient);

  constructor() { }

  buscarReceitaPorIdComDetalhes(id: string): Observable<RecipeDetail | undefined> {
    return this.http.get<RecipeDetail>(`${this.backendApiUrl}/recipes/${id}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar receita por ID do backend:', error);
        return of(undefined);
      })
    );
  }

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

    return this.http.get<RecipeListItem[]>(`${this.backendApiUrl}/recipes`, { params }).pipe(
      catchError(error => {
        console.error('Erro ao listar receitas do backend:', error);
        return of([]);
      })
    );
  }

  // **AJUSTE AQUI**: A interface de entrada deve ser RecipeCreationPayload
  saveRecipe(recipeData: RecipeCreationPayload & { id?: string }): Observable<{ message: string; recipeId?: string }> {
    if (recipeData.id) { // Atualizar
      const recipeId = recipeData.id;
      // Não envie o ID no corpo da requisição para PUT
      const dataToSend = { ...recipeData };
      delete dataToSend.id;
      return this.http.put<{ message: string }>(`${this.backendApiUrl}/recipes/${recipeId}`, dataToSend).pipe(
        catchError(error => {
          console.error('Erro ao atualizar receita no backend:', error);
          throw error;
        })
      );
    } else { // Criar
      // O backend espera o payload RecipeCreationPayload, que não tem 'id'
      return this.http.post<{ message: string; recipeId?: string }>(`${this.backendApiUrl}/recipes`, recipeData).pipe(
        catchError(error => {
          console.error('Erro ao criar receita no backend:', error);
          throw error;
        })
      );
    }
  }

  deleteRecipe(id: string): Observable<any> {
    return this.http.delete(`${this.backendApiUrl}/recipes/${id}`).pipe(
      catchError(error => {
/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Deleta uma receita do backend com o ID especificado
   * @param id O ID da receita a ser deletada
   * @returns Um Observable que emite um objeto any com o resultado da operação
   *          Caso haja um erro, ele irá propagá-lo para que o componente possa lidar com ele
   */
/*******  e6c7d803-d17c-42df-983d-a4aa6fc8e77e  *******/        console.error('Erro ao deletar receita no backend:', error);
        throw error;
      })
    );
  }
}