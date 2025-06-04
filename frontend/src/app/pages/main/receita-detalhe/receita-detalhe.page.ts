import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../../services/receita/receita.service';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { InfoItemComponent } from '../../../components/item-displays/info-item/info-item.component';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';

import { RecipeDetail, IngredientDetail } from '../../../interfaces/recipe.interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-receita-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    InfoItemComponent
  ],
  templateUrl: './receita-detalhe.page.html',
  styleUrls: ['./receita-detalhe.page.scss'],
})
export class ReceitaDetalhePage implements OnInit, OnDestroy {
  receita$: Observable<RecipeDetail | undefined> = of(undefined);
  receitaId: string | null = null;
  loading: boolean = true;
  error: string | null = null;
  isFavorite: boolean = false;
  showIngredients: boolean = true;

  loggedInUserUid: string | null = null;

  private route = inject(ActivatedRoute);
  private receitaService = inject(ReceitaService);
  private router = inject(Router);
  private authService = inject(AuthService);

  private recipeSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;

  constructor() { }

  ngOnInit() {
    this.authSubscription = this.authService.authState.subscribe(user => {
      this.loggedInUserUid = user ? user.uid : null;
      console.log('ReceitaDetalhePage: UID do usuário logado:', this.loggedInUserUid);
    });

    this.recipeSubscription = this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => {
        this.receitaId = id;
        if (!id) {
          this.error = 'ID da receita não fornecido.';
          this.loading = false;
        }
      }),
      switchMap(id => {
        if (id) {
          this.loading = true;
          this.error = null;
          return this.receitaService.buscarReceitaPorIdComDetalhes(id).pipe(
            tap(data => {
              this.loading = false;
              if (!data) {
                this.error = 'Receita não encontrada ou dados inválidos.';
              }
            }),
            catchError((error: unknown) => {
              console.error('Erro ao carregar detalhes da receita:', error);
              let errorMessage = 'Não foi possível carregar os detalhes da receita.';
              if (error instanceof Error) {
                errorMessage += ` Detalhes: ${error.message}`;
              } else if (typeof error === 'object' && error !== null && 'message' in error) {
                errorMessage += ` Detalhes: ${(error as any).message}`;
              } else if (typeof error === 'string') {
                errorMessage += ` Detalhes: ${error}`;
              }
              this.error = errorMessage;
              this.loading = false;
              return of(undefined);
            })
          );
        } else {
          return of(undefined);
        }
      })
    ).subscribe(receita => {
      this.receita$ = of(receita);
      if (receita) {
        this.verificarSeFavorita();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.recipeSubscription) {
      this.recipeSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadRecipeDetails(): void {
    if (this.receitaId) {
      this.loading = true;
      this.error = null;
      this.receita$ = this.receitaService.buscarReceitaPorIdComDetalhes(this.receitaId).pipe(
        tap(data => {
          this.loading = false;
          if (!data) {
            this.error = 'Receita não encontrada ou dados inválidos.';
          }
        }),
        catchError((error: unknown) => {
          console.error('Erro ao recarregar detalhes da receita:', error);
          let errorMessage = 'Não foi possível recarregar os detalhes da receita.';
          if (error instanceof Error) {
            errorMessage += ` Detalhes: ${error.message}`;
          } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage += ` Detalhes: ${(error as any).message}`;
          } else if (typeof error === 'string') {
            errorMessage += ` Detalhes: ${error}`;
          }
          this.error = errorMessage;
          this.loading = false;
          return of(undefined);
        })
      );
      this.receita$.subscribe(receita => {
        if (receita) {
          this.verificarSeFavorita();
        }
      });
    }
  }

  verificarSeFavorita() {
    this.isFavorite = Math.random() < 0.5;
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    console.log('Favorito toggled:', this.isFavorite);
  }

  addToCart() {
    console.log('Adicionar ao carrinho clicado');
  }

  editRecipe(id: string): void {
    console.log('Navegando para editar receita:', id);
    // <<<<< MUDANÇA AQUI: NAVEGA PARA A ROTA DE EDIÇÃO COM O ID >>>>>
    this.router.navigate(['/recipe-creation', id]);
  }

  deleteRecipe(id: string): void {
    console.log('Deletar receita:', id);
    if (confirm('Tem certeza que deseja deletar esta receita?')) {
      this.receitaService.deleteRecipe(id).subscribe({
        next: () => {
          console.log('Receita deletada com sucesso!');
          this.router.navigate(['/feed']);
        },
        error: (error: unknown) => {
          console.error('Erro ao deletar receita:', error);
          let errorMessage = 'Erro desconhecido ao deletar a receita.';
          if (error instanceof Error) {
            errorMessage += ` Detalhes: ${error.message}`;
          } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage += ` Detalhes: ${(error as any).message}`;
          } else if (typeof error === 'string') {
            errorMessage += ` Detalhes: ${error}`;
          }
          this.error = errorMessage;
        }
      });
    }
  }

  toggleContent(contentType: 'ingredients' | 'preparation') {
    this.showIngredients = contentType === 'ingredients';
  }
}