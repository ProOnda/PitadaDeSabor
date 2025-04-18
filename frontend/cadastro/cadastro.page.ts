import { Component } from '@angular/core';
import {
  IonContent,
  IonItem,
  IonInput,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonIcon,
    IonButton,
  ],
})
export class CadastroPage {
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}

 