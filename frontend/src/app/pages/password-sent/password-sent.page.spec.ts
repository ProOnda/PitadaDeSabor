import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordSentPage } from './password-sent.page';

describe('PasswordSentPage', () => {
  let component: PasswordSentPage;
  let fixture: ComponentFixture<PasswordSentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordSentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
