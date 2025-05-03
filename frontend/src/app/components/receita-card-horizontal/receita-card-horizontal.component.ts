import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receita-card-horizontal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receita-card-horizontal.component.html',
  styleUrls: ['./receita-card-horizontal.component.scss']
})
export class ReceitaCardHorizontalComponent {
  @Input() receita: any; // Recebe um objeto de receita como entrada
}