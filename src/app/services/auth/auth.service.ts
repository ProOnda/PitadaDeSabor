// src/app/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  updateProfile,
  User as FirebaseAuthUser,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  DocumentSnapshot,
  DocumentReference,
  Firestore,
  collection,
} from '@angular/fire/firestore';
import { UserData } from '../../interfaces/user.interfaces';
import { BehaviorSubject, Observable, map, switchMap, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection = collection(this.firestore, 'users');

  public authState: Observable<FirebaseAuthUser | null>;
  public userName$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: Auth, private router: Router, private firestore: Firestore) {
    console.log('AuthService: Construtor inicializado.');

    this.authState = user(this.auth);

    this.authState.pipe(
      switchMap(firebaseUser => {
        if (firebaseUser) {
          return this.getCurrentUserData(firebaseUser.uid).pipe(
            map(userData => userData?.user_name || userData?.displayName || firebaseUser.email || null)
          );
        } else {
          return of(null);
        }
      })
    ).subscribe(userName => {
      this.userName$.next(userName);
    });

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

  async registerUser(email: string, password: string, displayName: string): Promise<FirebaseAuthUser | null> {
    console.log('AuthService - registerUser(): Tentando registrar usuário com email:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        console.log('AuthService - registerUser(): Firebase User criado. UID:', firebaseUser.uid, 'Email do FirebaseUser:', firebaseUser.email);
        
        await updateProfile(firebaseUser, { displayName: displayName, photoURL: undefined });

        const userData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? null, // <<<<< CORRIGIDO: de undefined para null >>>>>
          displayName: firebaseUser.displayName ?? null, // <<<<< CORRIGIDO: de undefined para null >>>>>
          photoURL: firebaseUser.photoURL ?? null, // <<<<< CORRIGIDO: de undefined para null >>>>>
          user_name: displayName,
          favoriteRecipeIds: [],
        };
        
        console.log('AuthService - registerUser(): UserData a ser salva no Firestore (antes de setDoc):', userData);

        await setDoc(doc(this.usersCollection, firebaseUser.uid), userData, { merge: true });
        console.log('AuthService - registerUser(): Dados do novo usuário salvos no Firestore:', userData);
      }

      console.log('AuthService - registerUser(): Usuário registrado com sucesso. UID:', userCredential.user.uid);
      console.log('AuthService - registerUser(): auth.currentUser após registro:', this.auth.currentUser ? this.auth.currentUser.uid : 'null');
      return firebaseUser;
    } catch (error: any) {
      console.error('AuthService - registerUser(): Erro ao registrar usuário:', error.code, error.message);
      return Promise.reject(error);
    }
  }

  async loginUser(email: string, password: string): Promise<FirebaseAuthUser | null> {
    console.log('AuthService - loginUser(): Tentando fazer login...');
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        await this.saveUserDataToFirestore(firebaseUser);
      }
      console.log('AuthService - loginUser(): Login bem-sucedido. UID:', userCredential.user.uid);
      console.log('AuthService - loginUser(): auth.currentUser após login:', this.auth.currentUser ? this.auth.currentUser.uid : 'null');
      return firebaseUser;
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

  getCurrentUser(): Observable<FirebaseAuthUser | null> {
    return this.authState;
  }

  getToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    return currentUser ? currentUser.getIdToken() : Promise.resolve(null);
  }

  // ============== Métodos para dados do Firestore ==================

  private async saveUserDataToFirestore(user: FirebaseAuthUser): Promise<void> {
    const userRef = doc(this.usersCollection, user.uid);
    const userDoc = await getDoc(userRef);

    const userDataToSave: UserData = {
      uid: user.uid,
      email: user.email ?? null, // <<<<< CORRIGIDO: de undefined para null >>>>>
      displayName: user.displayName ?? null, // <<<<< CORRIGIDO: de undefined para null >>>>>
      photoURL: user.photoURL ?? null, // <<<<< CORRIGIDO: de undefined para null >>>>>
      user_name: user.displayName || user.email || 'Novo Usuário',
      favoriteRecipeIds: userDoc.exists() ? (userDoc.data() as UserData).favoriteRecipeIds || [] : [], 
    };

    if (!userDoc.exists()) {
      await setDoc(userRef, userDataToSave);
      console.log('AuthService: Dados do novo usuário criados no Firestore:', userDataToSave);
    } else {
      await updateDoc(userRef, {
        displayName: userDataToSave.displayName,
        photoURL: userDataToSave.photoURL,
        user_name: userDataToSave.user_name,
        email: userDataToSave.email,
      });
      console.log('AuthService: Dados do usuário existente atualizados no Firestore:', userDataToSave.uid);
    }
  }

  getCurrentUserData(uid: string): Observable<UserData | null> {
    const userDocRef: DocumentReference<UserData> = doc(this.firestore, `users/${uid}`) as DocumentReference<UserData>;

    return from(getDoc(userDocRef)).pipe(
      map((docSnapshot: DocumentSnapshot<UserData>) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          return { ...userData, uid: docSnapshot.id };
        } else {
          console.log(`AuthService: Documento do usuário ${uid} não encontrado no Firestore.`);
          return null;
        }
      }),
      catchError(error => {
        console.error('AuthService: Erro ao buscar dados do usuário no Firestore:', error);
        return of(null);
      })
    );
  }

  async updateUserPhotoUrl(userId: string, newPhotoUrl: string): Promise<void> {
    if (!userId) {
      console.error('AuthService: userId é nulo para updateUserPhotoUrl.');
      throw new Error('User ID is required to update photo URL.');
    }
    const userDocRef = doc(this.usersCollection, userId);
    try {
      await updateDoc(userDocRef, {
        photoURL: newPhotoUrl,
      });
      console.log(`AuthService: URL da foto de perfil do usuário ${userId} atualizada para: ${newPhotoUrl}`);
      if (this.auth.currentUser && this.auth.currentUser.uid === userId) {
        await updateProfile(this.auth.currentUser, { photoURL: newPhotoUrl });
      }
    } catch (error) {
      console.error(`AuthService: Erro ao atualizar foto de perfil do usuário ${userId} no Firestore:`, error);
      throw error;
    }
  }
}