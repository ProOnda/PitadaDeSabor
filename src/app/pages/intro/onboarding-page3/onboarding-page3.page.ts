import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone'; // Importe IonButton aqui
import { OnboardingSlideComponent } from '../../../components/layout/onboarding-slide/onboarding-slide.component';

@Component({
  selector: 'app-onboarding-page3',
  standalone: true,
  imports: [IonContent, OnboardingSlideComponent, IonButton], // Adicione IonButton aos imports
  templateUrl: './onboarding-page3.page.html',
  styleUrls: ['./onboarding-page3.page.scss'],
})
export class OnboardingPage3 {
  constructor(private router: Router) {}

  navigateToNextPage() {
    this.router.navigate(['/login']);
  }

  navigateToPreviousPage() {
    this.router.navigate(['/onboarding/2']);
  }
}