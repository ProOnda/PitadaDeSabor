import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Adicionado Router
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../../services/receita/receita.service';
// REMOVIDO: IonicModule, pois não estamos mais usando componentes Ionic no HTML
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { InfoItemComponent } from '../../../components/item-displays/info-item/info-item.component';
import { Observable, of, Subscription } from 'rxjs'; // Adicionado Subscription
import { switchMap, catchError, map, tap } from 'rxjs/operators'; // Adicionado tap

// Importe as interfaces do arquivo centralizado
import { RecipeDetail, IngredientDetail } from '../../../interfaces/recipe.interfaces';

@Component({
  selector: 'app-receita-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    // REMOVIDO: IonicModule
    PageHeaderComponent,
    InfoItemComponent
  ],
  templateUrl: './receita-detalhe.page.html',
  styleUrls: ['./receita-detalhe.page.scss'],
})
export class ReceitaDetalhePage implements OnInit, OnDestroy {
  receita$: Observable<RecipeDetail | undefined> = of(undefined);
  receitaId: string | null = null; // Adicionado para armazenar o ID da rota
  loading: boolean = true; // Adicionado para controlar o estado de carregamento
  error: string | null = null; // Adicionado para exibir mensagens de erro
  isFavorite: boolean = false;
  showIngredients: boolean = true;

  private route = inject(ActivatedRoute);
  private receitaService = inject(ReceitaService);
  private router = inject(Router); // Injetado o Router para navegação

  private recipeSubscription: Subscription | undefined; // Para gerenciar a subscrição da receita

  constructor() { }

  ngOnInit() {
    // Inscreve-se nos parâmetros da rota para obter o ID da receita
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => {
        this.receitaId = id; // Armazena o ID da receita
        if (!id) {
          this.error = 'ID da receita não fornecido.';
          this.loading = false;
        }
      }),
      switchMap(id => {
        if (id) {
          this.loading = true; // Inicia o carregamento
          this.error = null; // Limpa erros anteriores
          return this.receitaService.buscarReceitaPorIdComDetalhes(id).pipe(
            tap(data => {
              this.loading = false; // Finaliza o carregamento
              if (!data) {
                this.error = 'Receita não encontrada ou dados inválidos.';
              }
            }),
            catchError(error => {
              console.error('Erro ao carregar detalhes da receita:', error);
              this.error = 'Não foi possível carregar os detalhes da receita.';
              this.loading = false;
              return of(undefined);
            })
          );
        } else {
          return of(undefined);
        }
      })
    ).subscribe(receita => {
      this.receita$ = of(receita); // Atribui o Observable de volta à propriedade receita$
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
        catchError(error => {
          console.error('Erro ao recarregar detalhes da receita:', error);
          this.error = 'Não foi possível recarregar os detalhes da receita.';
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
      this.receitaService.deleteRecipe(id).subscribe(() => {
        console.log('Receita deletada com sucesso!');
        this.router.navigate(['/feed']); // Navegar de volta para o feed após deletar
      }, error => {
        console.error('Erro ao deletar receita:', error);
        this.error = 'Erro ao deletar a receita.';
      });
    }
  }

  toggleContent(contentType: 'ingredients' | 'preparation') {
    this.showIngredients = contentType === 'ingredients';
  }
}
