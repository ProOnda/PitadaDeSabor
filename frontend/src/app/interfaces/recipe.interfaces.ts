// src/app/interfaces/recipe.interfaces.ts
// ... (outras interfaces) ...

export interface IngredientDetail {
  fdcId: string;
  name: string; // Já está correto
  quantity: number;
  unitId: string | null;
  unitLabel: string; // ANTES: unitName, AGORA: unitLabel (para corresponder ao backend)
  foodTypeId: string | null; // Adicionei para consistência com o backend
  foodTypeLabel: string; // Adicionei para consistência com o backend
}

export interface RecipeContent {
  photoUrl?: string;
  recipeName?: string;
  description?: string;
  preparationSteps?: string[];
  ingredients?: IngredientDetail[];

  // Nomes dos labels (agregados pelo backend)
  categoryLabel?: string;   // ANTES: categoryName, AGORA: categoryLabel
  difficultyLabel?: string; // ANTES: difficultyName, AGORA: difficultyLabel
  timeLabel?: string;       // ANTES: timeName, AGORA: timeLabel
  userName?: string;        // Este parece estar correto no backend (userName)

  // IDs originais
  categoryId?: string;
  difficultyId?: string;
  timeId?: string;
  userId?: string;

  // Metadados
  createdAt?: string;
  updatedAt?: string;
  ingredientFoodTypes?: string[];
}

export interface RecipeDetail {
  id: string;
  recipe: RecipeContent;
}

// ... (RecipeListItem, Category, Difficulty, Time, User - se precisar) ...

// **NOTA IMPORTANTE PARA RecipeListItem:**
// Se o listRecipes no backend também retorna categoryLabel, difficultyLabel, timeLabel,
// você precisará ajustar RecipeListItem para ter esses campos também:
export interface RecipeListItem {
    id: string;
    recipeName: string;
    photoUrl?: string;
    description?: string;
    categoryId?: string;
    difficultyId?: string;
    timeId?: string;
    userId?: string;
    categoryLabel?: string;   // Adicionar
    difficultyLabel?: string; // Adicionar
    timeLabel?: string;       // Adicionar
    userName?: string;        // Adicionar
}