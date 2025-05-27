import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/intro/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'introduction',
    loadComponent: () => import('./pages/intro/introduction/introduction.page').then( m => m.IntroductionPage)
  },
  {
    path: 'onboarding/1',
    loadComponent: () => import('./pages/intro/onboarding-page1/onboarding-page1.page').then( m => m.OnboardingPage1)
  },
  {
    path: 'onboarding/2',
    loadComponent: () => import('./pages/intro/onboarding-page2/onboarding-page2.page').then( m => m.OnboardingPage2)
  },
  {
    path: 'onboarding/3',
    loadComponent: () => import('./pages/intro/onboarding-page3/onboarding-page3.page').then( m => m.OnboardingPage3)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/auth/cadastro/cadastro.page').then( m => m.CadastroPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: 'password-sent',
    loadComponent: () => import('./pages/auth/password-sent/password-sent.page').then( m => m.PasswordSentPage)
  },
  {
    path: 'password-reset-success',
    loadComponent: () => import('./pages/auth/password-reset-success/password-reset-success.page').then( m => m.PasswordResetSuccessPage)
  },
  {
    path: 'reset-password-new',
    loadComponent: () => import('./pages/auth/reset-password-new/reset-password-new.page').then( m => m.ResetPasswordNewPage)
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/main/feed/feed.page').then( m => m.FeedPage)
  },
  {
    path: 'filter',
    loadComponent: () => import('./pages/main/filter/filter.page').then( m => m.FilterPage)
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./pages/main/configuracoes/configuracoes.page').then( m => m.ConfiguracoesPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/main/cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'category-food',
    loadComponent: () => import('./pages/main/category-food/category-food.page').then( m => m.CategoryFoodPage)
  },
  {
    path: 'receita-detalhe/:id',
    loadComponent: () => import('./pages/main/receita-detalhe/receita-detalhe.page').then( m => m.ReceitaDetalhePage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/settings/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'about-app',
    loadComponent: () => import('./pages/settings/about-app/about-app.page').then( m => m.AboutAppPage)
  },
];
