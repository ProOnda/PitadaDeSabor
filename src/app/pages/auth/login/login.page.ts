// src/app/pages/login/login.page.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { SocialLoginComponent } from '../../../components/item-displays/social-login/social-login.component';
import { FooterLinkComponent } from '../../../components/item-displays/footer-link/footer-link.component';
import { CustomInputComponent } from '../../../components/common/custom-input/custom-input.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../components/common/button/button.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';

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

  async fazerLogin() {
    if (this.loginForm.valid) {
      const { email, senha } = this.loginForm.value;
      try {
        await this.authService.loginUser(email, senha);
        console.log('Login realizado com sucesso!');
        this.router.navigate(['/feed']);
      } catch (error: any) {
        this.errorMessage = error.message || 'Erro ao fazer login.';
        if (error.code === 'auth/invalid-credential') {
          this.errorMessage = 'Credenciais inválidas.';
        } else if (error.code === 'auth/user-not-found') {
          this.errorMessage = 'Usuário não encontrado.';
        }
      }
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