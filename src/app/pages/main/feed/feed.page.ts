// src/app/pages/main/feed/feed.page.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { SearchBarComponent } from '../../../components/common/search-bar/search-bar.component';
import { FeedMenuComponent } from '../../../components/common/feed-menu/feed-menu.component';
import { CategoryItemComponent } from '../../../components/item-displays/category-item/category-item.component';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../../services/receita/receita.service';
import { ReceitaCardHorizontalComponent } from '../../../components/item-displays/receita-card-horizontal/receita-card-horizontal.component';
import { ItemListSectionComponent } from '../../../components/item-displays/item-list-section/item-list-section.component';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription, interval, of } from 'rxjs';
import { Router } from '@angular/router';
import { switchMap, tap, catchError } from 'rxjs/operators';

import { RecipeListItem } from '../../../../app/interfaces/recipe.interfaces';
import { UserData } from '../../../../app/interfaces/user.interfaces';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    SearchBarComponent,
    FeedMenuComponent,
    CategoryItemComponent,
    ReceitaCardHorizontalComponent,
    ItemListSectionComponent
  ],
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit, OnDestroy {
  receitas: RecipeListItem[] = [];
  loading = true;
  error: string | null = null;
  saudacao: string = '';
  userName: string | null = null;
  userPhotoUrl: string | null = null; // Pode ser null
  searchTerm: string = '';

  allCategories: { id: string, label: string }[] = [];
  categoriesMap: Map<string, string> = new Map();

  private timeSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;
  private receitaService: ReceitaService = inject(ReceitaService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    this.carregarReceitas();
    this.updateSaudacao();
    this.loadUserData();
    this.loadCategories();
    
    this.timeSubscription = interval(60000).subscribe(() => {
      this.updateSaudacao();
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  updateSaudacao(): void {
    const now = new Date(Date.now() - (3 * 60 * 60 * 1000));
    const hour = now.getHours();

    if (hour >= 0 && hour < 12) {
      this.saudacao = 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      this.saudacao = 'Boa tarde';
    } else {
      this.saudacao = 'Boa noite';
    }
  }

  private loadUserData(): void {
    this.authSubscription = this.authService.authState.pipe(
      switchMap(firebaseUser => {
        if (firebaseUser) {
          return this.authService.getCurrentUserData(firebaseUser.uid).pipe(
            tap((userData: UserData | null) => {
              if (userData) {
                this.userName = userData.user_name || userData.displayName || firebaseUser.email || 'Usuário';
                // <<<<< CORREÇÃO APLICADA AQUI >>>>>
                // Define userPhotoUrl como null se for uma URL de placeholder ou não houver foto real.
                // Isso permite que o *ngIf="!userPhotoUrl" no HTML seja verdadeiro.
                if (userData.photoURL && userData.photoURL !== 'https://placehold.co/100x100' && userData.photoURL !== 'https://placehold.co/40x40') {
                  this.userPhotoUrl = userData.photoURL;
                } else {
                  this.userPhotoUrl = null; // Exibe o ícone placeholder
                }
              } else {
                this.userName = firebaseUser.email || 'Usuário';
                this.userPhotoUrl = null; // Exibe o ícone placeholder se não houver dados do usuário
              }
            }),
            catchError(error => {
              console.error('Erro ao carregar dados do usuário:', error);
              this.userName = firebaseUser.email || 'Usuário';
              this.userPhotoUrl = null; // Exibe o ícone placeholder em caso de erro
              return of(null);
            })
          );
        } else {
          this.userName = 'Usuário';
          this.userPhotoUrl = null; // Exibe o ícone placeholder se não houver usuário logado
          return of(null);
        }
      })
    ).subscribe();
  }

  private loadCategories(): void {
    this.receitaService.getAllCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        this.categoriesMap.clear();
        categories.forEach(cat => this.categoriesMap.set(cat.label, cat.id));
        console.log('Categorias carregadas:', this.allCategories);
      },
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
      }
    });
  }

  carregarReceitas(): void {
    this.loading = true;
    this.error = null;
    
    this.receitaService.getRecipes({ recipeName: this.searchTerm }).subscribe({
      next: (data: RecipeListItem[]) => {
        console.log('Dados das receitas carregados:', data);
        data.forEach(item => {
          console.log('Item da receita:', item);
        });
        this.receitas = data;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Erro ao carregar receitas:', error);
        let errorMessage = 'Não foi possível carregar as receitas.';
        if (error instanceof Error) {
          errorMessage += ` Detalhes: ${error.message}`;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage += ` Detalhes: ${(error as any).message}`;
        } else if (typeof error === 'string') {
          errorMessage += ` Detalhes: ${error}`;
        }
        this.error = errorMessage;
        this.loading = false;
      }
    });
  }

  handleSearchChange(term: string): void {
    this.searchTerm = term;
    this.carregarReceitas();
  }

  handleCategoryClick(categoryLabel: string): void {
    console.log(`Categoria clicada: ${categoryLabel}`);
    const categoryId = this.categoriesMap.get(categoryLabel);
    if (categoryId) {
      console.log(`Navegando para CategoryFoodPage com ID: ${categoryId}`);
      this.router.navigate(['/category-food', categoryId]);
    } else {
      console.warn(`ID da categoria não encontrada para o label: ${categoryLabel}`);
      alert('Categoria não encontrada.');
    }
  }

  openReceitaDetails(receitaId: string) {
    console.log('Função openReceitaDetails chamada com ID:', receitaId);
    this.router.navigate(['/receita-detalhe', receitaId]);
  }

  goToCreateRecipe(): void {
    this.router.navigate(['/criar-receita']);
  }

  goToFilterPage(): void {
    console.log('Navegando para a página de filtro...');
    this.router.navigate(['/filter']);
  }
}