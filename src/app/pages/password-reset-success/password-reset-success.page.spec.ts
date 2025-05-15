import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordResetSuccessPage } from './password-reset-success.page';

describe('PasswordResetSuccessPage', () => {
  let component: PasswordResetSuccessPage;
  let fixture: ComponentFixture<PasswordResetSuccessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResetSuccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
