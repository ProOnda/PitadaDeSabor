import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-title.component.html',
  styleUrls: ['./logo-title.component.scss'],
})
export class LogoTitleComponent {
  @Input() title: string = '';
}