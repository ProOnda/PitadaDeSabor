import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { CustomInputComponent } from '../../../components/common/custom-input/custom-input.component';
import { ButtonComponent } from '../../../components/common/button/button.component';
import { SocialLoginComponent } from '../../../components/item-displays/social-login/social-login.component';
import { FooterLinkComponent } from '../../../components/item-displays/footer-link/footer-link.component';
import { CommonModule } from '@angular/common';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core'; // Importe 'inject'
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    RouterModule,
    ReactiveFormsModule,
    CustomInputComponent,
    ButtonComponent,
    SocialLoginComponent,
    FooterLinkComponent,
  ],
})
export class CadastroPage implements OnInit {

  cadastroForm: FormGroup;
  errorMessage: string = '';
  exibirSenha: boolean = false;
  senhaInputType: string = 'password';
  exibirConfirmarSenha: boolean = false;
  confirmarSenhaInputType: string = 'password';
  private firestore: Firestore = inject(Firestore); // Injete o Firestore aqui
  private authService = inject(AuthService); // Você pode injetar o AuthService também usando inject
  private router = inject(Router);

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.cadastroForm = this.formBuilder.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      confirmarSenha: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const senhaControl = formGroup.get('senha');
    const confirmarSenhaControl = formGroup.get('confirmarSenha');

    if (!senhaControl || !confirmarSenhaControl) {
      return null;
    }

    if (confirmarSenhaControl.value === '') {
      return null; // A validação de 'required' já cuidará disso inicialmente
    }

    if (senhaControl.value !== confirmarSenhaControl.value) {
      return { 'senhasNaoCoincidem': true };
    }

    return null;
  }

  toggleSenha() {
    this.exibirSenha = !this.exibirSenha;
    this.senhaInputType = this.exibirSenha ? 'text' : 'password';
  }

  toggleConfirmarSenha() {
    this.exibirConfirmarSenha = !this.exibirConfirmarSenha;
    this.confirmarSenhaInputType = this.exibirConfirmarSenha ? 'text' : 'password';
  }

  async cadastrarUsuario() {
    if (this.cadastroForm.valid) {
      const { nome, email, senha } = this.cadastroForm.value;
      try {
        const userCredential = await this.authService.registerUser(email, senha, nome);
        console.log('Cadastro no Auth realizado com sucesso!', userCredential);
        if (userCredential?.uid) {
          const usersCollection = collection(this.firestore, 'users');
          const userDocRef = doc(usersCollection, userCredential.uid);
          await setDoc(userDocRef, {
            user_name: nome,
            email: email,
            photo: ''
          });
          console.log('Dados do usuário salvos no Firestore!');
          this.router.navigate(['/feed']);
        } else {
          this.errorMessage = 'Erro ao obter UID do usuário.';
          console.error('Erro ao obter UID do usuário.');
        }
      } catch (error: any) {
        console.error('Erro ao cadastrar usuário:', error);
        this.errorMessage = error.message || 'Erro ao realizar o cadastro.';
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'Este email já está cadastrado.';
        }
      }
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }
}