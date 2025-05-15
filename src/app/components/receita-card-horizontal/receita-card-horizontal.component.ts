// receita-card-horizontal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receita-card-horizontal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receita-card-horizontal.component.html',
  styleUrls: ['./receita-card-horizontal.component.scss']
})
export class ReceitaCardHorizontalComponent implements OnInit {
  @Input() receita: any; // Recebe um objeto de receita como entrada

  ngOnInit(): void {
    console.log('Receita Card recebendo:', this.receita);
  }
}