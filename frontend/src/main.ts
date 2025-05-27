import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth'; // Importe provideAuth e getAuth
import { environment } from './environments/environment'; // Certifique-se de ter este arquivo CONFIGURADO com as credenciais

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // Inicializa o Firebase
    provideFirestore(() => getFirestore()), // Inicializa o Firestore
    provideAuth(() => getAuth()), // Inicializa o Auth
    // Outros providers do seu aplicativo
  ],
}).catch((err) => console.error(err));