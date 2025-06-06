import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone'; // Importe IonContent
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../components/common/button/button.component';
import { CustomInputComponent } from '../../../components/common/custom-input/custom-input.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, // Adicione IonContent aos imports
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    CustomInputComponent,
  ],
})
export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    // Adicione aqui o seu serviço de autenticação (ex: private authService: AuthService)
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {}

  resetPassword() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;
      // ... (restante da sua lógica)
    } else {
      // ... (restante da sua lógica)
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}