import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { getAuth, deleteUser } from 'firebase/auth';
import { deleteDoc, doc, Firestore } from '@angular/fire/firestore';

import { ButtonComponent } from '../../../components/common/button/button.component';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';


// IMPORTES PARA O ALTO CONTRASTE
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonToggle, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-conta',
  templateUrl: './conta.page.html',
  styleUrls: ['./conta.page.scss'],
  standalone: true,
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    IonContent,
    IonItem,
    IonToggle,
    IonIcon,
    IonLabel,
    FormsModule
  ],
})
export class ContaPage {
  private isAlertPresented = false; // Evita múltiplos alertas
  highContrastPaletteToggle = false; // Classe do Alto Contraste

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private firestore: Firestore,
    private themeService: ThemeService
  ) {
    this.highContrastPaletteToggle = this.themeService.getHighContrast();
  }

  highContrastPaletteToggleChange(event: CustomEvent) {
    this.themeService.setHighContrast(event.detail.checked);
  }

  async deletarConta() {
    if (this.isAlertPresented) {
      return; // Impede mais de um alerta ao mesmo tempo
    }

    this.isAlertPresented = true;

    const alert = await this.alertCtrl.create({
      header: 'Confirmação',
      message: 'Tem certeza que deseja deletar sua conta? Essa ação é irreversível.',
      cssClass: 'custom-delete-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel-btn',
          handler: () => {
            this.isAlertPresented = false;
          }
        },
        {
          text: 'Deletar',
          handler: () => {
            this.isAlertPresented = false;
            this.confirmarDeletarConta();
          },
          cssClass: 'alert-delete-btn'
        }
      ]
    });

    await alert.present();
  }

  private async confirmarDeletarConta() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await deleteDoc(doc(this.firestore, 'users', user.uid));
        console.log('Dados do Firestore deletados.');

        await deleteUser(user);
        console.log('Usuário autenticado deletado.');

        this.router.navigate(['/login']);
      } catch (error: any) {
        console.error('Erro ao deletar conta:', error);
        alert('Erro ao deletar conta. Faça login novamente e tente.');
      }
    } else {
      alert('Nenhum usuário logado.');
    }
  }
}