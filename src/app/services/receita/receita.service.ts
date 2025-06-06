// src/app/services/receita/receita.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, from, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  DocumentReference,
  Timestamp,
  serverTimestamp
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

import { RecipeDetail, RecipeListItem, IngredientDetail, RecipeCreationPayload } from '../../interfaces/recipe.interfaces';
import { UserData } from '../../interfaces/recipe.interfaces'; // <<<<< CORRIGIDO: Assumindo user.interfaces.ts

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  private recipesCollection = collection(this.firestore, 'recipes');
  private categoriesCollection = collection(this.firestore, 'categories');
  private difficultiesCollection = collection(this.firestore, 'difficulties');
  private timesCollection = collection(this.firestore, 'times');
  private usersCollection = collection(this.firestore, 'users');
  private unitsCollection = collection(this.firestore, 'units');
  private foodTypesCollection = collection(this.firestore, 'foodTypes');

  constructor() { }

  buscarReceitaPorIdComDetalhes(id: string): Observable<RecipeDetail | undefined> {
    const recipeDocRef = doc(this.recipesCollection, id);
    return from(getDoc(recipeDocRef)).pipe(
      switchMap(async recipeDoc => {
        if (!recipeDoc.exists()) {
          console.log(`[getRecipeById] Receita com ID ${id} não encontrada.`);
          return undefined;
        }

        const firestoreData = recipeDoc.data() as any;

        let ingredientsFormatted: IngredientDetail[] = [];
        if (Array.isArray(firestoreData.ingredients) && firestoreData.ingredients.length > 0) {
          ingredientsFormatted = firestoreData.ingredients.map((ing: any) => ({
            fdcId: ing.fdc_id || null,
            name: ing.ingredient_name,
            quantity: ing.quantity,
            unitId: ing.unit_id ? ing.unit_id.id : null,
            unitLabel: ing.unit_label || 'N/A',
            foodTypeId: ing.food_type_id ? ing.food_type_id.id : null,
            foodTypeLabel: ing.food_type_label || 'N/A'
          }));
        }

        let userName = 'Desconhecido';
        if (firestoreData.user_id instanceof DocumentReference) {
          try {
            const userDoc = await getDoc(firestoreData.user_id);
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserData;
              userName = userData.user_name || userData.displayName || userData.email || 'Desconhecido';
              console.log(`[getRecipeById] Nome de usuário obtido para receita ${id}:`, userName);
            }
          } catch (userError) {
            console.error(`Erro ao buscar nome de usuário para ID ${firestoreData.user_id.id}:`, userError);
          }
        }

        const aggregatedRecipe: RecipeDetail = {
          id: recipeDoc.id,
          recipe: {
            recipeName: firestoreData.recipe_name || 'Sem Nome',
            description: firestoreData.description || '',
            photoUrl: firestoreData.photo || 'assets/placeholder.png',
            preparationSteps: Array.isArray(firestoreData.preparation_mode) ? firestoreData.preparation_mode : [],
            ingredients: ingredientsFormatted,

            categoryId: firestoreData.category_id ? firestoreData.category_id.id : null,
            categoryLabel: firestoreData.category_label || 'Não definida',

            difficultyId: firestoreData.difficulty_id ? firestoreData.difficulty_id.id : null,
            difficultyLabel: firestoreData.difficulty_label || 'Não definida',

            timeId: firestoreData.time_id ? firestoreData.time_id.id : null,
            timeLabel: firestoreData.time_label || 'Não definido',

            userId: firestoreData.user_id ? firestoreData.user_id.id : null,
            userName: userName,

            createdAt: firestoreData.createdAt instanceof Timestamp ? firestoreData.createdAt.toDate().toISOString() : null,
            updatedAt: firestoreData.updatedAt instanceof Timestamp ? firestoreData.updatedAt.toDate().toISOString() : null,
            // Certifique-se de que ingredient_food_type é preenchido aqui se for usado na exibição
            ingredientFoodTypes: Array.isArray(firestoreData.ingredient_food_type) ? firestoreData.ingredient_food_type : []
          }
        };
        console.log(`[getRecipeById] Receita ${id} encontrada e formatada.`);
        return aggregatedRecipe;
      }),
      catchError(error => {
        console.error('Erro ao buscar receita por ID do Firestore:', error);
        return of(undefined);
      })
    );
  }

  getRecipes(filters?: {
    categories?: string[],
    time?: string[],
    difficulty?: string[],
    foodTypes?: string[], // Agora esperado como array de IDs
    recipeName?: string
  }): Observable<RecipeListItem[]> {
    let q = query(this.recipesCollection);

    // FILTRO DE TIPOS DE ALIMENTOS: Usando 'array-contains-any' com IDs
    if (filters?.foodTypes && filters.foodTypes.length > 0) {
      if (filters.foodTypes.length <= 10) { // Firebase suporta array-contains-any com até 10 elementos.
        q = query(q, where('ingredient_food_type', 'array-contains-any', filters.foodTypes));
      } else {
        console.warn('Limite de 10 valores para array-contains-any excedido. Filtrando apenas os primeiros 10.');
        q = query(q, where('ingredient_food_type', 'array-contains-any', filters.foodTypes.slice(0, 10)));
      }
    }

    if (filters?.categories && filters.categories.length > 0) {
      q = query(q, where('category_id', '==', doc(this.firestore, 'categories', filters.categories[0])));
    }
    if (filters?.time && filters.time.length > 0) {
      q = query(q, where('time_id', '==', doc(this.firestore, 'times', filters.time[0])));
    }
    if (filters?.difficulty && filters.difficulty.length > 0) {
      q = query(q, where('difficulty_id', '==', doc(this.firestore, 'difficulties', filters.difficulty[0])));
    }

    if (filters?.recipeName) {
      const searchTermLower = filters.recipeName.toLowerCase();
      // Necessário um índice no Firestore para recipe_name_lower
      q = query(q, orderBy('recipe_name_lower'), startAt(searchTermLower), endAt(searchTermLower + '\uf8ff'));
    }

    return from(getDocs(q)).pipe(
      switchMap(async (recipesSnapshot) => {
        const recipes: RecipeListItem[] = [];
        const userPromises: Promise<any>[] = [];

        for (const recipeDoc of recipesSnapshot.docs) {
          const data = recipeDoc.data() as any;

          let userName = 'Desconhecido';
          if (data.user_id instanceof DocumentReference) {
            userPromises.push(
              getDoc(data.user_id).then(userDoc => {
                if (userDoc.exists()) {
                  const userData = userDoc.data() as UserData;
                  return userData.user_name || userData.displayName || userData.email || 'Desconhecido';
                }
                return 'Desconhecido';
              }).catch(userError => {
                console.error(`Erro ao buscar nome de usuário para ID ${data.user_id.id}:`, userError);
                return 'Desconhecido';
              })
            );
          } else {
            userPromises.push(Promise.resolve('Desconhecido'));
          }

          recipes.push({
            id: recipeDoc.id,
            recipeName: data.recipe_name || 'Sem Nome',
            photoUrl: data.photo || 'assets/placeholder.png',
            description: data.description || '',

            categoryId: data.category_id ? data.category_id.id : null,
            difficultyId: data.difficulty_id ? data.difficulty_id.id : null,
            timeId: data.time_id ? data.time_id.id : null,
            userId: data.user_id ? data.user_id.id : null,

            categoryLabel: data.category_label || 'Não definida',
            difficultyLabel: data.difficulty_label || 'Não definida',
            timeLabel: data.time_label || 'Não definido',
            userName: '', // Será preenchido após Promise.all
            ingredientFoodTypes: Array.isArray(data.ingredient_food_type) ? data.ingredient_food_type : [] // Assumindo IDs
          });
        }

        const resolvedUserNames = await Promise.all(userPromises);
        resolvedUserNames.forEach((name, index) => {
          recipes[index].userName = name;
        });

        console.log(`[listRecipes] Retornando ${recipes.length} receitas.`);
        return recipes;
      }),
      catchError(error => {
        console.error('Erro ao listar receitas do Firestore:', error);
        return of([]);
      })
    );
  }

  saveRecipe(recipeData: RecipeCreationPayload): Observable<{ message: string; recipeId?: string }> {
    return from(this.resolveRecipeReferences(recipeData)).pipe(
      switchMap(async resolvedData => {
        const docRef = await addDoc(this.recipesCollection, {
          ...resolvedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          recipe_name_lower: resolvedData.recipe_name.toLowerCase() // Necessário um índice para recipe_name_lower
        });
        console.log(`[createRecipe] Receita criada com sucesso. ID: ${docRef.id}`);
        return { message: 'Receita criada com sucesso!', recipeId: docRef.id };
      }),
      catchError(error => {
        console.error('Erro ao criar receita no Firestore:', error);
        throw error;
      })
    );
  }

  updateRecipe(recipeId: string, recipeData: RecipeCreationPayload): Observable<{ message: string }> {
    const recipeDocRef = doc(this.recipesCollection, recipeId);
    return from(this.resolveRecipeReferences(recipeData)).pipe(
      switchMap(async resolvedData => {
        await updateDoc(recipeDocRef, {
          ...resolvedData,
          updatedAt: serverTimestamp(),
          recipe_name_lower: resolvedData.recipe_name.toLowerCase() // Necessário um índice para recipe_name_lower
        });
        console.log(`[updateRecipe] Receita ${recipeId} atualizada com sucesso.`);
        return { message: 'Receita atualizada com sucesso!' };
      }),
      catchError(error => {
        console.error('Erro ao atualizar receita no Firestore:', error);
        throw error;
      })
    );
  }

  deleteRecipe(id: string): Observable<any> {
    const recipeDocRef = doc(this.recipesCollection, id);
    return from(deleteDoc(recipeDocRef)).pipe(
      map(() => {
        console.log(`[deleteRecipe] Receita ${id} deletada com sucesso.`);
        return { message: 'Receita deletada com sucesso!' };
      }),
      catchError(error => {
        console.error('Erro ao deletar receita no Firestore:', error);
        throw error;
      })
    );
  }

  private async resolveRecipeReferences(recipeData: RecipeCreationPayload) {
    const [
      categoryDoc,
      difficultyDoc,
      timeDoc,
      userDoc,
      allUnitsSnapshot,
      allFoodTypesSnapshot
    ] = await Promise.all([
      recipeData.categoryId ? getDoc(doc(this.firestore, 'categories', recipeData.categoryId)) : Promise.resolve(null),
      recipeData.difficultyId ? getDoc(doc(this.firestore, 'difficulties', recipeData.difficultyId)) : Promise.resolve(null),
      recipeData.timeId ? getDoc(doc(this.firestore, 'times', recipeData.timeId)) : Promise.resolve(null),
      recipeData.userId ? getDoc(doc(this.firestore, 'users', recipeData.userId)) : Promise.resolve(null),
      getDocs(this.unitsCollection),
      getDocs(this.foodTypesCollection)
    ]);

    const unitsMap = new Map<string, string>();
    allUnitsSnapshot.forEach(d => unitsMap.set(d.id, d.data()['label']));
    const foodTypesMap = new Map<string, string>();
    allFoodTypesSnapshot.forEach(d => foodTypesMap.set(d.id, d.data()['label']));

    const ingredientsToSave = recipeData.ingredients.map(ing => ({
      fdc_id: ing.fdcId || null,
      ingredient_name: ing.name,
      quantity: ing.quantity,
      unit_id: ing.unitId ? doc(this.unitsCollection, ing.unitId) : null,
      unit_label: ing.unitId ? (unitsMap.get(ing.unitId) || 'N/A') : 'N/A',
      food_type_id: ing.foodTypeId ? doc(this.foodTypesCollection, ing.foodTypeId) : null,
      food_type_label: ing.foodTypeId ? (foodTypesMap.get(ing.foodTypeId) || 'N/A') : 'N/A'
    }));

    // ESTA É A MUDANÇA CRUCIAL: Mapeia os IDs dos tipos de alimento
    const uniqueFoodTypeIds = [...new Set(recipeData.ingredients.map(ing => ing.foodTypeId).filter(Boolean))] as string[];

    return {
      recipe_name: recipeData.recipeName,
      description: recipeData.description,
      photo: recipeData.photoUrl,

      user_id: recipeData.userId ? doc(this.usersCollection, recipeData.userId) : null,
      category_id: recipeData.categoryId ? doc(this.categoriesCollection, recipeData.categoryId) : null,
      category_label: categoryDoc && categoryDoc.exists() ? categoryDoc.data()['label'] : 'Não definida',

      difficulty_id: recipeData.difficultyId ? doc(this.difficultiesCollection, recipeData.difficultyId) : null,
      difficulty_label: difficultyDoc && difficultyDoc.exists() ? difficultyDoc.data()['label'] : 'Não definida',

      time_id: recipeData.timeId ? doc(this.timesCollection, recipeData.timeId) : null,
      time_label: timeDoc && timeDoc.exists() ? timeDoc.data()['label'] : 'Não definido',

      preparation_mode: recipeData.preparationSteps,
      ingredients: ingredientsToSave,
      ingredient_food_type: uniqueFoodTypeIds, // <<<<< AGORA SALVA OS IDs AQUI PARA FILTRAGEM EFICIENTE
    };
  }
}