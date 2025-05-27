// src/app/interfaces/recipe.interfaces.ts

// Interface para um único ingrediente dentro do array 'ingredients'
// (Corresponde aos campos do Firestore, mas em camelCase para o frontend)
export interface IngredientDetail {
  fdcId: string;        // fdc_id no Firestore
  name: string;         // ingredient_name no Firestore
  // foodType?: string;     // food_type no Firestore. Comentei/removi conforme você já não exibe e o backend não retorna.
  quantity: number;     // quantity no Firestore
  unitId: string | null; // unit_id no Firestore. Adicionei '| null' para refletir o backend.
  unitName: string;     // <<< ADICIONADO: O nome da unidade (ex: "gramas") populado pelo backend <<<
}

// Interface para o objeto 'recipe' aninhado dentro de RecipeDetail
// (Corresponde aos campos do Firestore, mas em camelCase para o frontend)
export interface RecipeContent {
  photoUrl?: string;          // 'photo' no Firestore, convertido para 'photoUrl' no backend
  recipeName?: string;        // 'recipe_name' no Firestore
  description?: string;       // 'description' no Firestore
  preparationSteps?: string[];// 'preparation_steps' no Firestore
  ingredients?: IngredientDetail[]; // 'ingredients' no Firestore (array de IngredientDetail)

  // Nomes dos labels (agregados pelo backend)
  categoryName?: string;
  difficultyName?: string;
  timeName?: string;
  userName?: string;

  // IDs originais (podem ser úteis para formulários de edição)
  categoryId?: string;       // 'category_id' no Firestore
  difficultyId?: string;     // 'difficulty_id' no Firestore
  timeId?: string;           // 'time_id' no Firestore
  userId?: string;           // 'user_id' no Firestore

  // Metadados
  createdAt?: string;        // 'created_at' no Firestore (Firestore Timestamp -> ISO string)
  updatedAt?: string;        // 'updated_at' no Firestore (Firestore Timestamp -> ISO string)
  ingredientFoodTypes?: string[]; // 'ingredient_food_type' no Firestore
}

// Interface principal que o frontend receberá para uma única receita
// (Retorno do backend para GET /api/recipes/:id)
export interface RecipeDetail { // Adicionei esta interface que estava faltando, presumindo que o backend retorna { id, recipe: RecipeContent }
  id: string;
  recipe: RecipeContent;
}

// Interface para itens da lista de receitas
// (Retorno do backend para GET /api/recipes)
// O backend deve retornar apenas esses campos para a lista para otimização
export interface RecipeListItem {
  id: string;
  recipeName: string; // 'recipe_name' no Firestore
  photoUrl?: string;  // 'photo' no Firestore, convertido para 'photoUrl' no backend
  description?: string; // 'description' no Firestore
  // Opcional: Incluir IDs de referência se o componente de lista precisar deles,
  // mas evite os 'name' para manter a lista leve.
  categoryId?: string;
  difficultyId?: string;
  timeId?: string;
  userId?: string;
  // Adicionei os nomes populados que o backend está enviando para a lista
  categoryName?: string;
  difficultyName?: string;
  timeName?: string;
  userName?: string;
}

// Interfaces para os dados de referência (usadas para dropdowns/seleções, por exemplo)
// Supondo que o backend tenha endpoints para buscá-las
export interface Category {
  id: string;
  label: string;
}

export interface Difficulty {
  id: string;
  label: string;
}

export interface Time {
  id: string;
  label: string;
}

export interface User {
  id: string;
  user_name: string; // Ou 'userName' se o backend converter
  // ... outros campos do usuário
}