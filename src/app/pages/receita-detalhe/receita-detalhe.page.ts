import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../services/receita/receita.service';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { InfoItemComponent } from '../../components/info-item/info-item.component';
import { Observable, Subscription, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-receita-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PageHeaderComponent,
    InfoItemComponent
  ],
  templateUrl: './receita-detalhe.page.html',
  styleUrls: ['./receita-detalhe.page.scss'],
})
export class ReceitaDetalhePage implements OnInit, OnDestroy {
  receitaId: string | null = null;
  receita$!: Observable<any | undefined>;
  private route: ActivatedRoute = inject(ActivatedRoute);
  private receitaService: ReceitaService = inject(ReceitaService);
  private subscription: Subscription | undefined;
  receitaNaoEncontrada = false;

  constructor() { }

  ngOnInit() {
    this.receitaId = this.route.snapshot.paramMap.get('id');
    console.log('[ReceitaDetalhePage] ID da receita da rota:', this.receitaId);
    if (this.receitaId) {
      this.carregarReceitaComDetalhes(this.receitaId);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  carregarReceitaComDetalhes(id: string) {
    console.log('[ReceitaDetalhePage] Carregando receita com ID:', id);
    this.receita$ = this.receitaService.buscarReceitaPorIdComDetalhes(id).pipe(
      tap(data => {
        console.log('[ReceitaDetalhePage] Dados recebidos do serviço:', data);
        if (!data) {
          this.receitaNaoEncontrada = true;
        } else {
          this.receitaNaoEncontrada = false; // Reseta a flag caso a receita seja encontrada
        }
      }),
      catchError(error => {
        console.error('[ReceitaDetalhePage] Erro ao buscar receita:', error);
        this.receitaNaoEncontrada = true;
        return of(undefined);
      })
    );
  }
}