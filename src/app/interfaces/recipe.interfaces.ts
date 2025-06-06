// src/app/interfaces/recipe.interfaces.ts

// ... (outras interfaces já existentes) ...

// **NOVAS INTERFACES PARA ENVIO DE DADOS AO BACKEND**

// Interface para um ingrediente no payload de criação/atualização
export interface IngredientPayload {
  name: string; // Corresponde a ingredient_name no backend
  quantity: number;
  unitId: string; // O ID da unidade (ex: 'g', 'ml', 'unid')
  foodTypeId: string; // O ID do tipo de alimento (ex: '1', '2', etc.)
  fdcId?: string; // Opcional, se você estiver usando FoodData Central IDs
}

// Interface para o payload completo da receita a ser enviada ao backend
export interface RecipeCreationPayload {
  recipeName: string;
  description: string;
  photoUrl: string | null; // Pode ser null se nenhuma foto for selecionada
  userId: string; // O ID do usuário que está criando a receita
  categoryId: string;
  difficultyId: string;
  timeId: string;
  preparationSteps: string[];
  ingredients: IngredientPayload[];
}

// Interfaces existentes, revisadas para maior clareza (se necessário)
export interface IngredientDetail {
  fdcId?: string; // Tornar opcional, pois nem sempre virá
  name: string; // Já está correto
  quantity: number;
  unitId: string | null;
  unitLabel: string;
  foodTypeId: string | null;
  foodTypeLabel: string; // O label associado, útil para exibição
}

export interface RecipeContent {
  photoUrl?: string;
  recipeName?: string;
  description?: string;
  preparationSteps?: string[];
  ingredients?: IngredientDetail[];

  categoryLabel?: string;
  difficultyLabel?: string;
  timeLabel?: string;
  userName?: string;

  categoryId?: string;
  difficultyId?: string;
  timeId?: string;
  userId?: string;

  createdAt?: string;
  updatedAt?: string;
  ingredientFoodTypes?: string[]; // Array de IDs de tipos de alimento para filtragem
}

export interface RecipeDetail {
  id: string;
  recipe: RecipeContent;
}

export interface RecipeListItem {
  id: string;
  recipeName: string;
  photoUrl?: string;
  description?: string;
  categoryId?: string;
  difficultyId?: string;
  timeId?: string;
  userId?: string;
  categoryLabel?: string;
  difficultyLabel?: string;
  timeLabel?: string;
  userName?: string;
  ingredientFoodTypes?: string[]; // Array de IDs de tipos de alimento para filtragem
}

// src/app/interfaces/common.interfaces.ts (ou onde você guarda suas interfaces)

export interface OptionItem {
  label: string;
  value: string; // Geralmente o ID
}

// src/app/interfaces/user.interfaces.ts
export interface UserData {
  user_name?: string;
  displayName?: string;
  email?: string;
  // Adicione outras propriedades do seu documento de usuário aqui, se houver
  // Ex: uid?: string;
  // Ex: photoURL?: string;
}