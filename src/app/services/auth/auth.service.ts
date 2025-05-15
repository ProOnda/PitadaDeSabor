import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile } from '@angular/fire/auth';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState: Observable<any> = user(this.auth);
  userName$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: Auth, private router: Router) {
    this.authState.subscribe(user => {
      if (user) {
        this.userName$.next(user.displayName || user.email?.split('@')[0] || 'Usuário');
      } else {
        this.userName$.next(null);
      }
    });
  }

  getUserId(): string | null {
    const currentUser = this.auth.currentUser;
    return currentUser ? currentUser.uid : null;
  }

  getUserName(): string | null {
    return this.userName$.getValue();
  }

  async registerUser(email: string, password: string, displayName: string): Promise<any> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  async loginUser(email: string, password: string): Promise<any> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  async logoutUser(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.authState.pipe(map(user => !!user));
  }

  getCurrentUser(): Observable<any | null> {
    return this.authState;
  }

  getToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    return currentUser ? currentUser.getIdToken() : Promise.resolve(null);
  }
}