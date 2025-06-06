import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.scss'],
})
export class SocialLoginComponent {
  // ... sua lógica ...
}