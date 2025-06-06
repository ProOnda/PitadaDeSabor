import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigItemComponent } from '../../../components/item-displays/config-item/config-item.component';
import { ButtonComponent } from '../../../components/common/button/button.component';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';
import { FeedMenuComponent } from '../../../components/common/feed-menu/feed-menu.component';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
  standalone: true,
  imports: [CommonModule, ConfigItemComponent, ButtonComponent, PageHeaderComponent, FeedMenuComponent],
})
export class ConfiguracoesPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  logout() {
    // Lógica para sair da conta (ex: limpar tokens, navegar para login)
    console.log('Sair da conta clicado!');
    // Exemplo de navegação após o logout:
    // this.router.navigate(['/login']);
  }

}