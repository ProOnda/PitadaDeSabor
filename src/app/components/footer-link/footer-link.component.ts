import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-link',
  templateUrl: './footer-link.component.html',
  styleUrls: ['./footer-link.component.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule],
})
export class FooterLinkComponent {
  @Input() isLoginPage: boolean = true; // Por padrão, assume que está na página de login
  @Input() text: string = '';       // Garanta que esta linha exista
  @Input() linkText: string = '';   // Garanta que esta linha exista
  @Input() route: string = '';
}