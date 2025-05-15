import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../services/receita/receita.service';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { InfoItemComponent } from '../../components/info-item/info-item.component'; // Importe o componente InfoItem

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
  receitaId: string | null = null; // Alterado para string | null
  receita: any; // Defina o tipo correto para sua receita

  constructor(
    private route: ActivatedRoute,
    private receitaService: ReceitaService // Injete seu serviço de receitas
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.receitaId = idParam;
      this.carregarReceita(this.receitaId); // Passe o id como string
    }
  }

  carregarReceita(id: string) { // Atualize o tipo do parâmetro para string
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