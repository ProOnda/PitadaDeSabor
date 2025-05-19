import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../services/receita/receita.service';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { InfoItemComponent } from '../../components/info-item/info-item.component';

interface ReceitaDetalhe {
  id: string;
  recipe: {
    photo?: string;
    recipe_name?: string;
    description?: string;
    categoryName?: string;
    difficultyName?: string;
    timeName?: string;
    userName?: string;
    ingredients?: string[]; // Adicione a propriedade ingredients
    preparation_mode?: string[]; // Adicione a propriedade preparation_mode
  };
}

@Component({
  selector: 'app-receita-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PageHeaderComponent,
    InfoItemComponent
  ],
  templateUrl: './receita-detalhe.page.html',
  styleUrls: ['./receita-detalhe.page.scss'],
})
export class ReceitaDetalhePage implements OnInit {
  receitaId: string | null = null;
  receita: ReceitaDetalhe | undefined;
  isFavorite: boolean = false; // Adicione esta propriedade
  showIngredients: boolean = true; // Inicialmente mostra os ingredientes

  constructor(
    private route: ActivatedRoute,
    private receitaService: ReceitaService
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.receitaId = idParam;
      this.carregarReceitaComDetalhes(this.receitaId);
      this.verificarSeFavorita(); // Chame a função para verificar o estado inicial
    }
  }

  carregarReceitaComDetalhes(id: string) {
    this.receitaService.buscarReceitaPorIdComDetalhes(id).subscribe(
      (data) => {
        this.receita = data;
        console.log('Detalhes da receita carregados:', this.receita);
      },
      (error) => {
        console.error('Erro ao carregar detalhes da receita:', error);
      }
    );
  }

  verificarSeFavorita() {
    // Aqui você implementaria a lógica para verificar se esta receita
    // já está na lista de favoritos do usuário.
    // Por enquanto, vamos definir um valor inicial aleatório para demonstração:
    this.isFavorite = Math.random() < 0.5;
  }

  toggleFavorite() { // Adicione esta função
    this.isFavorite = !this.isFavorite;
    // Aqui você implementaria a lógica para adicionar ou remover
    // esta receita da lista de favoritos do usuário e persistir essa informação.
    console.log('Favorito toggled:', this.isFavorite);
  }

  addToCart() {
    // Aqui você implementaria a lógica para adicionar esta receita
    // ao carrinho de compras do usuário.
    console.log('Adicionar ao carrinho');
  }

  toggleContent(contentType: 'ingredients' | 'preparation') {
    this.showIngredients = contentType === 'ingredients';
  }
}