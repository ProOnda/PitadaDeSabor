import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';

// Interface para o modelo de ingrediente no formulário
interface IngredientForm {
  ingredient_name: string;
  quantity: number | null;
  unit: string; // Corrigido para 'unit' conforme o HTML
  foodType: string; // Adicionado foodType
}

interface StepForm {
  description: string;
}

@Component({
  selector: 'app-recipe-creation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
  ],
  templateUrl: './recipe-creation.page.html',
  styleUrls: ['./recipe-creation.page.scss']
})
export class RecipeCreationPage implements OnInit {

  // Propriedades para os campos principais do formulário
  recipeTitle: string = '';
  recipeDescription: string = '';
  recipeTime: string = '';
  recipeDifficulty: string = '';
  recipeCategory: string = '';

  ingredients: IngredientForm[] = []; // Usando a interface IngredientForm
  preparationSteps: StepForm[] = [];

  imagemPreviewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private location: Location,
  ) { }

  ngOnInit(): void {
    // Garante que sempre haja pelo menos uma linha de ingrediente ao iniciar
    if (this.ingredients.length === 0) {
      this.ingredients.push({ ingredient_name: '', quantity: null, unit: '', foodType: '' }); // Inicializa foodType
    }
    // Garante que sempre haja pelo menos um passo de preparo ao iniciar
    if (this.preparationSteps.length === 0) {
      this.addPreparationStep();
    }
  }

  onBackClick(): void {
    this.location.back();
  }

  /**
   * Adiciona uma nova linha de ingrediente APENAS se a última linha estiver preenchida.
   */
  addIngredient(): void {
    const lastIngredient = this.ingredients[this.ingredients.length - 1];
    // Valida se o nome do ingrediente, quantidade, unidade E foodType estão preenchidos na última linha
    if (this.ingredients.length > 0 && 
        (!lastIngredient.ingredient_name || lastIngredient.ingredient_name.trim() === '' || 
         lastIngredient.quantity === null || 
         lastIngredient.quantity === 0 || 
         !lastIngredient.unit || lastIngredient.unit.trim() === '' || // Verifica se a unidade está preenchida
         !lastIngredient.foodType || lastIngredient.foodType.trim() === '')) { // Verifica se foodType está preenchido
      alert('Por favor, preencha o nome, a quantidade, a unidade e o tipo de alimento do ingrediente atual antes de adicionar um novo.');
      return; 
    }
    this.ingredients.push({ ingredient_name: '', quantity: null, unit: '', foodType: '' }); // Inicializa foodType
  }

  /**
   * Remove uma linha de ingrediente. Garante que sempre haja pelo menos uma linha.
   */
  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.splice(index, 1);
    } else {
      // Se for o último ingrediente, limpa os campos em vez de remover a linha
      this.ingredients[0] = { ingredient_name: '', quantity: null, unit: '', foodType: '' }; // Limpa foodType também
    }
  }

  addPreparationStep(): void {
    const lastStep = this.preparationSteps[this.preparationSteps.length - 1];
    if (this.preparationSteps.length > 0 && (!lastStep.description || lastStep.description.trim() === '')) {
      alert('Por favor, preencha a descrição do passo atual antes de adicionar um novo.');
      return;
    }
    this.preparationSteps.push({ description: '' });
  }

  removePreparationStep(index: number): void {
    if (this.preparationSteps.length > 1) {
      this.preparationSteps.splice(index, 1);
    } else {
      this.preparationSteps[0] = { description: '' };
    }
  }

  getStepPlaceholder(index: number): string {
    const numbers = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono', 'décimo'];
    const ordinal = numbers[index] || (index + 1).toString(); 
    return `Descreva o ${ordinal} passo da receita...`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagemPreviewUrl = reader.result;
      };

      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imagemPreviewUrl = null;
    }
  }

  saveRecipe(): void {
    // Validação final antes de salvar
    if (!this.recipeTitle.trim()) {
      alert('Por favor, preencha o título da receita.');
      return;
    }

    // Validação para cada ingrediente
    for (const ingredient of this.ingredients) {
      if (!ingredient.ingredient_name.trim() || ingredient.quantity === null || ingredient.quantity === 0 || !ingredient.unit.trim() || !ingredient.foodType.trim()) {
        alert('Por favor, preencha todos os campos (Nome, Qtd, Unid., Tipo de Alimento) para todos os ingredientes.');
        return;
      }
    }

    // Filtra passos vazios antes de enviar (se houver algum)
    const filteredPreparationSteps = this.preparationSteps
        .map(step => step.description.trim())
        .filter(step => step.length > 0);

    // Se todos os passos forem vazios e for o único passo, pode não haver passos.
    // Você pode decidir se um array vazio é aceitável ou se exige pelo menos um passo.
    if (filteredPreparationSteps.length === 0) {
        alert('Por favor, adicione pelo menos um passo de preparo.');
        return;
    }

    console.log('Dados da Receita para Salvar:', {
      recipeName: this.recipeTitle,
      description: this.recipeDescription,
      timeId: this.recipeTime,
      difficultyId: this.recipeDifficulty,
      categoryId: this.recipeCategory,
      
      // Envia os ingredientes com o novo campo foodType
      ingredients: this.ingredients.map(ing => ({
        ingredient_name: ing.ingredient_name.trim(),
        quantity: ing.quantity,
        unit: ing.unit,
        foodType: ing.foodType // Inclui o foodType
      })),
      preparationSteps: filteredPreparationSteps,
      photoUrl: this.selectedFile ? this.selectedFile.name : null
    });

    if (this.selectedFile) {
      console.log('Arquivo de imagem para upload:', this.selectedFile);
      // Aqui você integraria com o seu serviço de upload de imagens (Firebase Storage, etc.)
    }

    // Ações de salvar a receita via serviço (ex: receitaService.createRecipe)
    alert('Receita Salva! (Verifique o console para os dados)');
    // this.router.navigate(['/feed']); // Navega para o feed após salvar
  }

  cancelRecipe(): void {
    console.log('Criação de receita cancelada.');
    alert('Criação de receita cancelada.');
    this.onBackClick();
  }
}