// src/app/services/receita/receita.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // Para a URL do backend

// Importe as interfaces atualizadas
import { RecipeDetail, RecipeListItem, RecipeContent, IngredientDetail } from '../../interfaces/recipe.interfaces'; // Ajuste o caminho

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private readonly backendApiUrl = environment.backendApiUrl;
  private http = inject(HttpClient);

  constructor() { }

  // Busca detalhes de uma receita (backend fará a agregação)
  buscarReceitaPorIdComDetalhes(id: string): Observable<RecipeDetail | undefined> {
    return this.http.get<RecipeDetail>(`${this.backendApiUrl}/recipes/${id}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar receita por ID do backend:', error);
        // Retorna undefined para indicar que a receita não pôde ser carregada
        return of(undefined);
      })
    );
  }

  // Lista receitas (backend fará a filtragem/listagem)
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

  // Salva ou atualiza uma receita
  // O frontend enviará um objeto RecipeContent (sem o 'id' inicial se for criação)
  // E o backend fará a lógica de criar/atualizar e gerar ingredientFoodTypes
  saveRecipe(recipeData: RecipeContent & { id?: string }): Observable<{ message: string; recipeId?: string }> {
    if (recipeData.id) { // Atualizar
      const recipeId = recipeData.id;
      // Não envie o ID no corpo da requisição para PUT
      const dataToSend = { ...recipeData };
      delete dataToSend.id;
      return this.http.put<{ message: string }>(`${this.backendApiUrl}/recipes/${recipeId}`, dataToSend).pipe(
        catchError(error => {
          console.error('Erro ao atualizar receita no backend:', error);
          throw error; // Propagar o erro para o componente
        })
      );
    } else { // Criar
      return this.http.post<{ message: string; recipeId?: string }>(`${this.backendApiUrl}/recipes`, recipeData).pipe(
        catchError(error => {
          console.error('Erro ao criar receita no backend:', error);
          throw error; // Propagar o erro
        })
      );
    }
  }

  deleteRecipe(id: string): Observable<any> {
    return this.http.delete(`${this.backendApiUrl}/recipes/${id}`).pipe(
      catchError(error => {
        console.error('Erro ao deletar receita no backend:', error);
        throw error;
      })
    );
  }
}