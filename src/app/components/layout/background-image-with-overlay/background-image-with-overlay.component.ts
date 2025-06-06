import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-background-image-with-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background-image-with-overlay.component.html',
  styleUrls: ['./background-image-with-overlay.component.scss'],
})
export class BackgroundImageWithOverlayComponent {
  @Input() imageUrl: string = '';
}