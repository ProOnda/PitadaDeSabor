import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-item',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent {
  @Input() icon: string = '';
  @Input() label: string = '';
  @Output() categoryClick = new EventEmitter<string>(); // Emite o label da categoria

  onCategoryClick() {
    this.categoryClick.emit(this.label);
  }
}