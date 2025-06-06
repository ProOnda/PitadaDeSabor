// src/app/components/item-displays/item-list-section/item-list-section.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-list-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-list-section.component.html', // <<<<< Aponta para o arquivo HTML
  styleUrls: ['./item-list-section.component.scss'] // Certifique-se de que este arquivo de estilos exista
})
export class ItemListSectionComponent {
  @Input() title: string = '';
  @Input() iconClass: string = '';
}