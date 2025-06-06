import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile, User } from '@angular/fire/auth'; // Importe 'User'
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // authState é um Observable que emite o objeto User (ou null) do Firebase Authentication
  authState: Observable<User | null> = user(this.auth); // Tipagem mais específica
  userName$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: Auth, private router: Router) {
    console.log('AuthService: Construtor inicializado.');

    // Subscreve ao estado de autenticação para atualizar userName$
    this.authState.subscribe(user => {
      if (user) {
        console.log('AuthService: authState emitiu usuário:', user.uid, user.email, user.displayName);
        this.userName$.next(user.displayName || user.email?.split('@')[0] || 'Usuário');
      } else {
        console.log('AuthService: authState emitiu null (usuário deslogado ou anônimo).');
        this.userName$.next(null);
      }
      // Log do currentUser do Firebase Auth diretamente para depuração
      console.log('AuthService: auth.currentUser (após authState emitir):', this.auth.currentUser ? this.auth.currentUser.uid : 'null');
    });

    // Log inicial do currentUser para ver o estado no carregamento do serviço
    console.log('AuthService: auth.currentUser (no construtor):', this.auth.currentUser ? this.auth.currentUser.uid : 'null');
  }

  getUserId(): string | null {
    const currentUser = this.auth.currentUser;
    console.log('AuthService - getUserId(): auth.currentUser.uid:', currentUser ? currentUser.uid : 'null');
    return currentUser ? currentUser.uid : null;
  }

  getUserName(): string | null {
    return this.userName$.getValue();
  }

  async registerUser(email: string, password: string, displayName: string): Promise<User | null> { // Tipagem de retorno
    console.log('AuthService - registerUser(): Tentando registrar usuário...');
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      console.log('AuthService - registerUser(): Usuário registrado com sucesso. UID:', userCredential.user.uid);
      console.log('AuthService - registerUser(): auth.currentUser após registro:', this.auth.currentUser ? this.auth.currentUser.uid : 'null');
      return userCredential.user;
    } catch (error: any) {
      console.error('AuthService - registerUser(): Erro ao registrar usuário:', error.code, error.message);
      return Promise.reject(error);
    }
  }

  async loginUser(email: string, password: string): Promise<User | null> { // Tipagem de retorno
    console.log('AuthService - loginUser(): Tentando fazer login...');
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('AuthService - loginUser(): Login bem-sucedido. UID:', userCredential.user.uid);
      console.log('AuthService - loginUser(): auth.currentUser após login:', this.auth.currentUser ? this.auth.currentUser.uid : 'null');
      return userCredential.user;
    } catch (error: any) {
      console.error('AuthService - loginUser(): Erro ao fazer login:', error.code, error.message);
      return Promise.reject(error);
    }
  }

  async logoutUser(): Promise<void> {
    console.log('AuthService - logoutUser(): Tentando fazer logout...');
    try {
      await signOut(this.auth);
      console.log('AuthService - logoutUser(): Logout bem-sucedido.');
      console.log('AuthService - logoutUser(): auth.currentUser após logout:', this.auth.currentUser ? this.auth.currentUser.uid : 'null');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('AuthService - logoutUser(): Erro ao fazer logout:', error);
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.authState.pipe(map(user => !!user));
  }

  getCurrentUser(): Observable<User | null> { // Tipagem mais específica
    return this.authState;
  }

  getToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    return currentUser ? currentUser.getIdToken() : Promise.resolve(null);
  }
}