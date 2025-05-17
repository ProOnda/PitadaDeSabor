import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, forkJoin, of, throwError } from 'rxjs';
import { map, switchMap, catchError, shareReplay, tap } from 'rxjs/operators';

interface ReceitaComId {
  id: string;
  recipe: any;
}

interface Categoria {
  id: string;
  label: string;
}

interface Dificuldade {
  id: string;
  label: string;
}

interface Tempo {
  id: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private firestore: Firestore = inject(Firestore);
  private receitasCollection = collection(this.firestore, 'recipes');
  private categoriasCollection = collection(this.firestore, 'categories');
  private dificuldadesCollection = collection(this.firestore, 'difficulties');
  private temposCollection = collection(this.firestore, 'times');

  // Adicionando shareReplay para evitar múltiplas chamadas
  private categorias$: Observable<Categoria[]> = collectionData(this.categoriasCollection, { idField: 'id' }).pipe(
    map(data => data.map(item => ({ id: item['id'], label: item['label'] }))),
    shareReplay({ bufferSize: 1, refCount: true }),
    catchError(this.handleError<Categoria[]>('Erro ao buscar categorias', [])) // Adicionei tratamento de erro
  ) as Observable<Categoria[]>;
  private dificuldades$: Observable<Dificuldade[]> = collectionData(this.dificuldadesCollection, { idField: 'id' }).pipe(
    map(data => data.map(item => ({ id: item['id'], label: item['label'] }))),
    shareReplay({ bufferSize: 1, refCount: true }),
    catchError(this.handleError<Dificuldade[]>('Erro ao buscar dificuldades', [])) // Adicionei tratamento de erro
  ) as Observable<Dificuldade[]>;
  private tempos$: Observable<Tempo[]> = collectionData(this.temposCollection, { idField: 'id' }).pipe(
    map(data => data.map(item => ({ id: item['id'], label: item['label'] }))),
    shareReplay({ bufferSize: 1, refCount: true }),
    catchError(this.handleError<Tempo[]>('Erro ao buscar tempos', [])) // Adicionei tratamento de erro
  ) as Observable<Tempo[]>;

  constructor() { }

  listarReceitasComDetalhes(): Observable<any[]> {
    return collectionData(this.receitasCollection, { idField: 'id' }).pipe(
      switchMap(receitas => {
        if (!receitas.length) {
          return of([]);
        }
        const observables = receitas.map(receita => this.buscarDetalhesReceita(receita));
        return forkJoin(observables);
      }),
      catchError(this.handleError('Erro ao listar receitas com detalhes', []))
    );
  }

  buscarReceitaPorIdComDetalhes(id: string): Observable<any | undefined> {
    console.log(`[ReceitaService] buscarReceitaPorIdComDetalhes chamado com ID: ${id}`);
    const receitaRef = doc(this.firestore, `receitas/${id}`);
    return docData(receitaRef).pipe(
      tap(data => {
        console.log('[ReceitaService] Dados retornados do Firestore:', data);
      }),
      catchError(error => {
        console.error('[ReceitaService] Erro ao buscar receita:', error);
        return of(undefined);
      })
    );
  }

  private buscarDetalhesReceita(receita: any): Observable<any> {
    // Usando os Observables armazenados em cache
    const categoria$ = this.categorias$.pipe(
      map(categorias => categorias.find(c => c.id === receita?.category_id)),
      catchError(this.handleError('Erro ao buscar categoria', undefined))
    );
    const dificuldade$ = this.dificuldades$.pipe(
      map(dificuldades => dificuldades.find(d => d.id === receita?.difficulty_id)),
      catchError(this.handleError('Erro ao buscar dificuldade', undefined))
    );
    const tempo$ = this.tempos$.pipe(
      map(tempos => tempos.find(t => t.id === receita?.time_id)),
      catchError(this.handleError('Erro ao buscar tempo', undefined))
    );

    return forkJoin({ categoria: categoria$, dificuldade: dificuldade$, tempo: tempo$ }).pipe(
      map(({ categoria, dificuldade, tempo }) => ({
        id: receita['id'],
        recipe: {
          ...receita,
          categoryName: categoria?.label || 'Não definida',
          difficultyName: dificuldade?.label || 'Não definida',
          timeName: tempo?.label || 'Não definida',
        },
      })),
      catchError(this.handleError('Erro ao buscar detalhes da receita', {}))
    );
  }

  private buscarNomeColecao(collectionRef: any, id: string): Observable<any | undefined> {
    if (!id) {
      return of(undefined);
    }
    const docRef = doc(this.firestore, `${collectionRef.path}/${id}`);
    return docData(docRef).pipe(
      catchError(this.handleError(`Erro ao buscar nome da coleção ${collectionRef.path}/${id}`, undefined))
    );
  }

  listarReceitas(): Observable<ReceitaComId[]> {
    return collectionData(this.receitasCollection, { idField: 'id' }).pipe(
      map(receitas => receitas.map(receita => ({
        id: receita['id'],
        recipe: {
          photo: receita['photo'],
          recipe_name: receita['recipe_name']
        }
      }))),
      catchError(this.handleError('Erro ao listar receitas', []))
    );
  }

  buscarReceitaPorId(id: string): Observable<any> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return docData(receitaDocument, { idField: 'id' }).pipe(
      catchError(this.handleError(`Erro ao buscar receita por ID ${id}`, undefined))
    );
  }

  criarReceita(novaReceita: any): Observable<any> {
    return from(addDoc(this.receitasCollection, novaReceita)).pipe( // Use addDoc
      map(docRef => ({ id: docRef.id, ...novaReceita })),
      catchError(this.handleError('Erro ao criar receita', null))
    );
  }

  atualizarReceita(id: string, receitaAtualizada: any): Observable<void> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return from(updateDoc(receitaDocument, receitaAtualizada)).pipe( // Use updateDoc
      catchError(this.handleError(`Erro ao atualizar receita ${id}`, undefined))
    );
  }

  deletarReceita(id: string): Observable<void> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return from(deleteDoc(receitaDocument)).pipe( // Use deleteDoc
      catchError(this.handleError(`Erro ao deletar receita ${id}`, undefined))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falhou: ${error.message}`);
      return of(result as T);
    };
  }
}