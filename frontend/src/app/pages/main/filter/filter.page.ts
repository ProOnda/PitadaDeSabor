import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';
import { ItemListSectionComponent } from '../../../components/item-displays/item-list-section/item-list-section.component';
import { FilterItemComponent } from '../../../components/item-displays/filter-item/filter-item.component';

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
    IonBackButton,
    ItemListSectionComponent,
    FilterItemComponent
  ],
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage {
  selectedFilters: { [key: string]: string[] } = {};

  handleFilterSelection(category: string, value: string) {
    if (!this.selectedFilters[category]) {
      this.selectedFilters[category] = [];
    }
    const index = this.selectedFilters[category].indexOf(value);
    if (index > -1) {
      this.selectedFilters[category].splice(index, 1); // Deselecionar
    } else {
      this.selectedFilters[category].push(value); // Selecionar
    }
    console.log('Filtros Selecionados:', this.selectedFilters);
    // Aqui você implementaria a lógica para aplicar os filtros
  }
}