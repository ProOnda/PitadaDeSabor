import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
// Removi IonToolbar, IonButtons, IonButton pois não são usados no HTML fornecido
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-feed-menu',
  standalone: true,
  // Removi os imports do IonicModule, pois não são usados no HTML fornecido.
  // Se você tiver outros componentes Ionic no HTML que não me mostrou, adicione-os de volta.
  imports: [CommonModule], 
  templateUrl: './feed-menu.component.html',
  styleUrls: ['./feed-menu.component.scss'],
})
export class FeedMenuComponent implements OnInit {
  activeRoute: string = '/feed'; // Rota padrão ativa

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.urlAfterRedirects;
        this.setActiveIndicator();
      });
  }

  ngOnInit() {
    this.setActiveIndicator(); // Define o indicador inicial
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  setActiveIndicator() {
    // Note: O add-button geralmente não recebe a classe 'active' pois é uma ação, não uma rota de navegação principal.
    // Se você quiser que ele também seja 'ativo' para a rota de criação, você precisaria adicionar sua rota à lista 'routes'.
    const menuItems = document.querySelectorAll('.feed-menu-container .menu-item'); // Corrigido o seletor para .feed-menu-container
    menuItems.forEach(item => item.classList.remove('active'));

    const routes = ['/feed', '/cart', '/profile', '/configuracoes']; // Suas rotas de navegação
    
    // Encontre o item ativo com base na rota
    const activeItem = Array.from(menuItems).find((item, index) => {
      return this.activeRoute.startsWith(routes[index]);
    });

    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
}