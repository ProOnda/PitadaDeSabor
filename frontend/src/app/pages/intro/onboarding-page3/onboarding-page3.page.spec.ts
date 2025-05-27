import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnboardingPage3Page } from './onboarding-page3.page';

describe('OnboardingPage3Page', () => {
  let component: OnboardingPage3Page;
  let fixture: ComponentFixture<OnboardingPage3Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingPage3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
