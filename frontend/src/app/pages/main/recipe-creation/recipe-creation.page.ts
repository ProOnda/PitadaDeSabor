// C:\Projetos\ProOnda\PitadaDeSabor\frontend\src\app\pages\main\recipe-creation\recipe-creation.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Importe CommonModule
import { FormsModule } from '@angular/forms'; // Importe FormsModule para [(ngModel)]

// Importe o PageHeaderComponent diretamente, já que ele também é standalone
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component'; 

@Component({
  selector: 'app-recipe-creation',
  standalone: true, // <--- Marque como standalone
  imports: [
    CommonModule,     // <--- Para *ngIf, *ngFor
    FormsModule,      // <--- Para [(ngModel)]
    PageHeaderComponent // <--- Importe o componente de cabeçalho
  ],
  templateUrl: './recipe-creation.page.html', // <--- Aponta para .page.html
  styleUrls: ['./recipe-creation.page.scss'] // <--- Aponta para .page.scss (ou .page.css)
})
export class RecipeCreationPage implements OnInit {

  ingredients: { name: string, quantity: number | null, unit: string }[] = [];
  preparationSteps: { description: string }[] = [];

  constructor(
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.addIngredient();
    this.addPreparationStep();
  }

  onBackClick(): void {
    this.location.back();
  }

  addIngredient(): void {
    this.ingredients.push({ name: '', quantity: null, unit: '' });
  }

  removeIngredient(index: number): void {
    this.ingredients.splice(index, 1);
  }

  addPreparationStep(): void {
    this.preparationSteps.push({ description: '' });
  }

  removePreparationStep(index: number): void {
    this.preparationSteps.splice(index, 1);
  }

  saveRecipe(): void {
    console.log('Dados da Receita para Salvar:', {
      title: (document.getElementById('tituloReceita') as HTMLInputElement)?.value,
      description: (document.getElementById('descricaoReceita') as HTMLTextAreaElement)?.value,
      time: (document.getElementById('tempo') as HTMLSelectElement)?.value,
      difficulty: (document.getElementById('dificuldade') as HTMLSelectElement)?.value,
      category: (document.getElementById('categoria') as HTMLSelectElement)?.value,
      ingredients: this.ingredients,
      preparationSteps: this.preparationSteps
    });
    alert('Receita Salva! (Verifique o console para os dados)');
  }

  cancelRecipe(): void {
    console.log('Criação de receita cancelada.');
    alert('Criação de receita cancelada.');
    this.onBackClick();
  }
}