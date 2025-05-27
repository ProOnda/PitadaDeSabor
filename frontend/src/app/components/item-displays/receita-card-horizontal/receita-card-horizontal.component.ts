// src/app/components/item-displays/receita-card-horizontal/receita-card-horizontal.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RecipeListItem } from '../../../../app/interfaces/recipe.interfaces'; // Verifique o caminho!

@Component({
  selector: 'app-receita-card-horizontal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './receita-card-horizontal.component.html',
  styleUrls: ['./receita-card-horizontal.component.scss'],
})
export class ReceitaCardHorizontalComponent {
  @Input() receita!: RecipeListItem; // Recebe o objeto completo RecipeListItem

  constructor() {}

  // Getters para usar no template
  get receitaNome(): string {
    return this.receita?.recipeName || 'Nome da Receita';
  }

  get fotoUrl(): string {
    return this.receita?.photoUrl || 'assets/placeholder.png';
  }

  get descricao(): string {
    return this.receita?.description || 'Descrição da receita não disponível.';
  }
  // Se você precisa exibir categoryName, difficultyName etc. na listagem,
  // precisaria incluí-los no RecipeListItem e ter getters aqui.
  // Mas para o card horizontal, talvez só nome, foto e descrição bastem.
}