import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  doc,
  getDoc,
  setDoc,
  DocumentSnapshot,
  DocumentReference,
  Firestore, // Importe Firestore
} from '@angular/fire/firestore'; // Importe os módulos do Firestore
import { UserData } from '../../interfaces/user.interfaces'; // Verifique o caminho correto para sua interface UserData
import { BehaviorSubject, Observable, map, switchMap, of, from } from 'rxjs'; // Adicione 'from' e 'of' aqui
import { catchError } from 'rxjs/operators'; // Adicione 'catchError' aqui

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // authState é um Observable que emite o objeto User (ou null) do Firebase Authentication
  authState: Observable<User | null> = user(this.auth); // Tipagem mais específica
  userName$ = new BehaviorSubject<string | null>(null);

  // Adicione 'private firestore: Firestore' ao construtor
  constructor(private auth: Auth, private router: Router, private firestore: Firestore) {
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

  async registerUser(email: string, password: string, displayName: string): Promise<User | null> {
    console.log('AuthService - registerUser(): Tentando registrar usuário...');
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName }); // Use user diretamente aqui

      // Salvar dados no Firestore
      if (user) {
        await this.updateUserData(user); // Chame updateUserData para salvar no Firestore
      }

      console.log('AuthService - registerUser(): Usuário registrado com sucesso. UID:', userCredential.user.uid);
      console.log('AuthService - registerUser(): auth.currentUser após registro:', this.auth.currentUser ? this.auth.currentUser.uid : 'null');
      return userCredential.user;
    } catch (error: any) {
      console.error('AuthService - registerUser(): Erro ao registrar usuário:', error.code, error.message);
      return Promise.reject(error);
    }
  }

  async loginUser(email: string, password: string): Promise<User | null> {
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

  getCurrentUser(): Observable<User | null> {
    return this.authState;
  }

  getToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    return currentUser ? currentUser.getIdToken() : Promise.resolve(null);
  }

  // ============== Métodos para dados do Firestore (adicionados/confirmados) ==================

  // Método para obter dados do usuário do Firestore
  getUserData(uid: string): Observable<UserData | null> {
    const userDocRef: DocumentReference<UserData> = doc(this.firestore, `users/${uid}`) as DocumentReference<UserData>;

    // Usamos 'from' para converter a Promise de getDoc em um Observable
    return from(getDoc(userDocRef)).pipe(
      map((docSnapshot: DocumentSnapshot<UserData>) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as UserData;
          return { ...userData, uid: docSnapshot.id };
        } else {
          console.log('No such user document!');
          return null;
        }
      }),
      catchError(error => { // Não esqueça de importar catchError de 'rxjs/operators'
        console.error('Error fetching user data from Firestore:', error);
        return of(null);
      })
    );
  }

  // Método para atualizar os dados do usuário no Firestore (chamado após registro, por exemplo)
  async updateUserData(user: User): Promise<void> {
    if (!user.uid) {
      console.error('User UID is missing for updateUserData.');
      return;
    }

    const userRef = doc(this.firestore, `users/${user.uid}`);

    const userData: UserData = {
      uid: user.uid,
      email: user.email ?? undefined,
      displayName: user.displayName ?? undefined,
      photoURL: user.photoURL ?? undefined,
      // Adicione outros campos que você deseja salvar
    };

    await setDoc(userRef, userData, { merge: true });
    console.log('User data updated successfully in Firestore:', userData);
  }

  // NOVO MÉTODO: Combina getCurrentUser com getUserData
  getCurrentUserData(userId: string): Observable<UserData | null> {
    // Basicamente, é o mesmo que getUserData, mas o nome é mais direto para o contexto de "dados do usuário logado"
    // ou se você quiser garantir que o userId vem do usuário autenticado.
    // Como você já tem getUserData, podemos simplesmente chamá-lo.
    return this.getUserData(userId);
  }

  // ... outros métodos (se houver)
}