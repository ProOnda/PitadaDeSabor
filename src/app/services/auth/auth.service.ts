import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  User as FirebaseAuthUser,
  sendEmailVerification,
} from '@angular/fire/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Firestore,
  collection,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, switchMap, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { UserData } from '../../interfaces/user.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection = collection(this.firestore, 'users');

  public authState: Observable<FirebaseAuthUser | null>;
  public userName$ = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore
  ) {
    this.authState = user(this.auth);

    this.authState
      .pipe(
        switchMap((firebaseUser) => {
          if (firebaseUser) {
            return this.getCurrentUserData(firebaseUser.uid).pipe(
              map(
                (userData) =>
                  userData?.user_name ||
                  userData?.displayName ||
                  firebaseUser.email ||
                  null
              )
            );
          } else {
            return of(null);
          }
        })
      )
      .subscribe((userName) => {
        this.userName$.next(userName);
      });
  }

  //------------------------------------
  // 🔥 Login com Email e Senha
  //------------------------------------
  async loginUser(email: string, password: string): Promise<FirebaseAuthUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          throw { code: 'auth/email-not-verified', message: 'Email não verificado' };
        }
        await this.saveUserDataToFirestore(firebaseUser);
      }
      return firebaseUser;
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  //------------------------------------
  // 🔥 Login com Google
  //------------------------------------
  async loginWithGoogle(): Promise<FirebaseAuthUser | null> {
    try {
      let userCredential;

      if (Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn();
        if (!googleUser?.authentication?.idToken) {
          throw new Error('Google authentication failed');
        }

        const credential = GoogleAuthProvider.credential(
          googleUser.authentication.idToken
        );

        userCredential = await signInWithCredential(this.auth, credential);
      } else {
        const provider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(this.auth, provider);
      }

      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        await this.saveUserDataToFirestore(firebaseUser);
      }

      return firebaseUser;
    } catch (error) {
      console.error('Erro no login Google:', error);
      return Promise.reject(error);
    }
  }

  //------------------------------------
  // 🔥 Logout
  //------------------------------------
  async logoutUser(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  //------------------------------------
  // 🔥 Registrar usuário com verificação de e-mail
  //------------------------------------
  async registerUser(email: string, senha: string, nome: string): Promise<FirebaseAuthUser | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, senha);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: nome });
        await this.saveUserDataToFirestore(user);
        await sendEmailVerification(user); // ✅ Envia e-mail de verificação

        // ⚠️ Faz logout imediatamente após cadastro para impedir acesso sem verificação
        await signOut(this.auth);
      }

      return user;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  //------------------------------------
  // 🔥 Atualizar Foto do Usuário
  //------------------------------------
  async updateUserPhotoUrl(userId: string, photoUrl: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await updateProfile(currentUser, { photoURL: photoUrl });
      const userRef = doc(this.usersCollection, userId);
      await updateDoc(userRef, { photoURL: photoUrl });
    } else {
      return Promise.reject(new Error('Usuário não autenticado ou ID inválido.'));
    }
  }

  //------------------------------------
  // 🔥 Salvar dados no Firestore
  //------------------------------------
  private async saveUserDataToFirestore(user: FirebaseAuthUser): Promise<void> {
    const userRef = doc(this.usersCollection, user.uid);
    const userDoc = await getDoc(userRef);

    const userDataToSave: UserData = {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      user_name: user.displayName || user.email || 'Novo Usuário',
      favoriteRecipeIds: userDoc.exists()
        ? (userDoc.data() as UserData).favoriteRecipeIds || []
        : [],
    };

    if (!userDoc.exists()) {
      await setDoc(userRef, userDataToSave);
    } else {
      await updateDoc(userRef, {
        displayName: userDataToSave.displayName,
        photoURL: userDataToSave.photoURL,
        user_name: userDataToSave.user_name,
        email: userDataToSave.email,
      });
    }
  }

  //------------------------------------
  // 🔥 Obter dados do usuário no Firestore
  //------------------------------------
  getCurrentUserData(uid: string): Observable<UserData | null> {
    const userDocRef = doc(
      this.firestore,
      `users/${uid}`
    ) as import('@firebase/firestore').DocumentReference<UserData>;

    return from(getDoc(userDocRef)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          return { ...userData, uid: docSnapshot.id };
        } else {
          return null;
        }
      }),
      catchError(() => of(null))
    );
  }
}