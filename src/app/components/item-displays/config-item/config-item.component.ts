import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-config-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './config-item.component.html',
  styleUrls: ['./config-item.component.scss'],
})
export class ConfigItemComponent {
  @Input() iconClass: string = '';
  @Input() label: string = '';
  @Input() route: string = '';
}