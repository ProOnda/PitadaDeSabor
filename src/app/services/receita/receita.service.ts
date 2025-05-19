import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, DocumentReference, getDoc } from '@angular/fire/firestore';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

interface Receita {
  id?: string;
  photo?: string;
  recipe_name?: string;
  description?: string;
  preparation_mode?: any;
  category_id?: string | DocumentReference; // Aceita string (path) ou DocumentReference
  difficulty_id?: string | DocumentReference;
  time_id?: string | DocumentReference;
  user_id?: string | DocumentReference; // Aceita string (UID) ou DocumentReference
}

interface ReceitaComId {
  id: string;
  recipe: {
    photo?: string;
    recipe_name?: string;
  };
}

interface Categoria { id?: string; label?: string; }
interface Dificuldade { id?: string; label?: string; }
interface Tempo { id?: string; label?: string; }
interface Usuario { id?: string; user_name?: string; } // Interface para o documento de usuário

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private firestore: Firestore = inject(Firestore);
  private receitasCollection = collection(this.firestore, 'recipes');
  private usuariosCollection = collection(this.firestore, 'users'); // Referência à coleção de usuários

  constructor() { }

  listarReceitas(): Observable<ReceitaComId[]> {
    return collectionData(this.receitasCollection, { idField: 'id' }).pipe(
      map(receitas => receitas.map(receita => ({
        id: receita['id'],
        recipe: {
          photo: receita['photo'],
          recipe_name: receita['recipe_name']
        }
      })))
    );
  }

  buscarReceitaPorIdComDetalhes(id: string): Observable<any | undefined> {
    const receitaRef = doc(this.firestore, `recipes/${id}`);

    return from(getDoc(receitaRef)).pipe(
      switchMap(docSnapshot => {
        if (docSnapshot.exists()) {
          const receitaData = { id: docSnapshot.id, ...docSnapshot.data() } as Receita;

          const getCategoria$ = this.buscarDetalhePorRefOrPath<Categoria>(receitaData.category_id);
          const getDificuldade$ = this.buscarDetalhePorRefOrPath<Dificuldade>(receitaData.difficulty_id);
          const getTempo$ = this.buscarDetalhePorRefOrPath<Tempo>(receitaData.time_id);
          const getUser$ = this.buscarDetalhePorRefOrPath<Usuario>(receitaData.user_id, 'users'); // Busca o usuário

          return forkJoin({ categoria: getCategoria$, dificuldade: getDificuldade$, tempo: getTempo$, user: getUser$ }).pipe(
            map(({ categoria, dificuldade, tempo, user }) => ({
              id: receitaData.id,
              recipe: {
                ...receitaData,
                categoryName: categoria?.label || 'Não definida',
                difficultyName: dificuldade?.label || 'Não definida',
                timeName: tempo?.label || 'Não definida',
                userName: user?.user_name || 'Desconhecido',
              },
            }))
          );
        } else {
          return of(undefined);
        }
      }),
      catchError(this.handleError<any | undefined>('buscarReceitaPorIdComDetalhes', undefined))
    );
  }

  buscarReceitaPorId(id: string): Observable<Receita | undefined> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return docData(receitaDocument, { idField: 'id' }) as Observable<Receita | undefined>;
  }

  private buscarDetalhePorRefOrPath<T extends { id?: string; user_name?: string; label?: string }>(
    refOrPath: string | DocumentReference | undefined,
    collectionName?: string // Opcional: nome da coleção se for diferente de padrão
  ): Observable<T | undefined> {
    if (!refOrPath) {
      return of(undefined);
    }

    let docRef: DocumentReference | undefined;

    if (typeof refOrPath === 'string') {
      docRef = doc(this.firestore, collectionName || 'default', refOrPath); // Usa collectionName se fornecido
    } else if (refOrPath instanceof DocumentReference) {
      docRef = refOrPath;
    }

    if (docRef) {
      return from(getDoc(docRef)).pipe(
        map(snap => {
          if (snap.exists()) {
            return { id: snap.id, ...snap.data() } as T;
          }
          return undefined;
        }),
        catchError(this.handleError<T | undefined>('Erro ao buscar detalhe', undefined))
      );
    } else {
      console.warn('[buscarDetalhePorRefOrPath] Tipo de refOrPath inválido:', refOrPath);
      return of(undefined);
    }
  }

  criarReceitaComReferencias(novaReceita: Omit<Receita, 'id'>, categoryRef: DocumentReference, difficultyRef: DocumentReference, timeRef: DocumentReference, userRef: DocumentReference): Observable<any> {
    const receitaParaSalvar = {
      ...novaReceita,
      category_id: categoryRef,
      difficulty_id: difficultyRef,
      time_id: timeRef,
      user_id: userRef,
    };
    return from(addDoc(this.receitasCollection, receitaParaSalvar)).pipe(
      map(docRef => ({ id: docRef.id, ...receitaParaSalvar }))
    );
  }

  atualizarReceitaComReferencias(id: string, receitaAtualizada: Omit<Receita, 'id'>, categoryRef: DocumentReference, difficultyRef: DocumentReference, timeRef: DocumentReference, userRef: DocumentReference): Observable<void> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    const receitaParaAtualizar = {
      ...receitaAtualizada,
      category_id: categoryRef,
      difficulty_id: difficultyRef,
      time_id: timeRef,
      user_id: userRef,
    };
    return from(updateDoc(receitaDocument, receitaParaAtualizar));
  }

  atualizarReceita(id: string, receitaAtualizada: Partial<Receita>): Observable<void> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return from(updateDoc(receitaDocument, receitaAtualizada));
  }

  deletarReceita(id: string): Observable<void> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return from(deleteDoc(receitaDocument));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error}`);
      return of(result as T);
    };
  }
}