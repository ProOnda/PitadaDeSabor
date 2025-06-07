import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { ReceitaService } from '../../../services/receita/receita.service';
import { RecipeCreationPayload, IngredientPayload, RecipeDetail } from '../../../interfaces/recipe.interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// <<<<< IMPORTAÇÃO DO SERVIÇO DE COMPRESSÃO DE IMAGEM >>>>>
import { NgxImageCompressService } from 'ngx-image-compress';

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
  selectedFile: File | null = null; // Agora será um objeto File real para upload

  currentUserUid: string | null = null;

  editingRecipeId: string | null = null;
  isEditMode: boolean = false;
  pageTitle: string = 'Criar Uma Receita';
  saveButtonText: string = 'Criar Receita';

  private location = inject(Location);
  private receitaService = inject(ReceitaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  // <<<<< INJEÇÃO DO SERVIÇO DE COMPRESSÃO DE IMAGEM >>>>>
  private imageCompress = inject(NgxImageCompressService);

  constructor() { }

  async ngOnInit(): Promise<void> {
    if (this.ingredients.length === 0) {
      this.ingredients.push({ name: '', quantity: null, unitId: '', foodTypeId: '' });
    }
    if (this.preparationSteps.length === 0) {
      this.addPreparationStep();
    }

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

    this.editingRecipeId = this.route.snapshot.paramMap.get('id');
    if (this.editingRecipeId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Receita';
      this.saveButtonText = 'Atualizar Receita';
      console.log(`FRONTEND - ngOnInit: Modo de edição detectado para receita ID: ${this.editingRecipeId}`);

      try {
        const recipeData: RecipeDetail | undefined = await firstValueFrom(
          this.receitaService.buscarReceitaPorIdComDetalhes(this.editingRecipeId).pipe(
            catchError((error) => {
              console.error('FRONTEND - ngOnInit: Erro ao buscar receita para edição:', error);
              alert('Erro ao carregar os dados da receita para edição. Por favor, tente novamente.');
              this.router.navigate(['/feed']);
              return of(undefined);
            })
          )
        );

        if (recipeData && recipeData.recipe) {
          this.populateForm(recipeData.recipe);
          console.log('FRONTEND - ngOnInit: Formulário preenchido com dados da receita.');
        } else {
          console.warn('FRONTEND - ngOnInit: Receita não encontrada ou dados inválidos para edição.');
          alert('Receita não encontrada ou dados inválidos para edição.');
          this.router.navigate(['/feed']);
        }
      } catch (error) {
        console.error('FRONTEND - ngOnInit: Erro fatal ao buscar receita para edição:', error);
        alert('Ocorreu um erro inesperado ao carregar a receita para edição.');
        this.router.navigate(['/feed']);
      }
    } else {
      console.log('FRONTEND - ngOnInit: Modo de criação de nova receita.');
    }
  }

  private populateForm(recipe: RecipeDetail['recipe']): void {
    if (!recipe) return;

    this.recipeTitle = recipe.recipeName || '';
    this.recipeDescription = recipe.description || '';
    this.recipeTimeId = recipe.timeId || '';
    this.recipeDifficultyId = recipe.difficultyId || '';
    this.recipeCategoryId = recipe.categoryId || '';

    this.ingredients = [];
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      this.ingredients = recipe.ingredients.map(ing => ({
        name: ing.name || '',
        quantity: ing.quantity || null,
        unitId: ing.unitId || '',
        foodTypeId: ing.foodTypeId || '',
        fdcId: ing.fdcId || undefined
      }));
    } else {
      this.addIngredient();
    }

    this.preparationSteps = [];
    if (recipe.preparationSteps && recipe.preparationSteps.length > 0) {
      this.preparationSteps = recipe.preparationSteps.map(step => ({ description: step || '' }));
    } else {
      this.addPreparationStep();
    }

    if (recipe.photoUrl) {
      this.imagemPreviewUrl = recipe.photoUrl;
      // Se for uma URL externa, selectedFile permanece null (não temos o File original)
      this.selectedFile = null;
    }
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

  // <<<<< LÓGICA CORRETA DE SELEÇÃO E COMPRESSÃO DE IMAGEM >>>>>
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Verifica o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem (JPG, PNG, GIF, etc.).');
        this.selectedFile = null;
        this.imagemPreviewUrl = null;
        return;
      }

      console.log(`FRONTEND - onFileSelected: Tamanho original da imagem: ${file.size / 1024} KB`);

      try {
        // Converte File para base64 para compressão
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e: ProgressEvent<FileReader>) => {
          const base64Image = e.target?.result as string;

          // Comprime a imagem (qualidade de 70%, 70% de largura/altura, formato original)
          // `quality` e `ratio` podem ser ajustados conforme sua necessidade
          const compressedBase64 = await this.imageCompress.compressFile(
            base64Image,
            -1, // orientation: -1 for auto (default)
            70, // percentage for quality (70%)
            70 // percentage for width/height (70% do original)
          );
          console.log(`FRONTEND - onFileSelected: Tamanho da imagem comprimida: ${this.imageCompress.byteCount(compressedBase64) / 1024} KB`);

          // Converte a imagem comprimida de volta para File
          const compressedFile = this.base64ToFile(compressedBase64, file.name, file.type);
          
          this.selectedFile = compressedFile; // Armazena o arquivo COMPRIMIDO
          this.imagemPreviewUrl = compressedBase64; // Atualiza o preview com a imagem COMPRIMIDA
        };
        reader.onerror = (error) => {
          console.error('FRONTEND - onFileSelected: Erro ao ler o arquivo:', error);
          alert('Erro ao carregar a imagem.');
          this.selectedFile = null;
          this.imagemPreviewUrl = null;
        };

      } catch (error) {
        console.error('FRONTEND - onFileSelected: Erro durante a compressão da imagem:', error);
        alert('Erro ao processar a imagem. Tente uma imagem diferente.');
        this.selectedFile = null;
        this.imagemPreviewUrl = null;
      }
    } else {
      this.selectedFile = null;
      this.imagemPreviewUrl = null;
    }
  }

  // Método auxiliar para converter Base64 para File
  private base64ToFile(base64Data: string, filename: string, mimeType: string): File {
    const byteString = atob(base64Data.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  }


  async saveRecipe(): Promise<void> {
    console.log('FRONTEND - saveRecipe: Função saveRecipe iniciada.');

    if (!this.currentUserUid) {
      console.log('FRONTEND - saveRecipe: currentUserUid é null. Aguardando authState...');
      try {
        const user = await firstValueFrom(this.authService.authState);
        if (user) {
          this.currentUserUid = user.uid;
          console.log('FRONTEND - saveRecipe: currentUserUid OBTIDO APÓS AGUARDAR:', this.currentUserUid);
        } else {
          alert('Erro: Usuário não logado. Por favor, faça login para criar ou editar uma receita.');
          console.error('FRONTEND - saveRecipe: Usuário não logado após aguardar authState.');
          return;
        }
      } catch (error) {
        console.error('FRONTEND - saveRecipe: Erro ao obter authState:', error);
        alert('Erro ao verificar status de login. Por favor, tente novamente.');
        return;
      }
    }

    console.log('FRONTEND - saveRecipe: currentUserUid FINAL ANTES DE ENVIAR:', this.currentUserUid);

    if (!this.recipeTitle.trim()) { alert('Por favor, preencha o título da receita.'); return; }
    if (!this.recipeCategoryId) { alert('Por favor, selecione a categoria da receita.'); return; }
    if (!this.recipeDifficultyId) { alert('Por favor, selecione a dificuldade da receita.'); return; }
    if (!this.recipeTimeId) { alert('Por favor, selecione o tempo de preparo da receita.'); return; }
    if (!this.currentUserUid) { alert('Erro: Usuário não logado. Por favor, faça login para criar ou editar uma receita.'); console.error('FRONTEND - saveRecipe: currentUserUid é NULO (validação final). Não é possível criar receita.'); return; }

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

    // <<<<< LÓGICA CORRETA DE UPLOAD DE IMAGEM PARA O CLOUDINARY >>>>>
    if (this.selectedFile) {
        console.log('FRONTEND - saveRecipe: Imagem selecionada para upload. Enviando para o Cloudinary...');
        try {
            // Chama o método do service para fazer o upload para o Cloudinary
            photoUrlToSave = await firstValueFrom(this.receitaService.uploadRecipeImage(this.selectedFile));
            console.log('FRONTEND - saveRecipe: URL da imagem do Cloudinary obtida:', photoUrlToSave);
        } catch (uploadError) {
            console.error('FRONTEND - saveRecipe: Erro ao fazer upload da imagem para o Cloudinary:', uploadError);
            alert('Erro ao fazer upload da imagem. Por favor, tente novamente.');
            return;
        }
    } else {
        // Se não houver novo arquivo selecionado, mas estiver em modo de edição e já houver uma URL válida, mantenha-a.
        // A lógica do placeholder precisa ser robusta para não sobrescrever URL existente.
        if (this.isEditMode && typeof this.imagemPreviewUrl === 'string' && this.imagemPreviewUrl && !this.imagemPreviewUrl.startsWith('https://placehold.co') && !this.imagemPreviewUrl.startsWith('https://via.placeholder.com')) {
            photoUrlToSave = this.imagemPreviewUrl;
            console.log('FRONTEND - saveRecipe: Modo de edição, mantendo imagem existente:', photoUrlToSave);
        } else {
            photoUrlToSave = 'https://placehold.co/150x150?text=Sem+Foto'; // Placeholder padrão
            console.log('FRONTEND - saveRecipe: Nenhuma imagem selecionada. Usando placeholder:', photoUrlToSave);
        }
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
      photoUrl: photoUrlToSave, // Usa a URL da imagem (do Cloudinary ou placeholder)
      userId: this.currentUserUid!,
      categoryId: this.recipeCategoryId,
      difficultyId: this.recipeDifficultyId,
      timeId: this.recipeTimeId,
      preparationSteps: filteredPreparationSteps,
      ingredients: ingredientsPayload,
    };

    console.log('FRONTEND - saveRecipe: Payload final enviado para o serviço de receitas:', recipeData);
    console.log('FRONTEND - saveRecipe: userId NO PAYLOAD FINAL:', recipeData.userId);

    try {
      let response;
      if (this.isEditMode && this.editingRecipeId) {
        console.log(`FRONTEND - saveRecipe: Chamando updateRecipe para ID: ${this.editingRecipeId}`);
        response = await firstValueFrom(this.receitaService.updateRecipe(this.editingRecipeId, recipeData));
        alert('Receita atualizada com sucesso!');
      } else {
        console.log('FRONTEND - saveRecipe: Chamando saveRecipe para nova receita.');
        response = await firstValueFrom(this.receitaService.saveRecipe(recipeData)); // Usando firstValueFrom
        alert('Receita criada com sucesso!');
      }
      console.log('FRONTEND - saveRecipe: Operação de receita concluída!', response);
      this.router.navigate(['/feed']);
    } catch (error) {
      console.error('FRONTEND - saveRecipe: Erro ao salvar/atualizar receita:', error);
      alert('Erro ao salvar/atualizar receita. Verifique o console do navegador para mais detalhes.');
    }
  }

  cancelRecipe(): void {
    console.log('FRONTEND - Criação/Edição de receita cancelada.');
    alert('Criação/Edição de receita cancelada.');
    this.onBackClick();
  }
}