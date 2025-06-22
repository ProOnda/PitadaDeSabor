// src/app/pages/category-food/category-food.page.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // ActivatedRoute para ler parâmetros da URL
import { Subscription, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

import { ReceitaService } from '../../../services/receita/receita.service';
import { RecipeListItem } from '../../../interfaces/recipe.interfaces';

import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { ReceitaCardHorizontalComponent } from '../../../components/item-displays/receita-card-horizontal/receita-card-horizontal.component';
import { FeedMenuComponent } from '../../../components/common/feed-menu/feed-menu.component';
import { ItemListSectionComponent } from '../../..//components/item-displays/item-list-section/item-list-section.component';


@Component({
  selector: 'app-category-food',
  templateUrl: './category-food.page.html',
  styleUrls: ['./category-food.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe, // Para formatar a data
    PageHeaderComponent,
    ReceitaCardHorizontalComponent,
    FeedMenuComponent,
    ItemListSectionComponent, // Se você usar este componente para agrupar as receitas
  ],
})
export class CategoryFoodPage implements OnInit, OnDestroy {
  categoryLabel: string | null = null;
  categoryId: string | null = null;
  recipes: RecipeListItem[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  private routeSubscription: Subscription | undefined;
  private receitaService: ReceitaService = inject(ReceitaService);
  private router: Router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute); // Injeção do ActivatedRoute

  constructor() {}

  ngOnInit() {
    this.routeSubscription = this.activatedRoute.paramMap.pipe(
      switchMap(params => {
        this.categoryId = params.get('id'); // Obtém o ID da categoria da URL
        if (this.categoryId) {
          // Opcional: Buscar o label da categoria se você tiver um serviço que faz isso
          // Por enquanto, vamos carregar a ID.
          // Para exibir o label correto no cabeçalho, podemos buscar todas as categorias uma vez
          // e mapear a ID para o label.
          return this.receitaService.getAllCategories().pipe(
            tap(categories => {
              const foundCategory = categories.find(cat => cat.id === this.categoryId);
              this.categoryLabel = foundCategory ? foundCategory.label : 'Categoria Desconhecida';
              this.loadRecipesByCategory(this.categoryId!); // Carrega as receitas
            }),
            catchError(err => {
              console.error('Erro ao buscar label da categoria:', err);
              this.categoryLabel = 'Erro ao Carregar';
              this.isLoading = false;
              this.error = 'Não foi possível carregar a categoria.';
              return of(null); // Retorna null para parar a stream no caso de erro na categoria
            })
          );
        } else {
          this.error = 'Nenhuma categoria especificada.';
          this.isLoading = false;
          this.categoryLabel = 'Erro';
          return of(null); // Retorna null se não houver ID na URL
        }
      })
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private loadRecipesByCategory(categoryId: string): void {
    this.isLoading = true;
    this.error = null;
    this.recipes = []; // Limpa receitas anteriores

    this.receitaService.getRecipes({ categories: [categoryId] }).subscribe({
      next: (data) => {
        this.recipes = data;
        this.isLoading = false;
        console.log(`Receitas para categoria ${this.categoryLabel} carregadas:`, data);
      },
      error: (err) => {
        console.error('Erro ao carregar receitas por categoria:', err);
        this.error = 'Não foi possível carregar as receitas para esta categoria.';
        this.isLoading = false;
      }
    });
  }

  navigateToRecipeDetail(recipeId: string): void {
    this.router.navigate(['/receita-detalhe', recipeId]);
  }
}