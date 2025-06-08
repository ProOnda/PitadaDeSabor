// src/app/pages/main/profile/profile.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonicModule // Mantenha IonicModule se estiver usando outros componentes Ionic
} from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Importante para ngModel

import { BehaviorSubject, Observable, Subscription, of, firstValueFrom } from 'rxjs'; // Adicionado firstValueFrom
import { switchMap, tap, catchError, filter } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth/auth.service';
import { ReceitaService } from 'src/app/services/receita/receita.service';
import { NgxImageCompressService } from 'ngx-image-compress'; // <<<<< IMPORT NECESSÁRIO >>>>>

import { RecipeListItem } from 'src/app/interfaces/recipe.interfaces';
import { UserData } from 'src/app/interfaces/user.interfaces';

import { PageHeaderComponent } from 'src/app/components/item-displays/page-header/page-header.component';
import { PersonCardComponent } from 'src/app/components/item-displays/person-card/person-card.component';
import { ItemListSectionComponent } from 'src/app/components/item-displays/item-list-section/item-list-section.component';
import { FeedMenuComponent } from 'src/app/components/common/feed-menu/feed-menu.component';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    PageHeaderComponent,
    PersonCardComponent,
    ItemListSectionComponent,
    FeedMenuComponent
  ],
})
export class ProfilePage implements OnInit, OnDestroy {
  userName: string | null = null;
  userPhotoUrl: string | null = null;
  postsCount: number | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  // <<<<< NOVAS PROPRIEDADES PARA UPLOAD DE FOTO DE PERFIL >>>>>
  profileImagePreviewUrl: string | ArrayBuffer | null = null; // Para a prévia da imagem selecionada
  selectedProfileFile: File | null = null; // O arquivo de imagem File real para upload
  private currentUserId: string | null = null; // Para armazenar o UID do usuário logado

  private userRecipesSubject = new BehaviorSubject<RecipeListItem[]>([]);
  userRecipes$: Observable<RecipeListItem[]> = this.userRecipesSubject.asObservable();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private receitaService: ReceitaService, // Injetado para usar o método de upload de imagem do Cloudinary
    private router: Router,
    private imageCompress: NgxImageCompressService // Injetado para compressão de imagem
  ) {}

  ngOnInit() {
    this.loadUserProfileAndRecipes();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadUserProfileAndRecipes() {
    this.isLoading = true;
    this.error = null;

    this.subscriptions.add(
      this.authService.authState.pipe(
        filter(user => !!user?.uid), // Garante que temos um UID de usuário
        switchMap(user => {
          const userId = user!.uid;
          this.currentUserId = userId; // Armazena o ID do usuário
          return this.authService.getCurrentUserData(userId).pipe(
            tap((userData: UserData | null) => {
              if (userData) {
                this.userName = userData.user_name || userData.displayName || 'Usuário';
                this.userPhotoUrl = userData.photoURL || 'https://placehold.co/100x100';
                this.profileImagePreviewUrl = this.userPhotoUrl; // Exibe a foto atual no preview
              } else {
                this.userName = 'Usuário Desconhecido';
                this.userPhotoUrl = 'https://placehold.co/100x100';
                this.profileImagePreviewUrl = 'https://placehold.co/100x100';
              }
            }),
            switchMap(() => {
              // Buscar receitas criadas pelo usuário
              return this.receitaService.getRecipesByCreator(userId);
            })
          );
        }),
        tap((recipes: RecipeListItem[]) => {
          this.userRecipesSubject.next(recipes);
          this.postsCount = recipes.length;
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Erro ao carregar perfil ou receitas:', err);
          this.error = 'Não foi possível carregar o perfil ou as receitas. Tente novamente.';
          this.isLoading = false;
          return of([]);
        })
      ).subscribe()
    );
  }

  navigateToRecipeDetail(recipeId: string) {
    this.router.navigate(['/receita-detalhe', recipeId]);
  }

  // <<<<< NOVO: Lógica de seleção e compressão de imagem para o perfil >>>>>
  async onProfileFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Verifica o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem (JPG, PNG, GIF, etc.).');
        this.selectedProfileFile = null;
        this.profileImagePreviewUrl = this.userPhotoUrl; // Volta para a foto atual
        return;
      }

      console.log(`Profile - onFileSelected: Tamanho original da imagem: ${file.size / 1024} KB`);

      try {
        // Converte File para base64 para compressão
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e: ProgressEvent<FileReader>) => {
          const base64Image = e.target?.result as string;

          // Comprime a imagem (qualidade de 70%, 70% de largura/altura, formato original)
          const compressedBase64 = await this.imageCompress.compressFile(
            base64Image,
            -1, // orientation: -1 for auto (default)
            70, // percentage for quality
            70 // percentage for width/height
          );
          console.log(`Profile - onFileSelected: Tamanho da imagem comprimida: ${this.imageCompress.byteCount(compressedBase64) / 1024} KB`);

          // Converte a imagem comprimida de volta para File
          const compressedFile = this.base64ToFile(compressedBase64, file.name, file.type);
          
          this.selectedProfileFile = compressedFile; // Armazena o arquivo COMPRIMIDO para upload
          this.profileImagePreviewUrl = compressedBase64; // Atualiza o preview com a imagem COMPRIMIDA
        };
        reader.onerror = (error) => {
          console.error('Profile - onFileSelected: Erro ao ler o arquivo:', error);
          alert('Erro ao carregar a imagem.');
          this.selectedProfileFile = null;
          this.profileImagePreviewUrl = this.userPhotoUrl; // Volta para a foto atual
        };

      } catch (error) {
        console.error('Profile - onFileSelected: Erro durante a compressão da imagem:', error);
        alert('Erro ao processar a imagem. Tente uma imagem diferente.');
        this.selectedProfileFile = null;
        this.profileImagePreviewUrl = this.userPhotoUrl; // Volta para a foto atual
      }
    } else {
      this.selectedProfileFile = null;
      this.profileImagePreviewUrl = this.userPhotoUrl; // Volta para a foto atual
    }
  }

  // Método auxiliar para converter Base64 para File (reutilizado do RecipeCreationPage)
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

  // <<<<< NOVO: Método para salvar a foto de perfil >>>>>
  async onSaveProfilePhoto(): Promise<void> {
    if (!this.currentUserId) {
      alert('Erro: Usuário não logado. Não é possível salvar a foto.');
      return;
    }
    if (!this.selectedProfileFile) {
      alert('Por favor, selecione uma imagem para salvar.');
      return;
    }

    try {
      // Usa o ReceitaService para fazer o upload da imagem para o Cloudinary (reaproveitando o método)
      const uploadedUrl = await firstValueFrom(this.receitaService.uploadRecipeImage(this.selectedProfileFile));
      
      // Chama o AuthService para atualizar a URL da foto de perfil no Firestore
      await this.authService.updateUserPhotoUrl(this.currentUserId, uploadedUrl);
      
      this.userPhotoUrl = uploadedUrl; // Atualiza a foto exibida no PersonCard
      this.profileImagePreviewUrl = uploadedUrl; // Atualiza a prévia para a nova URL
      this.selectedProfileFile = null; // Limpa o arquivo selecionado após o upload
      alert('Foto de perfil atualizada com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar nova foto de perfil:', error);
      alert('Erro ao salvar a foto de perfil. Por favor, tente novamente.');
    }
  }
}
