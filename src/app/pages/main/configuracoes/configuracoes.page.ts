import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth'; // 👈 Import Firebase Auth
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

  ngOnInit() {}

  logout() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log('Usuário deslogado com sucesso!');
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Erro ao deslogar:', error);
      });
  }

}