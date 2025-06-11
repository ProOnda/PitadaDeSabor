// src/app/pages/main/profile/profile.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BehaviorSubject, Observable, Subscription, of, firstValueFrom } from 'rxjs';
import { switchMap, tap, catchError, filter } from 'rxjs/operators';

import { AuthService } from '../../../services/auth/auth.service';
import { ReceitaService } from '../../../services/receita/receita.service';
import { NgxImageCompressService } from 'ngx-image-compress';

import { RecipeListItem } from '../../../interfaces/recipe.interfaces';
import { UserData } from '../../../interfaces/user.interfaces';

import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { PersonCardComponent } from '../../../components/item-displays/person-card/person-card.component';
import { ItemListSectionComponent } from '../../../components/item-displays/item-list-section/item-list-section.component';
import { FeedMenuComponent } from '../../../components/common/feed-menu/feed-menu.component';


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

  profileImagePreviewUrl: string | ArrayBuffer | null = null;
  selectedProfileFile: File | null = null;
  private currentUserId: string | null = null;

  private userRecipesSubject = new BehaviorSubject<RecipeListItem[]>([]);
  userRecipes$: Observable<RecipeListItem[]> = this.userRecipesSubject.asObservable();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private receitaService: ReceitaService,
    private router: Router,
    private imageCompress: NgxImageCompressService
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
        filter(user => !!user?.uid),
        switchMap(user => {
          const userId = user!.uid;
          this.currentUserId = userId;
          return this.authService.getCurrentUserData(userId).pipe(
            tap((userData: UserData | null) => {
              if (userData) {
                this.userName = userData.user_name || userData.displayName || 'Usuário';
                this.userPhotoUrl = userData.photoURL || 'https://placehold.co/100x100'; // Default placeholder
                
                // <<<<< CORREÇÃO APLICADA AQUI >>>>>
                // Define profileImagePreviewUrl como null se for o placeholder padrão ou não houver foto real.
                // Isso fará com que o *ngIf="!profileImagePreviewUrl" no HTML seja verdadeiro.
                if (this.userPhotoUrl === 'https://placehold.co/100x100' || !userData.photoURL) {
                  this.profileImagePreviewUrl = null; // Mostra o fundo e ícones
                } else {
                  this.profileImagePreviewUrl = this.userPhotoUrl; // Mostra a foto real
                }

              } else {
                this.userName = 'Usuário Desconhecido';
                this.userPhotoUrl = 'https://placehold.co/100x100'; // Default placeholder
                this.profileImagePreviewUrl = null; // Se não houver dados do usuário, mostra o fundo
              }
            }),
            switchMap(() => {
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

  async onProfileFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem (JPG, PNG, GIF, etc.).');
        this.selectedProfileFile = null;
        // Voltar para null (fundo) se a imagem atual for o placeholder ou não houver foto real
        if (this.userPhotoUrl === 'https://placehold.co/100x100' || !this.userPhotoUrl) {
          this.profileImagePreviewUrl = null;
        } else {
          this.profileImagePreviewUrl = this.userPhotoUrl; // Volta para a foto real existente
        }
        return;
      }

      console.log(`Profile - onFileSelected: Tamanho original da imagem: ${file.size / 1024} KB`);

      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e: ProgressEvent<FileReader>) => {
          const base64Image = e.target?.result as string;

          const compressedBase64 = await this.imageCompress.compressFile(
            base64Image,
            -1, // orientation
            70, // quality
            70 // ratio
          );
          console.log(`Profile - onFileSelected: Tamanho da imagem comprimida: ${this.imageCompress.byteCount(compressedBase64) / 1024} KB`);

          const compressedFile = this.base64ToFile(compressedBase64, file.name, file.type);
          
          this.selectedProfileFile = compressedFile;
          this.profileImagePreviewUrl = compressedBase64; // Mostra a prévia da nova imagem
        };
        reader.onerror = (error) => {
          console.error('Profile - onFileSelected: Erro ao ler o arquivo:', error);
          alert('Erro ao carregar a imagem.');
          this.selectedProfileFile = null;
          // Voltar para null (fundo) se a imagem atual for o placeholder ou não houver foto real
          if (this.userPhotoUrl === 'https://placehold.co/100x100' || !this.userPhotoUrl) {
            this.profileImagePreviewUrl = null;
          } else {
            this.profileImagePreviewUrl = this.userPhotoUrl; // Volta para a foto real existente
          }
        };

      } catch (error) {
        console.error('Profile - onFileSelected: Erro durante a compressão da imagem:', error);
        alert('Erro ao processar a imagem. Tente uma imagem diferente.');
        this.selectedProfileFile = null;
        // Voltar para null (fundo) se a imagem atual for o placeholder ou não houver foto real
        if (this.userPhotoUrl === 'https://placehold.co/100x100' || !this.userPhotoUrl) {
          this.profileImagePreviewUrl = null;
        } else {
          this.profileImagePreviewUrl = this.userPhotoUrl; // Volta para a foto real existente
        }
      }
    } else {
      this.selectedProfileFile = null;
      // Voltar para null (fundo) se a imagem atual for o placeholder ou não houver foto real
      if (this.userPhotoUrl === 'https://placehold.co/100x100' || !this.userPhotoUrl) {
        this.profileImagePreviewUrl = null;
      } else {
        this.profileImagePreviewUrl = this.userPhotoUrl; // Volta para a foto real existente
      }
    }
  }

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
      const uploadedUrl = await firstValueFrom(this.receitaService.uploadRecipeImage(this.selectedProfileFile));
      
      await this.authService.updateUserPhotoUrl(this.currentUserId, uploadedUrl);
      
      this.userPhotoUrl = uploadedUrl; // Atualiza a foto real do usuário
      this.profileImagePreviewUrl = uploadedUrl; // Mostra a foto recém-salva
      this.selectedProfileFile = null; // Limpa o arquivo selecionado
      alert('Foto de perfil atualizada com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar nova foto de perfil:', error);
      alert('Erro ao salvar a foto de perfil. Por favor, tente novamente.');
    }
  }
}