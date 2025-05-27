import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-list-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-list-section.component.html',
  styleUrls: ['./item-list-section.component.scss']
})
export class ItemListSectionComponent {
  @Input() title: string = '';
  @Input() iconClass: string = ''; // Adicione esta linha
}