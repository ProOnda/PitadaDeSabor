import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { FooterLinkComponent } from '@components/item-displays/footer-link/footer-link.component';
import { ButtonComponent } from '@components/common/button/button.component';
import { CustomInputComponent } from '@components/common/custom-input/custom-input.component';
import { IonicModule, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FooterLinkComponent,
    ButtonComponent,
    CustomInputComponent,
  ],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  exibirSenha = false;
  senhaInputType = 'password';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  toggleSenha(): void {
    this.exibirSenha = !this.exibirSenha;
    this.senhaInputType = this.exibirSenha ? 'text' : 'password';
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email é obrigatório.';
    }
    if (emailControl?.hasError('email')) {
      return 'Por favor, insira um email válido.';
    }
    return '';
  }

  async fazerLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    const { email, senha } = this.loginForm.value;

    const loading = await this.loadingController.create({
      message: 'Entrando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      await this.authService.loginUser(email, senha);
      await loading.dismiss();
      this.router.navigate(['/feed']);
    } catch (error: any) {
      await loading.dismiss();
      this.tratarErroLogin(error);
    }
  }

  async fazerLoginGoogle(): Promise<void> {
    this.errorMessage = '';
    const loading = await this.loadingController.create({
      message: 'Entrando com Google...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      await this.authService.loginWithGoogle();
      await loading.dismiss();
      this.router.navigate(['/feed']);
    } catch (error: any) {
      await loading.dismiss();
      this.errorMessage = error.message || 'Erro ao fazer login com Google.';
      console.error('Erro no login Google:', error);
    }
  }

  private tratarErroLogin(error: any) {
    console.error('Erro no login:', error);
    if (error?.code === 'auth/invalid-credential') {
      this.errorMessage = 'Credenciais inválidas.';
    } else if (error?.code === 'auth/user-not-found') {
      this.errorMessage = 'Usuário não encontrado.';
    } else if (error?.code === 'auth/wrong-password') {
      this.errorMessage = 'Senha incorreta.';
    } else {
      this.errorMessage = error.message || 'Erro ao fazer login.';
    }
  }
}