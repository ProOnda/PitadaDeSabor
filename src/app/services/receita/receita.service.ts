// src/app/receita/receita.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private apiUrl = 'http://localhost:3000/receitas';

  constructor(private http: HttpClient) { }

  // Método para listar todas as receitas
  listarReceitas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Método para buscar uma receita por ID
  buscarReceitaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Método para criar uma nova receita
  criarReceita(novaReceita: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, novaReceita);
  }

  // Método para atualizar uma receita
  atualizarReceita(id: number, receitaAtualizada: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, receitaAtualizada);
  }

  // Método para deletar uma receita
  deletarReceita(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}