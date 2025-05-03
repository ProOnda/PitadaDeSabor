import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone'; // Importe IonContent
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component'; // Importe o componente reutilizável
import { CustomInputComponent } from '../../components/custom-input/custom-input.component'; // Importe o componente reutilizável

@Component({
  selector: 'app-reset-password-new',
  templateUrl: './reset-password-new.page.html',
  styleUrls: ['./reset-password-new.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, RouterModule, ReactiveFormsModule, ButtonComponent, CustomInputComponent],
})
export class ResetPasswordNewPage implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    // Coloque sua lógica de inicialização aqui
  }

  // Coloque seus métodos (ex: resetNewPassword) aqui

}