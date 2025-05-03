import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-description-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './description-text.component.html',
  styleUrls: ['./description-text.component.scss'],
})
export class DescriptionTextComponent {
  @Input() text: string = '';
}