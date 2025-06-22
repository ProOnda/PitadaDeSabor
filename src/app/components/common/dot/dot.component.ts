import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dot.component.html',
  styleUrls: ['./dot.component.scss'],
})
export class DotComponent {
  @Input() active: boolean = false;
}