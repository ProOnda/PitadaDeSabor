import { Component, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { FeedMenuComponent } from '../../components/feed-menu/feed-menu.component';
import { CategoryItemComponent } from '../../components/category-item/category-item.component';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../service/receita.service';
import { ReceitaCardHorizontalComponent } from '../../components/receita-card-horizontal/receita-card-horizontal.component';
import { ItemListSectionComponent } from '../../components/item-list-section/item-list-section.component'; // Importe o ItemListSectionComponent

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
    ItemListSectionComponent // Adicione o ItemListSectionComponent ao array imports
  ],
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit {
  receitas: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private receitaService: ReceitaService) {}

  ngOnInit(): void {
    this.carregarReceitas();
  }

  carregarReceitas() {
    this.loading = true;
    this.error = null;
    this.receitaService.listarReceitas().subscribe(
      (data) => {
        this.receitas = data;
        this.loading = false;
      },
      (error) => {
        this.error = error.message || 'Erro ao carregar receitas.';
        this.loading = false;
      }
    );
  }

  handleCategoryClick(category: string) {
    console.log(`Categoria selecionada: ${category}`);
    // Implemente a lógica para filtrar as receitas por categoria
    // Você pode chamar this.carregarReceitas() aqui, passando a categoria como parâmetro
    // Exemplo (se você tiver um método no seu service para buscar por categoria):
    // this.receitaService.listarReceitasPorCategoria(category).subscribe(...);
  }
}