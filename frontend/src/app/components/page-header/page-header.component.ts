import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common'; // Para a funcionalidade de voltar

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() showBackButton: boolean = true;
  @Input() backButtonRoute: string | null = null; // Rota para voltar, se especificada

  constructor(private location: Location) {}

  goBack(): void {
    if (this.backButtonRoute) {
      this.location.go(this.backButtonRoute); // Navegação sem histórico
    } else {
      this.location.back(); // Voltar para a página anterior no histórico
    }
  }
}