// src/app/services/receita/receita.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  DocumentSnapshot,
} from '@angular/fire/firestore';

import { RecipeDetail, RecipeListItem, IngredientDetail, RecipeCreationPayload } from '../../interfaces/recipe.interfaces';
import { UserData } from '../../interfaces/user.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private firestore: Firestore = inject(Firestore);
  private http: HttpClient = inject(HttpClient);

  private cloudinaryCloudName = 'do64wlw72';
  private cloudinaryUploadPreset = 'PitadaDeSabor';
  private cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`;

  private recipesCollection = collection(this.firestore, 'recipes');
  private categoriesCollection = collection(this.firestore, 'categories');
  private difficultiesCollection = collection(this.firestore, 'difficulties');
  private timesCollection = collection(this.firestore, 'times');
  private usersCollection = collection(this.firestore, 'users');
  private unitsCollection = collection(this.firestore, 'units');
  private foodTypesCollection = collection(this.firestore, 'foodTypes');

  private foodTypeIdToLabelMap = new Map<string, string>();

  constructor() {
    this.loadFoodTypesMap();
  }

  private async loadFoodTypesMap() {
    try {
      const snapshot = await getDocs(this.foodTypesCollection);
      snapshot.forEach(doc => {
        this.foodTypeIdToLabelMap.set(doc.id, (doc.data() as any)['label']); // Casting para any aqui
      });
      console.log('[ReceitaService] Mapeamento de foodTypes carregado:', this.foodTypeIdToLabelMap);
    } catch (error) {
      console.error('Erro ao carregar mapeamento de foodTypes:', error);
    }
  }

  uploadRecipeImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.cloudinaryUploadPreset);

    return this.http.post<any>(this.cloudinaryUploadUrl, formData).pipe(
      map((response: any) => response.secure_url),
      catchError(error => {
        console.error('Erro no upload de imagem para o Cloudinary:', error);
        throw error;
      })
    );
  }

  getAllCategories(): Observable<{ id: string, label: string }[]> {
    return from(getDocs(this.categoriesCollection)).pipe(
      map(snapshot => {
        const categories: { id: string, label: string }[] = [];
        snapshot.forEach(doc => {
          categories.push({ id: doc.id, label: (doc.data() as any)['label'] }); // Casting para any aqui
        });
        return categories;
      }),
      catchError(error => {
        console.error('Erro ao buscar todas as categorias:', error);
        return of([]);
      })
    );
  }

  getRecipesByCreator(creatorId: string): Observable<RecipeListItem[]> {
    const userRef = doc(this.firestore, 'users', creatorId);
    const q = query(this.recipesCollection, where('user_id', '==', userRef));

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
            userPromises.push(
              getDoc(doc(this.firestore, 'users', data.user_id)).then(userDoc => {
                if (userDoc.exists()) {
                  const userData = userDoc.data() as UserData;
                  return userData.user_name || userData.displayName || userData.email || 'Desconhecido';
                }
                return 'Desconhecido';
              }).catch(userError => {
                console.error(`Erro ao buscar nome de usuário para ID ${data.user_id}:`, userError);
                return 'Desconhecido';
              })
            );
          }

          recipes.push({
            id: recipeDoc.id,
            recipeName: data.recipe_name || 'Sem Nome',
            photoUrl: data.photo_url || data.photo || 'assets/placeholder.png',
            description: data.description || '',

            categoryId: data.category_id ? data.category_id.id : null,
            difficultyId: data.difficulty_id ? data.difficulty_id.id : null,
            timeId: data.time_id ? data.time_id.id : null,
            userId: data.user_id ? (data.user_id instanceof DocumentReference ? data.user_id.id : data.user_id) : null,

            categoryLabel: data.category_label || 'Não definida',
            difficultyLabel: data.difficulty_label || 'Não definida',
            timeLabel: data.time_label || 'Não definido',
            userName: '',
            ingredientFoodTypes: Array.isArray(data.ingredient_food_type) ? data.ingredient_food_type : [],
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
            readTime: this.calculateReadTimeFromTimeId(data.time_id),
          });
        }

        const resolvedUserNames = await Promise.all(userPromises);
        resolvedUserNames.forEach((name, index) => {
          recipes[index].userName = name;
        });

        console.log(`[getRecipesByCreator] Retornando ${recipes.length} receitas para o criador ${creatorId}.`);
        return recipes;
      }),
      catchError(error => {
        console.error('Erro ao buscar receitas por criador:', error);
        return of([]);
      })
    );
  }

  private calculateReadTimeFromTimeId(timeId: string | undefined): number {
    if (!timeId) return 5;

    switch (timeId) {
      case '1': return 10;
      case '2': return 25;
      case '3': return 45;
      case '4': return 75;
      default: return 5;
    }
  }

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
          ingredientsFormatted = await Promise.all(firestoreData.ingredients.map(async (ing: any) => {
            let unitLabel = 'N/A';
            if (ing.unit_id) {
              const unitDoc = await getDoc(ing.unit_id);
              if (unitDoc.exists()) {
                unitLabel = (unitDoc.data() as any)?.['label'] || 'N/A'; // Casting para any aqui
              }
            }

            let foodTypeLabel = 'N/A';
            if (ing.food_type_id) {
              const foodTypeDoc = await getDoc(ing.food_type_id);
              if (foodTypeDoc.exists()) {
                foodTypeLabel = (foodTypeDoc.data() as any)?.['label'] || 'N/A'; // Casting para any aqui
              }
            }

            return {
              fdcId: ing.fdc_id || null,
              name: ing.ingredient_name,
              quantity: ing.quantity,
              unitId: ing.unit_id ? ing.unit_id.id : null,
              unitLabel: unitLabel,
              foodTypeId: ing.food_type_id ? ing.food_type_id.id : null,
              foodTypeLabel: foodTypeLabel
            };
          }));
        }

        let userName = 'Desconhecido';
        if (firestoreData.user_id) {
            try {
              const userRef = firestoreData.user_id instanceof DocumentReference
                  ? firestoreData.user_id
                  : doc(this.firestore, 'users', firestoreData.user_id);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                  const userData = userDoc.data() as UserData;
                  userName = userData.user_name || userData.displayName || userData.email || 'Desconhecido';
                  console.log(`[getRecipeById] Nome de usuário obtido para receita ${id}:`, userName);
              }
            } catch (userError) {
                console.error(`Erro ao buscar nome de usuário para ID ${firestoreData.user_id}:`, userError);
            }
        }


        const aggregatedRecipe: RecipeDetail = {
          id: recipeDoc.id,
          recipe: {
            recipeName: firestoreData.recipe_name || 'Sem Nome',
            description: firestoreData.description || '',
            photoUrl: firestoreData.photo_url || firestoreData.photo || 'assets/placeholder.png',
            preparationSteps: Array.isArray(firestoreData.preparation_mode) ? firestoreData.preparation_mode : [],
            ingredients: ingredientsFormatted,

            categoryId: firestoreData.category_id ? firestoreData.category_id.id : null,
            categoryLabel: firestoreData.category_label || 'Não definida',

            difficultyId: firestoreData.difficulty_id ? firestoreData.difficulty_id.id : null,
            difficultyLabel: firestoreData.difficulty_label || 'Não definida',

            timeId: firestoreData.time_id ? firestoreData.time_id.id : null,
            timeLabel: firestoreData.time_label || 'Não definido',

            userId: firestoreData.user_id ? (firestoreData.user_id instanceof DocumentReference ? firestoreData.user_id.id : firestoreData.user_id) : null,
            userName: userName,

            createdAt: firestoreData.createdAt instanceof Timestamp ? firestoreData.createdAt.toDate().toISOString() : null,
            updatedAt: firestoreData.updatedAt instanceof Timestamp ? firestoreData.updatedAt.toDate().toISOString() : null,
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
    foodTypes?: string[],
    recipeName?: string
  }): Observable<RecipeListItem[]> {
    let q = query(this.recipesCollection);

    if (filters?.foodTypes && filters.foodTypes.length > 0) {
      const selectedFoodTypeLabels: string[] = [];
      filters.foodTypes.forEach(id => {
        const label = this.foodTypeIdToLabelMap.get(id);
        if (label) {
          selectedFoodTypeLabels.push(label);
        }
      });

      console.log("[ReceitaService] Filtrando por rótulos de foodTypes:", selectedFoodTypeLabels);

      if (selectedFoodTypeLabels.length > 0) {
        if (selectedFoodTypeLabels.length <= 10) {
          q = query(q, where('ingredient_food_type', 'array-contains-any', selectedFoodTypeLabels));
        } else {
          console.warn('Limite de 10 valores para array-contains-any excedido. Filtrando apenas os primeiros 10.');
          q = query(q, where('ingredient_food_type', 'array-contains-any', selectedFoodTypeLabels.slice(0, 10)));
        }
      }
    }

    if (filters?.categories && filters.categories.length > 0) {
        if (filters.categories.length === 1) {
            q = query(q, where('category_id', '==', doc(this.firestore, 'categories', filters.categories[0])));
        } else {
            const categoryRefs = filters.categories.map(id => doc(this.firestore, 'categories', id));
            if (categoryRefs.length <= 10) {
                q = query(q, where('category_id', 'in', categoryRefs));
            } else {
                console.warn('Limite de 10 valores para filtro "in" excedido. Filtrando apenas os primeiros 10.');
                q = query(q, where('category_id', 'in', categoryRefs.slice(0, 10)));
            }
        }
    }

    if (filters?.time && filters.time.length > 0) {
      q = query(q, where('time_id', '==', doc(this.firestore, 'times', filters.time[0])));
    }
    if (filters?.difficulty && filters.difficulty.length > 0) {
      q = query(q, where('difficulty_id', '==', doc(this.firestore, 'difficulties', filters.difficulty[0])));
    }

    if (filters?.recipeName) {
      const searchTermLower = filters.recipeName.toLowerCase();
      q = query(q, orderBy('recipe_name_lower'), startAt(searchTermLower), endAt(searchTermLower + '\uf8ff'));
    }

    return from(getDocs(q)).pipe(
      switchMap(async (recipesSnapshot) => {
        const recipes: RecipeListItem[] = [];
        const userPromises: Promise<any>[] = [];

        for (const recipeDoc of recipesSnapshot.docs) {
          const data = recipeDoc.data() as any;

          let userName = 'Desconhecido';
          if (data.user_id) {
            try {
              const userRef = data.user_id instanceof DocumentReference
                ? data.user_id
                : doc(this.firestore, 'users', data.user_id);
              userPromises.push(
                getDoc(userRef).then(userDocData => {
                  if (userDocData.exists()) {
                    const userDataResult = userDocData.data() as UserData;
                    return userDataResult.user_name || userDataResult.displayName || userDataResult.email || 'Desconhecido';
                  }
                  return 'Desconhecido';
                }).catch(userError => {
                  console.error(`Erro ao buscar nome de usuário para ID ${data.user_id}:`, userError);
                  return 'Desconhecido';
                })
              );
            } catch (error) {
              console.error(`Erro inesperado ao processar user_id ${data.user_id}:`, error);
              userPromises.push(Promise.resolve('Desconhecido'));
            }
          } else {
            userPromises.push(Promise.resolve('Desconhecido'));
          }

          recipes.push({
            id: recipeDoc.id,
            recipeName: data.recipe_name || 'Sem Nome',
            photoUrl: data.photo_url || data.photo || 'assets/placeholder.png',
            description: data.description || '',

            categoryId: data.category_id ? data.category_id.id : null,
            difficultyId: data.difficulty_id ? data.difficulty_id.id : null,
            timeId: data.time_id ? data.time_id.id : null,
            userId: data.user_id ? (data.user_id instanceof DocumentReference ? data.user_id.id : data.user_id) : null,

            categoryLabel: data.category_label || 'Não definida',
            difficultyLabel: data.difficulty_label || 'Não definida',
            timeLabel: data.time_label || 'Não definido',
            userName: '',
            ingredientFoodTypes: Array.isArray(data.ingredient_food_type) ? data.ingredient_food_type : [],
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
            readTime: this.calculateReadTimeFromTimeId(data.time_id),
          });
        }

        const resolvedUserNames = await Promise.all(userPromises);
        resolvedUserNames.forEach((name, index) => {
          recipes[index].userName = name;
        });
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
        const dataToSave = {
          ...resolvedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          recipe_name_lower: resolvedData.recipe_name.toLowerCase()
        };
        const docRef = await addDoc(this.recipesCollection, dataToSave);
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
        const dataToUpdate = {
          ...resolvedData,
          updatedAt: serverTimestamp(),
          recipe_name_lower: resolvedData.recipe_name.toLowerCase()
        };
        await updateDoc(recipeDocRef, dataToUpdate);
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
      allUnitsSnapshot,
      allFoodTypesSnapshot
    ] = await Promise.all([
      recipeData.categoryId ? getDoc(doc(this.firestore, 'categories', recipeData.categoryId)) : Promise.resolve(null),
      recipeData.difficultyId ? getDoc(doc(this.firestore, 'difficulties', recipeData.difficultyId)) : Promise.resolve(null),
      recipeData.timeId ? getDoc(doc(this.firestore, 'times', recipeData.timeId)) : Promise.resolve(null),
      getDocs(this.unitsCollection),
      getDocs(this.foodTypesCollection)
    ]);

    const unitsMap = new Map<string, string>();
    allUnitsSnapshot.forEach(d => unitsMap.set(d.id, (d.data() as any)['label'])); // Casting para any aqui
    const foodTypesMap = new Map<string, string>();
    allFoodTypesSnapshot.forEach(d => foodTypesMap.set(d.id, (d.data() as any)['label'])); // Casting para any aqui

    const ingredientsToSave = await Promise.all(recipeData.ingredients.map(async ing => {
      let unitLabel = 'N/A';
      if (ing.unitId) {
        const unitDoc = await getDoc(doc(this.firestore, 'units', ing.unitId));
        if (unitDoc.exists()) {
          unitLabel = (unitDoc.data() as any)?.['label'] || 'N/A'; // Casting para any aqui
        }
      }

      let foodTypeLabel = 'N/A';
      if (ing.foodTypeId) {
        const foodTypeDoc = await getDoc(doc(this.foodTypesCollection, ing.foodTypeId));
        if (foodTypeDoc.exists()) {
          foodTypeLabel = (foodTypeDoc.data() as any)?.['label'] || 'N/A'; // Casting para any aqui
        }
      }

      return {
        fdc_id: ing.fdcId || null,
        ingredient_name: ing.name,
        quantity: ing.quantity,
        unit_id: ing.unitId ? doc(this.firestore, 'units', ing.unitId) : null,
        unit_label: unitLabel,
        food_type_id: ing.foodTypeId ? doc(this.foodTypesCollection, ing.foodTypeId) : null,
        food_type_label: foodTypeLabel,
      };
    }));

    const uniqueFoodTypeLabels = [...new Set(ingredientsToSave.map(ing => ing.food_type_label).filter(Boolean))];

    return {
      recipe_name: recipeData.recipeName,
      description: recipeData.description,
      photo_url: recipeData.photoUrl,
      
      user_id: recipeData.userId ? doc(this.usersCollection, recipeData.userId) : null,
      category_id: recipeData.categoryId ? doc(this.categoriesCollection, recipeData.categoryId) : null,
      category_label: categoryDoc && categoryDoc.exists() ? (categoryDoc.data() as any)['label'] : 'Não definida', // Casting para any aqui

      difficulty_id: recipeData.difficultyId ? doc(this.difficultiesCollection, recipeData.difficultyId) : null,
      difficulty_label: difficultyDoc && difficultyDoc.exists() ? (difficultyDoc.data() as any)['label'] : 'Não definida', // Casting para any aqui

      time_id: recipeData.timeId ? doc(this.timesCollection, recipeData.timeId) : null,
      time_label: timeDoc && timeDoc.exists() ? (timeDoc.data() as any)['label'] : 'Não definido', // Casting para any aqui

      preparation_mode: recipeData.preparationSteps,
      ingredients: ingredientsToSave,
      ingredient_food_type: uniqueFoodTypeLabels,
    };
  }

  isRecipeFavorite(userId: string, recipeId: string): Observable<boolean> {
    if (!userId || !recipeId) {
      return of(false);
    }
    const userDocRef = doc(this.usersCollection, userId);
    return from(getDoc(userDocRef)).pipe(
      map(userDoc => {
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          return userData.favoriteRecipeIds?.includes(recipeId) || false;
        }
        return false;
      }),
      catchError(error => {
        console.error('Erro ao verificar status de favorito:', error);
        return of(false);
      })
    );
  }

  toggleFavoriteRecipe(userId: string, recipeId: string, isCurrentlyFavorite: boolean): Observable<void> {
    if (!userId || !recipeId) {
      console.error('UserId ou RecipeId inválidos para alternar favoritos.');
      return of(undefined);
    }

    const userDocRef = doc(this.usersCollection, userId);
    const updateData = isCurrentlyFavorite ?
      { favoriteRecipeIds: arrayRemove(recipeId) } :
      { favoriteRecipeIds: arrayUnion(recipeId) };

    return from(updateDoc(userDocRef, updateData)).pipe(
      map(() => {
        console.log(`Receita ${recipeId} ${isCurrentlyFavorite ? 'removida de' : 'adicionada a'} favoritos do usuário ${userId}.`);
      }),
      catchError(error => {
        console.error('Erro ao alternar favorito:', error);
        throw error;
      })
    );
  }

  getFavoriteRecipes(userId: string): Observable<RecipeListItem[]> {
    if (!userId) {
      console.log('UserId não fornecido para buscar favoritos.');
      return of([]);
    }
    const userDocRef = doc(this.usersCollection, userId);
    return from(getDoc(userDocRef)).pipe(
      switchMap(userDoc => {
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          const favoriteRecipeIds = userData.favoriteRecipeIds || [];

          if (favoriteRecipeIds.length === 0) {
            return of([]);
          }

          const validFavoriteRecipeIds = favoriteRecipeIds.filter(id => id && id.trim() !== '');

          if (validFavoriteRecipeIds.length === 0) {
            console.log('Nenhum ID de receita favorito válido após a filtragem.');
            return of([]);
          }

          const idsToQuery = validFavoriteRecipeIds.length > 10
            ? validFavoriteRecipeIds.slice(0, 10)
            : validFavoriteRecipeIds;


          const q = query(this.recipesCollection, where('__name__', 'in', idsToQuery));

          return from(getDocs(q)).pipe(
            switchMap(async snapshot => {
              const recipes: RecipeListItem[] = [];
              const userPromises: Promise<any>[] = [];

              for (const recipeDoc of snapshot.docs) {
                const data = recipeDoc.data() as any;

                let userName = 'Desconhecido';
                if (data.user_id) {
                    try {
                        const userRef = data.user_id instanceof DocumentReference
                            ? data.user_id
                            : doc(this.firestore, 'users', data.user_id);
                        userPromises.push(
                            getDoc(userRef).then(userDocData => {
                                if (userDocData.exists()) {
                                    const userDataResult = userDocData.data() as UserData;
                                    return userDataResult.user_name || userDataResult.displayName || userDataResult.email || 'Desconhecido';
                                }
                                return 'Desconhecido';
                            }).catch(userError => {
                                console.error(`Erro ao buscar nome de usuário para ID ${data.user_id}:`, userError);
                                return 'Desconhecido';
                            })
                        );
                    } catch (error) {
                        console.error(`Erro inesperado ao processar user_id ${data.user_id}:`, error);
                        userPromises.push(Promise.resolve('Desconhecido'));
                    }
                } else {
                  userPromises.push(Promise.resolve('Desconhecido'));
                }

                recipes.push({
                  id: recipeDoc.id,
                  recipeName: data.recipe_name || 'Sem Nome',
                  photoUrl: data.photo_url || data.photo || 'assets/placeholder.png',
                  description: data.description || '',

                  categoryId: data.category_id ? data.category_id.id : null,
                  difficultyId: data.difficulty_id ? data.difficulty_id.id : null,
                  timeId: data.time_id ? data.time_id.id : null,
                  userId: data.user_id ? (data.user_id instanceof DocumentReference ? data.user_id.id : data.user_id) : null,

                  categoryLabel: data.category_label || 'Não definida',
                  difficultyLabel: data.difficulty_label || 'Não definida',
                  timeLabel: data.time_label || 'Não definido',
                  userName: '',
                  ingredientFoodTypes: Array.isArray(data.ingredient_food_type) ? data.ingredient_food_type : [],
                  createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
                  readTime: this.calculateReadTimeFromTimeId(data.time_id),
                });
              }

              const resolvedUserNames = await Promise.all(userPromises);
              resolvedUserNames.forEach((name, index) => {
                recipes[index].userName = name;
              });
              return recipes;
            })
          );
        }
        return of([]);
      }),
      catchError(error => {
        console.error('Erro ao buscar receitas favoritas:', error);
        return of([]);
      })
    );
  }
}