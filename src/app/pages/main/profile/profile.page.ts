// src/app/pages/main/profile/profile.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { switchMap, tap, catchError, filter } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth/auth.service';
import { ReceitaService } from 'src/app/services/receita/receita.service';

import { RecipeListItem } from 'src/app/interfaces/recipe.interfaces';
import { UserData } from 'src/app/interfaces/user.interfaces';

import { PageHeaderComponent } from 'src/app/components/item-displays/page-header/page-header.component';
import { PersonCardComponent } from 'src/app/components/item-displays/person-card/person-card.component';
import { ItemListSectionComponent } from 'src/app/components/item-displays/item-list-section/item-list-section.component';
import { FeedMenuComponent } from 'src/app/components/common/feed-menu/feed-menu.component';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PageHeaderComponent,
    PersonCardComponent,
    ItemListSectionComponent,
    FeedMenuComponent
  ],
})
export class ProfilePage implements OnInit, OnDestroy {
  userName: string | null = null;
  userPhotoUrl: string | null = null;
  postsCount: number | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  private userRecipesSubject = new BehaviorSubject<RecipeListItem[]>([]);
  userRecipes$: Observable<RecipeListItem[]> = this.userRecipesSubject.asObservable();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private receitaService: ReceitaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfileAndRecipes();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadUserProfileAndRecipes() {
    this.isLoading = true;
    this.error = null;

    this.subscriptions.add(
      this.authService.authState.pipe(
        filter(user => !!user?.uid),
        switchMap(user => {
          const userId = user!.uid;
          return this.authService.getCurrentUserData(userId).pipe(
            tap((userData: UserData | null) => {
              if (userData) {
                this.userName = userData.user_name || userData.displayName || 'Usuário';
                this.userPhotoUrl = userData.photoURL || 'https://placehold.co/100x100';
              } else {
                this.userName = 'Usuário Desconhecido';
                this.userPhotoUrl = 'https://placehold.co/100x100';
              }
            }),
            switchMap(() => {
              return this.receitaService.getRecipesByCreator(userId);
            })
          );
        }),
        tap((recipes: RecipeListItem[]) => {
          this.userRecipesSubject.next(recipes);
          this.postsCount = recipes.length;
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Erro ao carregar perfil ou receitas:', err);
          this.error = 'Não foi possível carregar o perfil ou as receitas. Tente novamente.';
          this.isLoading = false;
          return of([]);
        })
      ).subscribe()
    );
  }

  navigateToRecipeDetail(recipeId: string) {
    this.router.navigate(['/receita-detalhe', recipeId]);
  }
}