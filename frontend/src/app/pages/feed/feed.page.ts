import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { FeedMenuComponent } from '../../components/feed-menu/feed-menu.component';
import { CategoryItemComponent } from '../../components/category-item/category-item.component';
import { CommonModule } from '@angular/common';
import { ReceitaService } from '../../services/receita/receita.service';
import { ReceitaCardHorizontalComponent } from '../../components/receita-card-horizontal/receita-card-horizontal.component';
import { ItemListSectionComponent } from '../../components/item-list-section/item-list-section.component';
import { AuthService } from '../../services/auth/auth.service'; // Importe o AuthService
import { Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    SearchBarComponent,
    FeedMenuComponent,
    CategoryItemComponent,
    ReceitaCardHorizontalComponent,
    ItemListSectionComponent
  ],
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit, OnDestroy {
  receitas: any[] = [];
  loading = true;
  error: string | null = null;
  saudacao: string = '';
  userName: string | null = null;
  private timeSubscription: Subscription | undefined;

  constructor(private receitaService: ReceitaService, private authService: AuthService) {} // Injete o AuthService

  ngOnInit(): void {
    this.carregarReceitas();
    this.updateSaudacao();
    this.userName = this.authService.getUserName();

    this.timeSubscription = interval(60000).subscribe(() => {
      this.updateSaudacao();
    });

    this.authService.userName$.subscribe(name => {
      this.userName = name;
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  updateSaudacao(): void {
    const now = new Date(Date.now() - (3 * 60 * 60 * 1000)); // Ajuste para o horário de Brasília (UTC-3)
    const hour = now.getHours();

    if (hour >= 0 && hour < 12) {
      this.saudacao = 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      this.saudacao = 'Boa tarde';
    } else {
      this.saudacao = 'Boa noite';
    }
  }

  carregarReceitas() {
    this.loading = true;
    this.error = null;
    this.receitaService.listarReceitas().subscribe(
      (data) => {
        this.receitas = data;
        this.loading = false;
      },
      (error) => {
        this.error = error.message || 'Erro ao carregar receitas.';
        this.loading = false;
      }
    );
  }

  handleCategoryClick(category: string) {
    console.log(`Categoria selecionada: ${category}`);
  }
}