import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { OnboardingSlideComponent } from '../../components/onboarding-slide/onboarding-slide.component';
import { NextButtonComponent } from '../../components/next-button/next-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding-page1',
  standalone: true,
  imports: [CommonModule, IonContent, OnboardingSlideComponent, NextButtonComponent, IonIcon], // Verifique se NextButtonComponent está aqui
  templateUrl: './onboarding-page1.page.html',
  styleUrls: ['./onboarding-page1.page.scss'],
})
export class OnboardingPage1 {
  constructor(private router: Router) {}

  navigateToNextPage() {
    this.router.navigateByUrl('/onboarding/2');
  }
}