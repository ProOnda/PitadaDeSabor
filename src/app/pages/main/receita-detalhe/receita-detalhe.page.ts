// src/app/pages/main/receita-detalhe/receita-detalhe.page.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../../services/receita/receita.service';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { InfoItemComponent } from '../../../components/item-displays/info-item/info-item.component';
import { Observable, of, Subscription, combineLatest } from 'rxjs';
import { switchMap, catchError, map, tap, filter } from 'rxjs/operators';

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

  private subscriptions: Subscription = new Subscription();

  constructor() { }

  ngOnInit() {
    this.subscriptions.add(
      this.authService.authState.subscribe(user => {
        this.loggedInUserUid = user ? user.uid : null;
        console.log('ReceitaDetalhePage: UID do usuário logado:', this.loggedInUserUid);
        // Se o UID do usuário mudar (ex: login/logout), recarregue os detalhes da receita
        // para atualizar o status de favorito e visibilidade dos botões de ação
        if (this.receitaId) {
          this.loadRecipeDetails();
        }
      })
    );

    this.subscriptions.add(
      this.route.paramMap.pipe(
        map(params => params.get('id')),
        tap(id => {
          this.receitaId = id;
          if (!id) {
            this.error = 'ID da receita não fornecido.';
            this.loading = false;
          }
        }),
        filter(id => !!id),
        switchMap(id => {
          this.loading = true;
          this.error = null;
          return combineLatest([
            this.receitaService.buscarReceitaPorIdComDetalhes(id!),
            this.authService.authState.pipe(map(user => user?.uid))
          ]).pipe(
            tap(([receitaData, userUid]) => {
              this.loading = false;
              if (!receitaData) {
                this.error = 'Receita não encontrada ou dados inválidos.';
              } else {
                if (userUid && receitaData.id) {
                  this.receitaService.isRecipeFavorite(userUid, receitaData.id)
                    .subscribe(isFav => {
                      this.isFavorite = isFav;
                    });
                } else {
                  this.isFavorite = false;
                }
              }
            }),
            map(([receitaData, _]) => receitaData),
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
        })
      ).subscribe(receita => {
        this.receita$ = of(receita);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadRecipeDetails(): void {
    if (this.receitaId) {
      this.loading = true;
      this.error = null;
      this.subscriptions.add(
        combineLatest([
          this.receitaService.buscarReceitaPorIdComDetalhes(this.receitaId),
          this.authService.authState.pipe(map(user => user?.uid))
        ]).pipe(
          tap(([receitaData, userUid]) => {
            this.loading = false;
            if (!receitaData) {
              this.error = 'Receita não encontrada ou dados inválidos.';
            } else {
              if (userUid && receitaData.id) {
                this.receitaService.isRecipeFavorite(userUid, receitaData.id)
                  .subscribe(isFav => {
                    this.isFavorite = isFav;
                  });
              } else {
                this.isFavorite = false;
              }
            }
          }),
          map(([receitaData, _]) => receitaData),
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
        ).subscribe(receita => {
          this.receita$ = of(receita);
        })
      );
    }
  }

  toggleFavorite() {
    if (!this.loggedInUserUid || !this.receitaId) {
      console.warn('Usuário não logado ou ID da receita não disponível para alternar favorito.');
      // TODO: Mostrar mensagem para o usuário que precisa logar
      return;
    }

    this.receitaService.toggleFavoriteRecipe(this.loggedInUserUid, this.receitaId, this.isFavorite).subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
        console.log(`Receita ${this.receitaId} agora é favorita:`, this.isFavorite);
      },
      error: (err) => {
        console.error('Erro ao alternar favorito:', err);
        // TODO: Mostrar mensagem de erro para o usuário
      }
    });
  }

  editRecipe(id: string): void {
    console.log('Navegando para editar receita:', id);
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