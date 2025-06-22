import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone'; // Importe IonContent
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../components/common/button/button.component'; // Se você usar o botão

@Component({
  selector: 'app-password-sent',
  templateUrl: './password-sent.page.html',
  styleUrls: ['./password-sent.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, ButtonComponent], // Adicione IonContent
})
export class PasswordSentPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  goToLogin() {
    this.router.navigate(['/login']);
  }
}