import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private highContrastClass = 'ion-palette-high-contrast';

  constructor() {
    const savedPreference = localStorage.getItem('highContrastEnabled');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)');
    
    const shouldEnable = savedPreference !== null
      ? JSON.parse(savedPreference)
      : prefersHighContrast.matches;

    this.setHighContrast(shouldEnable);

    // Escuta alterações do sistema
    prefersHighContrast.addEventListener('change', (event) => {
      this.setHighContrast(event.matches);
    });
  }

  setHighContrast(enabled: boolean): void {
    document.documentElement.classList.toggle(this.highContrastClass, enabled);
    document.body.classList.toggle(this.highContrastClass, enabled);
    localStorage.setItem('highContrastEnabled', JSON.stringify(enabled));
  }

  getHighContrast(): boolean {
    return document.documentElement.classList.contains(this.highContrastClass);
  }
}