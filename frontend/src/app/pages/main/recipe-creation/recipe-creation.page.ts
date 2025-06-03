import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { ReceitaService } from '../../../services/receita/receita.service';
import { RecipeCreationPayload, IngredientPayload } from '../../../interfaces/recipe.interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

// Se você estiver usando Firebase Authentication, importe o User do Firebase
// import { User } from '@angular/fire/auth'; // OU import * as firebase from 'firebase/app';
// Se não tiver certeza, pode usar `any` temporariamente

// Interface para o modelo de ingrediente no formulário (agora com IDs)
interface IngredientForm {
  name: string;
  quantity: number | null;
  unitId: string;
  foodTypeId: string;
  fdcId?: string;
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

  recipeTitle: string = '';
  recipeDescription: string = '';
  recipeTimeId: string = '';
  recipeDifficultyId: string = '';
  recipeCategoryId: string = '';

  ingredients: IngredientForm[] = [];
  preparationSteps: StepForm[] = [];

  imagemPreviewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  currentUserUid: string | null = null;

  private location = inject(Location);
  private receitaService = inject(ReceitaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    if (this.ingredients.length === 0) {
      this.ingredients.push({ name: '', quantity: null, unitId: '', foodTypeId: '' });
    }
    if (this.preparationSteps.length === 0) {
      this.addPreparationStep();
    }

    // Corrigido: Usando authState e tipando 'user'
    this.authService.authState.subscribe((user: any | null) => { // Use 'any | null' ou User | null se importar o tipo User do Firebase
      if (user) {
        this.currentUserUid = user.uid;
        console.log('User UID obtido:', this.currentUserUid);
      } else {
        this.currentUserUid = null;
        console.warn('Usuário não logado na página de criação de receita. Redirecionando ou exibindo mensagem.');
        // this.router.navigate(['/login']);
      }
    });
  }

  onBackClick(): void {
    this.location.back();
  }

  addIngredient(): void {
    const lastIngredient = this.ingredients[this.ingredients.length - 1];
    if (this.ingredients.length > 0 &&
        (!lastIngredient.name || lastIngredient.name.trim() === '' ||
         lastIngredient.quantity === null ||
         lastIngredient.quantity <= 0 ||
         !lastIngredient.unitId || lastIngredient.unitId.trim() === '' ||
         !lastIngredient.foodTypeId || lastIngredient.foodTypeId.trim() === '')) {
      alert('Por favor, preencha o nome, a quantidade (maior que zero), a unidade e o tipo de alimento do ingrediente atual antes de adicionar um novo.');
      return;
    }
    this.ingredients.push({ name: '', quantity: null, unitId: '', foodTypeId: '' });
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.splice(index, 1);
    } else {
      this.ingredients[0] = { name: '', quantity: null, unitId: '', foodTypeId: '' };
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

  async saveRecipe(): Promise<void> {
    if (!this.recipeTitle.trim()) {
      alert('Por favor, preencha o título da receita.');
      return;
    }
    if (!this.recipeCategoryId) {
        alert('Por favor, selecione a categoria da receita.');
        return;
    }
    if (!this.recipeDifficultyId) {
        alert('Por favor, selecione a dificuldade da receita.');
        return;
    }
    if (!this.recipeTimeId) {
        alert('Por favor, selecione o tempo de preparo da receita.');
        return;
    }
    if (!this.currentUserUid) {
        alert('Erro: Usuário não logado. Por favor, faça login para criar uma receita.');
        return;
    }

    for (const ingredient of this.ingredients) {
      if (!ingredient.name.trim() || ingredient.quantity === null || ingredient.quantity <= 0 || !ingredient.unitId.trim() || !ingredient.foodTypeId.trim()) {
        alert('Por favor, preencha todos os campos (Nome, Qtd, Unid., Tipo de Alimento) para todos os ingredientes e certifique-se que a quantidade é maior que zero.');
        return;
      }
    }

    const filteredPreparationSteps = this.preparationSteps
        .map(step => step.description.trim())
        .filter(step => step.length > 0);

    if (filteredPreparationSteps.length === 0) {
        alert('Por favor, adicione pelo menos um passo de preparo.');
        return;
    }

    let photoUrlToSave: string | null = null;
    if (this.selectedFile) {
        // Implemente seu serviço de upload de imagem real aqui
        console.log('Simulando upload de imagem. Nome do arquivo:', this.selectedFile.name);
        photoUrlToSave = `https://exemplo.com/path/to/uploaded/images/${this.selectedFile.name}`;
    } else {
        photoUrlToSave = 'https://via.placeholder.com/150?text=No+Image';
    }

    const ingredientsPayload: IngredientPayload[] = this.ingredients.map(ing => ({
      name: ing.name.trim(),
      quantity: ing.quantity!,
      unitId: ing.unitId,
      foodTypeId: ing.foodTypeId,
    }));

    const recipeData: RecipeCreationPayload = {
      recipeName: this.recipeTitle.trim(),
      description: this.recipeDescription.trim(),
      photoUrl: photoUrlToSave,
      userId: this.currentUserUid!,
      categoryId: this.recipeCategoryId,
      difficultyId: this.recipeDifficultyId,
      timeId: this.recipeTimeId,
      preparationSteps: filteredPreparationSteps,
      ingredients: ingredientsPayload,
    };

    console.log('Dados da Receita para Salvar no Backend:', recipeData);

    try {
      const response = await this.receitaService.saveRecipe(recipeData).toPromise();
      console.log('Receita criada com sucesso!', response);
      alert('Receita criada com sucesso!');
      this.router.navigate(['/feed']);
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      alert('Erro ao criar receita. Verifique o console do navegador e o terminal do backend para mais detalhes.');
    }
  }

  cancelRecipe(): void {
    console.log('Criação de receita cancelada.');
    alert('Criação de receita cancelada.');
    this.onBackClick();
  }
}