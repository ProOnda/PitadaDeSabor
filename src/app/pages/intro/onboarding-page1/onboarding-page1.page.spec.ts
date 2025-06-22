import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnboardingPage1Page } from './onboarding-page1.page';

describe('OnboardingPage1Page', () => {
  let component: OnboardingPage1Page;
  let fixture: ComponentFixture<OnboardingPage1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingPage1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
