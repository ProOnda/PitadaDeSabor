import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeCreationPage } from './recipe-creation.page';

describe('RecipeCreationPage', () => {
  let component: RecipeCreationPage;
  let fixture: ComponentFixture<RecipeCreationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeCreationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
