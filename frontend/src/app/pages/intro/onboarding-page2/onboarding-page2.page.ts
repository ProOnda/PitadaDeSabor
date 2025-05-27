import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone'; // Importe IonButton aqui
import { OnboardingSlideComponent } from '../../../components/layout/onboarding-slide/onboarding-slide.component';
import { NextButtonComponent } from '../../../components/common/next-button/next-button.component';

@Component({
  selector: 'app-onboarding-page2',
  standalone: true,
  imports: [IonContent, OnboardingSlideComponent, NextButtonComponent, IonButton], // Adicione IonButton aos imports
  templateUrl: './onboarding-page2.page.html',
  styleUrls: ['./onboarding-page2.page.scss'],
})
export class OnboardingPage2 {
  constructor(private router: Router) {}

  navigateToNextPage() {
    this.router.navigate(['/onboarding/3']);
  }

  navigateToPreviousPage() {
    this.router.navigate(['/onboarding/1']);
  }
}