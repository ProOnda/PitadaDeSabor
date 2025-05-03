import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-item.component.html',
  styleUrls: ['./filter-item.component.scss'],
})
export class FilterItemComponent implements OnInit {
  @Input() label: string = '';
  @Input() initialSelected: boolean = false;
  @Output() filterItemSelected = new EventEmitter<string>();

  isSelected: boolean = false;

  ngOnInit(): void {
    this.isSelected = this.initialSelected;
  }

  onItemSelected() {
    this.isSelected = !this.isSelected;
    this.filterItemSelected.emit(this.label);
  }
}