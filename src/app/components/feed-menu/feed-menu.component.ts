import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonToolbar, IonButtons, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-feed-menu',
  standalone: true,
  imports: [CommonModule, IonToolbar, IonButtons, IonButton],
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
    const menuItems = document.querySelectorAll('.feed-menu .menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    const activeItem = Array.from(menuItems).find((item, index) => {
      const routes = ['/feed', '/cart', '/profile', '/configuracoes']; // Ajuste suas rotas
      return this.activeRoute.startsWith(routes[index]); // Verifica se a rota ativa começa com a rota do item
    });

    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
}