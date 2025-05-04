import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { ButtonComponent } from '../../components/button/button.component';
import { SocialLoginComponent } from '../../components/social-login/social-login.component';
import { FooterLinkComponent } from '../../components/footer-link/footer-link.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service'; // Importe o AuthService

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    RouterModule,
    ReactiveFormsModule,
    CustomInputComponent,
    ButtonComponent,
    SocialLoginComponent,
    FooterLinkComponent,
  ],
})
export class CadastroPage implements OnInit {

  cadastroForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService // Injete o AuthService
  ) {
    this.cadastroForm = this.formBuilder.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      confirmarSenha: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const senhaControl = formGroup.get('senha');
    const confirmarSenhaControl = formGroup.get('confirmarSenha');

    if (!senhaControl || !confirmarSenhaControl) {
      return null;
    }

    if (confirmarSenhaControl.value === '') {
      return null; // A validação de 'required' já cuidará disso inicialmente
    }

    if (senhaControl.value !== confirmarSenhaControl.value) {
      return { 'senhasNaoCoincidem': true };
    }

    return null;
  }

  cadastrarUsuario() {
    console.log('Botão Cadastrar clicado!');
    console.log('Estado do formulário:', this.cadastroForm);
    console.log('Controles do formulário:', this.cadastroForm.controls);
    console.log('Valores do formulário:', this.cadastroForm.value);

    if (this.cadastroForm.valid) {
            const userData = this.cadastroForm.value;
            this.authService.cadastrar(userData).subscribe({
              next: (response) => {
                console.log('Cadastro realizado com sucesso!', response);
                // Agora, faça o login do usuário recém-cadastrado
                this.authService.login({ email: userData.email, senha: userData.senha }).subscribe({
                  next: (loginResponse) => {
                    console.log('Login após cadastro realizado com sucesso!', loginResponse);
                    this.router.navigate(['/feed']);
                  },
                  error: (loginError) => {
                    console.error('Erro ao fazer login após o cadastro', loginError);
                    this.errorMessage = 'Erro ao fazer login após o cadastro.';
                    this.router.navigate(['/login']); // Redirecionar para a página de login em caso de erro
                  }
                });
              },
              error: (error) => {
                console.error('Erro ao cadastrar', error);
                this.errorMessage = error?.error?.message || 'Erro ao realizar o cadastro.';
                if (error?.error?.message === 'Este email já está cadastrado.') {
                  this.errorMessage = 'Este email já está cadastrado.';
                }
              }
            });
          } else {
       this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
       }
      }
    }