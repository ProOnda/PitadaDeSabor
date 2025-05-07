import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../services/receita/receita.service';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { InfoItemComponent } from 'src/app/components/info-item/info-item.component'; // Importe o componente InfoItem

@Component({
  selector: 'app-receita-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PageHeaderComponent,
    InfoItemComponent // Adicione o InfoItemComponent aos imports
  ],
  templateUrl: './receita-detalhe.page.html',
  styleUrls: ['./receita-detalhe.page.scss'],
})
export class ReceitaDetalhePage implements OnInit {
  receitaId: number | null = null;
  receita: any; // Defina o tipo correto para sua receita

  constructor(
    private route: ActivatedRoute,
    private receitaService: ReceitaService // Injete seu serviço de receitas
  ) {}

  ngOnInit() {
    this.receitaId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.receitaId) {
      this.carregarReceita(this.receitaId);
    }
  }

  carregarReceita(id: number) {
    this.receitaService.buscarReceitaPorId(id).subscribe(
      (data) => {
        this.receita = data;
      },
      (error) => {
        console.error('Erro ao carregar receita:', error);
        // Trate o erro aqui (exibir mensagem, etc.)
      }
    );
  }
}