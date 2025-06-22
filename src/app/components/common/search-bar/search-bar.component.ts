import { Component, EventEmitter, Output } from '@angular/core';
import { IonIcon, IonInput, IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, IonIcon, IonInput, FormsModule, IonContent],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterClick = new EventEmitter<void>();

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  onFilterClick() {
    this.filterClick.emit();
  }
}