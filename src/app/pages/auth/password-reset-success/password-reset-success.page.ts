import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone'; // Importe IonContent
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../components/common/button/button.component'; // Se você usar o botão

@Component({
  selector: 'app-password-reset-success',
  templateUrl: './password-reset-success.page.html',
  styleUrls: ['./password-reset-success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, ButtonComponent], // Adicione IonContent
})
export class PasswordResetSuccessPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  goToLogin() {
    this.router.navigate(['/login']);
  }
}