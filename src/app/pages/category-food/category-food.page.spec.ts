import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryFoodPage } from './category-food.page';

describe('CategoryFoodPage', () => {
  let component: CategoryFoodPage;
  let fixture: ComponentFixture<CategoryFoodPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryFoodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
