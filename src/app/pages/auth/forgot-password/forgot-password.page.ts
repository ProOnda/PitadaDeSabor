import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../components/common/button/button.component';
import { CustomInputComponent } from '../../../components/common/custom-input/custom-input.component';
import { Auth } from '@angular/fire/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    CustomInputComponent,
  ],
})
export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: Auth
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {}

  async resetPassword() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      try {
        await sendPasswordResetEmail(this.auth, email);
        this.errorMessage = '';
        this.router.navigate(['/password-sent']);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          this.errorMessage = 'Nenhum usuário encontrado com esse email.';
        } else {
          this.errorMessage = 'Ocorreu um erro ao enviar o email. Tente novamente.';
        }
      }
    } else {
      this.errorMessage = 'Por favor, insira um email válido.';
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}