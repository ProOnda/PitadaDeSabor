import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ReceitaService } from 'src/app/services/receita/receita.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { RecipeListItem } from 'src/app/interfaces/recipe.interfaces';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, catchError, filter, map } from 'rxjs/operators'; // Importe 'map'
import { PageHeaderComponent } from 'src/app/components/item-displays/page-header/page-header.component';
import { Router } from '@angular/router';
import { FeedMenuComponent } from 'src/app/components/common/feed-menu/feed-menu.component';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, PageHeaderComponent, IonIcon, IonButton, FeedMenuComponent],
})
export class FavoritesPage implements OnInit, OnDestroy {
  favoriteRecipes$: Observable<RecipeListItem[]> = of([]);
  isLoading: boolean = true;
  error: string | null = null;
  loggedInUserUid: string | null = null;

  private receitaService = inject(ReceitaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  private authSubscription: Subscription | undefined;
  private detailsVisibility: { [key: string]: boolean } = {}; // Mapa para controlar a visibilidade dos detalhes

  constructor() {}

  ngOnInit() {
    this.authSubscription = this.authService.authState.pipe(
      filter(user => !!user?.uid),
      switchMap(user => {
        this.loggedInUserUid = user!.uid;
        this.isLoading = true;
        this.error = null;
        return this.receitaService.getFavoriteRecipes(this.loggedInUserUid).pipe(
          catchError(err => {
            console.error('Erro ao carregar receitas favoritas:', err);
            this.error = 'Não foi possível carregar suas receitas favoritas.';
            this.isLoading = false;
            return of([]);
          })
        );
      })
    ).subscribe(recipes => {
      this.favoriteRecipes$ = of(recipes);
      this.isLoading = false;
      if (recipes.length === 0 && !this.error) {
        this.error = 'Você ainda não tem nenhuma receita favorita. Adicione algumas!';
      } else if (recipes.length > 0) {
        this.error = null;
        recipes.forEach(recipe => {
          this.detailsVisibility[recipe.id] = false; // Todos os detalhes começam ocultos
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleRecipeDetails(recipeId: string): void {
    const newDetailsVisibility = { ...this.detailsVisibility };

    Object.keys(newDetailsVisibility).forEach(id => {
      if (id === recipeId) {
        newDetailsVisibility[id] = !newDetailsVisibility[id]; // Inverte o estado do card clicado
      } else {
        newDetailsVisibility[id] = false; // Fecha os outros
      }
    });

    this.detailsVisibility = newDetailsVisibility;
  }

  isDetailsVisible(recipeId: string): boolean {
    return this.detailsVisibility[recipeId] || false;
  }

  // Método para remover a receita dos favoritos (o coração nesta página)
  // Se você optar por ter o coração para remover favoritos.
  toggleFavorite(recipeId: string): void {
    if (!this.loggedInUserUid || !recipeId) {
      console.warn('Usuário não logado ou ID da receita não disponível para remover favorito.');
      return;
    }

    this.receitaService.toggleFavoriteRecipe(this.loggedInUserUid, recipeId, true).subscribe({
      next: () => {
        console.log(`Receita ${recipeId} removida dos favoritos.`);
        // Atualiza a lista localmente para remover o card imediatamente
        this.favoriteRecipes$ = this.favoriteRecipes$.pipe(
          map((recipes: RecipeListItem[]) => recipes.filter((r: RecipeListItem) => r.id !== recipeId))
        );
      },
      error: (err) => {
        console.error('Erro ao remover favorito:', err);
        // TODO: Mostrar mensagem de erro para o usuário (e.g., com um ToastController)
      }
    });
  }

  navigateToRecipeDetail(recipeId: string): void {
    this.router.navigate(['/receita-detalhe', recipeId]);
  }
}