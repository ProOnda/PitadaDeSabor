import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'introduction',
    loadComponent: () => import('./pages/introduction/introduction.page').then( m => m.IntroductionPage)
  },
  {
    path: 'onboarding/1',
    loadComponent: () => import('./pages/onboarding-page1/onboarding-page1.page').then( m => m.OnboardingPage1)
  },
  {
    path: 'onboarding/2',
    loadComponent: () => import('./pages/onboarding-page2/onboarding-page2.page').then( m => m.OnboardingPage2)
  },
  {
    path: 'onboarding/3',
    loadComponent: () => import('./pages/onboarding-page3/onboarding-page3.page').then( m => m.OnboardingPage3)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro.page').then( m => m.CadastroPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: 'password-sent',
    loadComponent: () => import('./pages/password-sent/password-sent.page').then( m => m.PasswordSentPage)
  },
  {
    path: 'password-reset-success',
    loadComponent: () => import('./pages/password-reset-success/password-reset-success.page').then( m => m.PasswordResetSuccessPage)
  },
  {
    path: 'reset-password-new',
    loadComponent: () => import('./pages/reset-password-new/reset-password-new.page').then( m => m.ResetPasswordNewPage)
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/feed/feed.page').then( m => m.FeedPage)
  },
  {
    path: 'filter',
    loadComponent: () => import('./pages/filter/filter.page').then( m => m.FilterPage)
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./pages/configuracoes/configuracoes.page').then( m => m.ConfiguracoesPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'category-food',
    loadComponent: () => import('./pages/category-food/category-food.page').then( m => m.CategoryFoodPage)
  },
  {
    path: 'about-app',
    loadComponent: () => import('./pages/about-app/about-app.page').then( m => m.AboutAppPage)
  },
  {
    path: 'receita-detalhe/:id',
    loadComponent: () => import('./pages/receita-detalhe/receita-detalhe.page').then( m => m.ReceitaDetalhePage)
  }
];
