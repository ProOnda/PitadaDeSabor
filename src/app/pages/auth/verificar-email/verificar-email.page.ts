import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, sendEmailVerification } from '@angular/fire/auth';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonComponent } from '../../../components/common/button/button.component';

@Component({
  selector: 'app-verificar-email',
  templateUrl: './verificar-email.page.html',
  styleUrls: ['./verificar-email.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ButtonComponent],
})
export class VerificarEmailPage {
  private auth: Auth = inject(Auth);
  private router = inject(Router);

  message: string = '';
  errorMessage: string = '';

  constructor() {}

  async reenviarEmail() {
    const user = this.auth.currentUser;

    if (user) {
      try {
        await sendEmailVerification(user);
        this.message = 'E-mail de verificação reenviado com sucesso!';
        this.errorMessage = '';
      } catch (error: any) {
        console.error('Erro ao reenviar e-mail:', error);
        this.errorMessage = 'Erro ao reenviar e-mail. Tente novamente mais tarde.';
      }
    } else {
      this.errorMessage = 'Usuário não encontrado. Faça login novamente.';
    }
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}