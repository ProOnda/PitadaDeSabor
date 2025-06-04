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
import { Subscription, interval } from 'rxjs';
import { Router } from '@angular/router';

// Importe a interface correta para o item da lista de receitas
import { RecipeListItem } from '../../../../app/interfaces/recipe.interfaces';

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
  private timeSubscription: Subscription | undefined;
  private receitaService: ReceitaService = inject(ReceitaService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    this.carregarReceitas();
    this.updateSaudacao();
    
    this.timeSubscription = interval(60000).subscribe(() => {
      this.updateSaudacao();
    });

    this.authService.userName$.subscribe(name => {
      this.userName = name;
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
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

  carregarReceitas() {
    this.loading = true;
    this.error = null;
    
    // <<<<< CORREÇÃO AQUI: Chamando getRecipes() >>>>>
    this.receitaService.getRecipes().subscribe({
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

  handleCategoryClick(category: string) {
    console.log(`Categoria selecionada: ${category}`);
  }

  openReceitaDetails(receitaId: string) {
    console.log('Função openReceitaDetails chamada com ID:', receitaId);
    this.router.navigate(['/receita-detalhe', receitaId]);
  }

  goToCreateRecipe(): void {
    this.router.navigate(['/criar-receita']);
  }
}