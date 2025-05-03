import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone'; // Importe o IonContent
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { ButtonComponent } from '../../components/button/button.component';
import { SocialLoginComponent } from '../../components/social-login/social-login.component';
import { FooterLinkComponent } from '../../components/footer-link/footer-link.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, // Adicione o IonContent aos imports
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
    private router: Router
    // Adicione aqui o seu serviço de autenticação (ex: private authService: AuthService)
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
    if (this.cadastroForm.valid) {
      const nome = this.cadastroForm.value.nome;
      const email = this.cadastroForm.value.email;
      const senha = this.cadastroForm.value.senha;
      const confirmarSenha = this.cadastroForm.value.confirmarSenha;

      // Verifique se as senhas coincidem novamente aqui, por segurança
      if (senha !== confirmarSenha) {
        this.errorMessage = 'As senhas não coincidem.';
        return;
      }

      // Aqui você chamaria o seu serviço de autenticação para cadastrar o usuário
      // Exemplo (você precisará adaptar para o seu serviço):
      // this.authService.cadastrar({ nome, email, senha })
      //   .subscribe({
      //     next: (response) => {
      //       console.log('Cadastro realizado com sucesso!', response);
      //       this.router.navigate(['/home']); // Navega para a página inicial após o sucesso
      //     },
      //     error: (error) => {
      //       console.error('Erro ao cadastrar', error);
      //       this.errorMessage = 'Erro ao cadastrar. Por favor, tente novamente.';
      //       // Trate o erro de acordo com a sua API (ex: email já existe)
      //       if (error?.error?.message === 'Email already exists') {
      //         this.errorMessage = 'Este email já está cadastrado.';
      //       }
      //     }
      //   });

      // Por enquanto, apenas um log para demonstração:
      console.log('Dados do formulário de cadastro:', this.cadastroForm.value);
      this.router.navigate(['/home']); // Navegação simulada
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }

}