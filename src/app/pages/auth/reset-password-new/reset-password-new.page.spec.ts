import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordNewPage } from './reset-password-new.page';

describe('ResetPasswordNewPage', () => {
  let component: ResetPasswordNewPage;
  let fixture: ComponentFixture<ResetPasswordNewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordNewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
