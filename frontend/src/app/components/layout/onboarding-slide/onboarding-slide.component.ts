import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-onboarding-slide',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton],
  templateUrl: './onboarding-slide.component.html',
  styleUrls: ['./onboarding-slide.component.scss'],
})
export class OnboardingSlideComponent {
  @Input() imageUrl: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() activeDot: number = 1; // Indica qual bolinha está ativa (1, 2 ou 3)
  @Input() showVoltar: boolean = false;
  @Input() showIniciar: boolean = false;
  @Input() voltarText: string = 'Voltar';
  @Input() iniciarText: string = 'Iniciar';
  @Input() onVoltarClick: () => void = () => {};
  @Input() onIniciarClick: () => void = () => {};
}