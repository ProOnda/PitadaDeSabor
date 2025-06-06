import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { BackgroundImageWithOverlayComponent } from '../../../components/layout/background-image-with-overlay/background-image-with-overlay.component';
import { LogoTitleComponent } from '../../../components/common/logo-title/logo-title.component';
import { ButtonComponent } from '../../../components/common/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-introduction',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    BackgroundImageWithOverlayComponent,
    LogoTitleComponent,
    ButtonComponent,
  ],
  templateUrl: './introduction.page.html',
  styleUrls: ['./introduction.page.scss'],
})
export class IntroductionPage {
  constructor(private router: Router) {}

  onDescobrirMaisClick() {
    this.router.navigateByUrl('/onboarding/1');
}}