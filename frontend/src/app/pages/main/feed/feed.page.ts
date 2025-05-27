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

// A interface ReceitaComId será substituída por RecipeListItem
// interface ReceitaComId {
//   id: string;
//   recipe: any;
// }

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
  // Use a nova interface RecipeListItem
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
    // O authService.getUserName() pode retornar null inicialmente,
    // então a subscrição ao userName$ é mais robusta.
    // this.userName = this.authService.getUserName();

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
    const now = new Date(Date.now() - (3 * 60 * 60 * 1000)); // Ajuste para o horário de Brasília (UTC-3)
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
    // CHAME O NOVO MÉTODO getRecipes() DO SEU RECEITASERVICE
    this.receitaService.getRecipes().subscribe( // `getRecipes()` agora retorna RecipeListItem[]
      (data: RecipeListItem[]) => { // Tipagem explícita para clareza
        console.log('Dados das receitas carregados:', data);
        data.forEach(item => {
          console.log('Item da receita:', item); // Verifique a estrutura de cada item
        });
        this.receitas = data;
        this.loading = false;
      },
      (error) => {
        this.error = error.message || 'Erro ao carregar receitas.';
        this.loading = false;
        console.error('Erro ao carregar receitas:', error); // Log do erro completo
      }
    );
  }

  handleCategoryClick(category: string) {
    console.log(`Categoria selecionada: ${category}`);
    // Aqui você pode adicionar a lógica para filtrar as receitas por categoria
    // e talvez navegar para uma página específica de categorias.
    // Exemplo:
    // this.receitaService.getRecipes(undefined, category).subscribe(
    //   (data) => { this.receitas = data; this.loading = false; },
    //   (error) => { this.error = error.message; this.loading = false; }
    // );
  }

  openReceitaDetails(receitaId: string) {
    console.log('Função openReceitaDetails chamada com ID:', receitaId);
    this.router.navigate(['/receita-detalhe', receitaId]);
  }
}
