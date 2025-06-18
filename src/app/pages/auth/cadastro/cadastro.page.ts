import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CustomInputComponent } from '../../../components/common/custom-input/custom-input.component';
import { ButtonComponent } from '../../../components/common/button/button.component';
import { SocialLoginComponent } from '../../../components/item-displays/social-login/social-login.component';
import { FooterLinkComponent } from '../../../components/item-displays/footer-link/footer-link.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

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
  exibirSenha: boolean = false;
  senhaInputType: string = 'password';
  exibirConfirmarSenha: boolean = false;
  confirmarSenhaInputType: string = 'password';

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private formBuilder: FormBuilder) {
    this.cadastroForm = this.formBuilder.group(
      {
        nome: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        senha: ['', [Validators.required, Validators.minLength(6)]],
        confirmarSenha: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit() {}

  // ✔ Validador para senhas coincidirem
  passwordMatchValidator(formGroup: FormGroup) {
    const senha = formGroup.get('senha')?.value;
    const confirmarSenha = formGroup.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasNaoCoincidem: true };
  }

  // ✔ Mostrar/Ocultar Senha
  toggleSenha() {
    this.exibirSenha = !this.exibirSenha;
    this.senhaInputType = this.exibirSenha ? 'text' : 'password';
  }

  // ✔ Mostrar/Ocultar Confirmar Senha
  toggleConfirmarSenha() {
    this.exibirConfirmarSenha = !this.exibirConfirmarSenha;
    this.confirmarSenhaInputType = this.exibirConfirmarSenha ? 'text' : 'password';
  }

  // ✔ Cadastrar Usuário
async cadastrarUsuario() {
  if (this.cadastroForm.invalid) {
    this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
    return;
  }

  const { nome, email, senha } = this.cadastroForm.value;

  try {
    const userCredential = await this.authService.registerUser(email, senha, nome);
    console.log('Cadastro realizado com sucesso:', userCredential);

    this.errorMessage = 'Enviamos um e-mail de verificação. Por favor, verifique seu e-mail antes de acessar.';

    // 🔥 Redireciona para a página de login
    this.router.navigate(['/verificar-email']);

  } catch (error: any) {
    console.error('Erro ao cadastrar usuário:', error);

    if (error.code === 'auth/email-already-in-use') {
      this.errorMessage = 'Este email já está cadastrado.';
    } else if (error.code === 'auth/weak-password') {
      this.errorMessage = 'A senha precisa ter no mínimo 6 caracteres.';
    } else {
      this.errorMessage = error.message || 'Erro ao realizar o cadastro.';
    }
  }
}
}