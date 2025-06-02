import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../../services/receita/receita.service'; // Ajustado para o caminho correto do serviço
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { InfoItemComponent } from '../../../components/item-displays/info-item/info-item.component';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';

// Importe as interfaces do arquivo centralizado
import { RecipeDetail, IngredientDetail } from '../../../interfaces/recipe.interfaces';

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

  private route = inject(ActivatedRoute);
  private receitaService = inject(ReceitaService);
  private router = inject(Router);

  private recipeSubscription: Subscription | undefined;

  constructor() { }

  ngOnInit() {
    // Inscreve-se nos parâmetros da rota para obter o ID da receita
    this.route.paramMap.pipe(
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
            catchError((error: unknown) => { // Correção: especifica o tipo 'unknown'
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
    // É uma boa prática desinscrever-se de subscrições manuais
    if (this.recipeSubscription) {
      this.recipeSubscription.unsubscribe();
    }
  }

  // Método para recarregar os detalhes da receita (usado no botão de tentar novamente)
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
        catchError((error: unknown) => { // Correção: especifica o tipo 'unknown'
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

  // Suas funções de interação
  verificarSeFavorita() {
    this.isFavorite = Math.random() < 0.5; // Lógica de exemplo
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    console.log('Favorito toggled:', this.isFavorite);
    // Implemente a lógica de API para salvar/remover favorito aqui
  }

  addToCart() {
    console.log('Adicionar ao carrinho clicado');
    // Implemente a lógica de adicionar ao carrinho aqui
  }

  editRecipe(id: string): void {
    console.log('Editar receita:', id);
    this.router.navigate(['/edit-recipe', id]); // Exemplo de navegação para tela de edição
  }

  deleteRecipe(id: string): void {
    console.log('Deletar receita:', id);
    // Exemplo de lógica de deleção com confirmação (você pode usar um modal customizado)
    if (confirm('Tem certeza que deseja deletar esta receita?')) { // Usar modal customizado em apps reais
      this.receitaService.deleteRecipe(id).subscribe({
        next: () => { // Usando next para sucesso
          console.log('Receita deletada com sucesso!');
          this.router.navigate(['/feed']); // Navegar de volta para o feed após deletar
        },
        error: (error: unknown) => { // Correção: especifica o tipo 'unknown' no erro
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
