import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionItem } from '../../../interfaces/recipe.interfaces'; // Importar a interface OptionItem

@Component({
  selector: 'app-option-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './option-section.component.html',
  styleUrls: ['./option-section.component.scss'],
})
export class OptionSectionComponent implements OnInit { // Implementa OnInit
  @Input() title: string = '';
  @Input() iconClass: string = '';
  @Input() options: OptionItem[] = [];

  // Esta é a nova propriedade que o componente PAI (FilterPage) passará
  // Ela deve ser um array de strings, pois o pai gerencia múltiplas seleções
  @Input() currentSelectedValues: string[] = [];

  // O evento agora emitirá um único valor de string (o que foi clicado)
  // A lógica de adicionar/remover do array é do componente pai.
  @Output() optionSelected = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {
    // Não precisa de lógica de inicialização aqui para selectedOptionValueInternal
    // pois a seleção é ditada pelo 'currentSelectedValues' do componente pai.
  }

  // Método chamado quando uma opção é clicada
  onOptionClick(value: string): void {
    // Este componente APENAS informa ao pai qual valor foi clicado.
    // A lógica de toggle (selecionar/desselecionar) é do pai.
    this.optionSelected.emit(value);
  }

  // Novo método para verificar se a opção está selecionada (usado no HTML)
  isSelected(value: string): boolean {
    // Verifica se o valor da opção clicada está presente no array
    // de valores selecionados que o pai enviou (currentSelectedValues)
    return this.currentSelectedValues.includes(value);
  }
}