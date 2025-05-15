import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

interface ReceitaComId {
  id: string;
  recipe: any; // Ajuste a tipagem se souber a estrutura exata
}

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private firestore: Firestore = inject(Firestore);
  private receitasCollection = collection(this.firestore, 'recipes');

  constructor() { }

  // Método para listar todas as receitas
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

  // Método para buscar uma receita por ID
  buscarReceitaPorId(id: string): Observable<any> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return docData(receitaDocument, { idField: 'id' });
  }

  // Método para criar uma nova receita
  criarReceita(novaReceita: any): Observable<any> {
    return from(addDoc(this.receitasCollection, novaReceita)).pipe(
      map(docRef => ({ id: docRef.id, ...novaReceita })) // Retorna a receita criada com o ID gerado
    );
  }

  // Método para atualizar uma receita
  atualizarReceita(id: string, receitaAtualizada: any): Observable<void> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return from(updateDoc(receitaDocument, receitaAtualizada));
  }

  // Método para deletar uma receita
  deletarReceita(id: string): Observable<void> {
    const receitaDocument = doc(this.firestore, `recipes/${id}`);
    return from(deleteDoc(receitaDocument));
  }
}