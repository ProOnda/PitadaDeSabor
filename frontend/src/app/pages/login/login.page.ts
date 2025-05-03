import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { SocialLoginComponent } from '../../components/social-login/social-login.component';
import { FooterLinkComponent } from '../../components/footer-link/footer-link.component';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component'; // Importe o CustomInputComponent
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    SocialLoginComponent,
    FooterLinkComponent,
    CustomInputComponent,
    ButtonComponent
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  constructor(private router: Router) {}

  login() {
    console.log('Log In clicked');
    this.router.navigate(['/home']);
  }
}