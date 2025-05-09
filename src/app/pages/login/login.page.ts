// src/app/pages/login/login.page.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { SocialLoginComponent } from '../../components/social-login/social-login.component';
import { FooterLinkComponent } from '../../components/footer-link/footer-link.component';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    RouterModule,
    ReactiveFormsModule,
    SocialLoginComponent,
    FooterLinkComponent,
    CustomInputComponent,
    ButtonComponent
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  emailRequiredError: string = 'Email é obrigatório.';
  emailInvalidError: string = 'Por favor, insira um email válido.';
  passwordRequiredError: string = 'Senha é obrigatória.';
  exibirSenha: boolean = false;
  senhaInputType: string = 'password';

  toggleSenha() {
    this.exibirSenha = !this.exibirSenha;
    this.senhaInputType = this.exibirSenha ? 'text' : 'password';
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  ngOnInit() {}

  loginUsuario() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login realizado com sucesso!', response);
          if (response.token) { // Adicionando a verificação
            localStorage.setItem('token', response.token);
            this.router.navigate(['/feed']);
          } else {
            console.warn('Token não recebido na resposta do login.');
            this.router.navigate(['/feed']); // Ou outra ação apropriada
          }
        },
        error: (error) => {
          console.error('Erro ao fazer login', error);
          this.errorMessage = error?.error?.message || 'Erro ao realizar o login.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }

  getEmailErrorMessage(): string {
    if (this.loginForm.controls['email'].hasError('required')) {
      return this.emailRequiredError;
    }
    if (this.loginForm.controls['email'].hasError('email')) {
      return this.emailInvalidError;
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.loginForm.controls['senha'].hasError('required')) {
      return this.passwordRequiredError;
    }
    return '';
  }
}