import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceitaDetalhePage } from './receita-detalhe.page';

describe('ReceitaDetalhePage', () => {
  let component: ReceitaDetalhePage;
  let fixture: ComponentFixture<ReceitaDetalhePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceitaDetalhePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
