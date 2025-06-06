import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-next-button',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
  templateUrl: './next-button.component.html',
  styleUrls: ['./next-button.component.scss'],
})
export class NextButtonComponent {
  @Output() nextClick = new EventEmitter<void>();

  handleClick() {
    this.nextClick.emit();
  }
}