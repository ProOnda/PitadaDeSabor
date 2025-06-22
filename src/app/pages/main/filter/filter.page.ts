// filter.page.ts - (Versão Corrigida com ReceitaService e Transição de UI)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton // Precisa para o botão de voltar customizado
} from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/item-displays/page-header/page-header.component';

import { OptionSectionComponent } from '../../../components/item-displays/option-section/option-section.component';
import { OptionItem, RecipeListItem } from '../../../interfaces/recipe.interfaces';
import { ReceitaService } from '../../../services/receita/receita.service'; // Use o seu serviço

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton, // Adicionado aqui
    PageHeaderComponent,
    OptionSectionComponent
  ],
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {
  selectedFilters: { [key: string]: string[] } = {
    categories: [],
    time: [],
    difficulty: [],
    foodTypes: []
  };

  filteredRecipes: RecipeListItem[] = [];
  isLoading: boolean = false; // Para mostrar um indicador de carregamento
  showFilters: boolean = true; // Controla qual visão está ativa (true = filtros, false = resultados)

  categoriesOptions: OptionItem[] = [
    { label: 'Lanches', value: '1' },
    { label: 'Refeições', value: '2' },
    { label: 'Sobremesas', value: '3' },
  ];

  timeOptions: OptionItem[] = [
    { label: 'Até 30 min', value: '1' },
    { label: '30-60 min', value: '2' },
    { label: '60-120 min', value: '3' },
    { label: 'Mais de 120 min', value: '4' },
  ];

  difficultyOptions: OptionItem[] = [
    { label: 'Fácil', value: '1' },
    { label: 'Médio', value: '2' },
    { label: 'Difícil', value: '3' },
  ];

  foodTypesOptions: OptionItem[] = [
    { label: 'Carnes, Aves e Peixes', value: '1' },
    { label: 'Laticínios e Ovos', value: '2' },
    { label: 'Cereais e Grãos', value: '3' },
    { label: 'Leguminosas', value: '4' },
    { label: 'Frutas', value: '5' },
    { label: 'Vegetais', value: '6' },
    { label: 'Óleos e Gorduras', value: '7' },
    { label: 'Açúcares e Doces', value: '8' },
    { label: 'Especiarias e Condimentos', value: '9' },
    { label: 'Bebidas', value: '10' },
  ];

  constructor(
    private router: Router,
    private receitaService: ReceitaService // Injete o seu ReceitaService
  ) { }

  ngOnInit(): void {
    // A página começa mostrando os filtros, sem resultados.
    // this.applyFilters(); // Removido para não buscar ao iniciar
  }

  handleOptionSelected(filterCategory: string, value: string): void {
    if (!this.selectedFilters[filterCategory]) {
      this.selectedFilters[filterCategory] = [];
    }

    const index = this.selectedFilters[filterCategory].indexOf(value);

    if (index > -1) {
      this.selectedFilters[filterCategory].splice(index, 1);
    } else {
      this.selectedFilters[filterCategory].push(value);
    }

    console.log(`Filtros Selecionados para ${filterCategory}:`, this.selectedFilters[filterCategory]);

    // As receitas só serão filtradas e exibidas ao clicar no botão "Filtrar"
  }

  applyFilters(): void {
    this.isLoading = true; // Inicia o carregamento
    this.filteredRecipes = []; // Limpa resultados anteriores
    this.showFilters = false; // Oculta a seção de filtros e mostra a seção de resultados

    // Chama o serviço para buscar as receitas com os filtros selecionados
    this.receitaService.getRecipes(this.selectedFilters).subscribe({
      next: (recipes) => {
        this.filteredRecipes = recipes;
        console.log('Receitas encontradas:', this.filteredRecipes);
        this.isLoading = false; // Finaliza o carregamento com sucesso
      },
      error: (err) => {
        console.error('Erro ao buscar receitas:', err);
        this.filteredRecipes = []; // Limpa as receitas em caso de erro
        this.isLoading = false; // Finaliza o carregamento com erro
        // TODO: Mostrar mensagem de erro para o usuário (e.g., com um ToastController do Ionic)
      }
    });
  }

  navigateToRecipeDetail(recipeId: string): void {
    console.log('Navegando para detalhes da receita:', recipeId);
    // Certifique-se de que esta rota '/recipe/:id' está configurada no seu app-routing.module.ts
    this.router.navigate(['/receita-detalhe', recipeId]); // Use o nome exato da rota aqui!
  }

  // Novo método para voltar à tela de filtros a partir dos resultados
  backToFilters(): void {
    this.showFilters = true; // Mostra a seção de filtros
    this.filteredRecipes = []; // Opcional: Limpar resultados ao voltar para filtros
  }
}