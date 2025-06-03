import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { ReceitaService } from '../../../services/receita/receita.service';
import { RecipeCreationPayload, IngredientPayload } from '../../../interfaces/recipe.interfaces';
import { AuthService } from 'src/app/services/auth/auth.service'; // Ajuste o caminho para o seu AuthService
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs'; // <<<<< IMPORTANTE: Importar firstValueFrom

// Interfaces
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

  // Propriedades de imagem (mantidas como estavam no seu código)
  imagemPreviewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  currentUserUid: string | null = null; // ID do usuário logado

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

    // Subscrever para obter o UID do usuário logado
    // Este `subscribe` ainda é bom para manter o `currentUserUid` atualizado em tempo real,
    // mas o `saveRecipe` não dependerá mais apenas dele estar pronto aqui.
    console.log('FRONTEND - ngOnInit: Iniciando subscrição ao authState...');
    this.authService.authState.subscribe((user: any | null) => {
      if (user) {
        this.currentUserUid = user.uid;
        console.log('FRONTEND - ngOnInit: User UID OBTIDO DO AUTHSERVICE (via subscribe):', this.currentUserUid);
      } else {
        this.currentUserUid = null;
        console.warn('FRONTEND - ngOnInit: Usuário NÃO LOGADO (currentUserUid é null via subscribe).');
      }
    });

    console.log('FRONTEND - ngOnInit: currentUserUid no final do ngOnInit (pode ser null inicialmente):', this.currentUserUid);
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

  // MÉTODO onFileSelected (MANTIDO COMO ESTAVA NO SEU CÓDIGO)
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
    console.log('FRONTEND - saveRecipe: Função saveRecipe iniciada.');

    // <<<<<<< NOVO: GARANTIR QUE currentUserUid ESTEJA DISPONÍVEL >>>>>>>
    // Se currentUserUid ainda não estiver definido (por causa da assincronicidade),
    // esperamos que o authService.authState emita seu primeiro valor.
    if (!this.currentUserUid) {
      console.log('FRONTEND - saveRecipe: currentUserUid é null. Aguardando authState...');
      try {
        const user = await firstValueFrom(this.authService.authState);
        if (user) {
          this.currentUserUid = user.uid;
          console.log('FRONTEND - saveRecipe: currentUserUid OBTIDO APÓS AGUARDAR:', this.currentUserUid);
        } else {
          alert('Erro: Usuário não logado. Por favor, faça login para criar uma receita.');
          console.error('FRONTEND - saveRecipe: Usuário não logado após aguardar authState.');
          return;
        }
      } catch (error) {
        console.error('FRONTEND - saveRecipe: Erro ao obter authState:', error);
        alert('Erro ao verificar status de login. Por favor, tente novamente.');
        return;
      }
    }

    console.log('FRONTEND - saveRecipe: currentUserUid FINAL ANTES DE ENVIAR:', this.currentUserUid); // LOG CRÍTICO

    // Validações iniciais
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
    
    // Esta validação agora é redundante se o bloco acima funcionar, mas mantida por segurança.
    if (!this.currentUserUid) {
        alert('Erro: Usuário não logado. Por favor, faça login para criar uma receita.');
        console.error('FRONTEND - saveRecipe: currentUserUid é NULO (validação final). Não é possível criar receita.');
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

    // LÓGICA DE IMAGEM (MANTIDA COMO ESTAVA NO SEU CÓDIGO)
    let photoUrlToSave: string | null = null;
    if (this.selectedFile) {
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
      userId: this.currentUserUid!, // <<< ESTE É O ID QUE SERÁ ENVIADO
      categoryId: this.recipeCategoryId,
      difficultyId: this.recipeDifficultyId,
      timeId: this.recipeTimeId,
      preparationSteps: filteredPreparationSteps,
      ingredients: ingredientsPayload,
    };

    console.log('FRONTEND - saveRecipe: Payload final enviado ao backend:', recipeData);
    console.log('FRONTEND - saveRecipe: userId NO PAYLOAD FINAL:', recipeData.userId);

    try {
      const response = await this.receitaService.saveRecipe(recipeData).toPromise();
      console.log('FRONTEND - saveRecipe: Receita criada com sucesso!', response);
      alert('Receita criada com sucesso!');
      this.router.navigate(['/feed']);
    } catch (error) {
      console.error('FRONTEND - saveRecipe: Erro ao criar receita:', error);
      alert('Erro ao criar receita. Verifique o console do navegador e o terminal do backend para mais detalhes.');
    }
  }

  cancelRecipe(): void {
    console.log('FRONTEND - Criação de receita cancelada.');
    alert('Criação de receita cancelada.');
    this.onBackClick();
  }
}