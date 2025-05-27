import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnboardingPage2Page } from './onboarding-page2.page';

describe('OnboardingPage2Page', () => {
  let component: OnboardingPage2Page;
  let fixture: ComponentFixture<OnboardingPage2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingPage2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
