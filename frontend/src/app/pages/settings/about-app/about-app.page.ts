import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { PersonCardComponent } from '../../../components/item-displays/person-card/person-card.component';
import { PageHeaderComponent } from '../../../components/item-displays/page-header/page-header.component';

@Component({
  selector: 'app-about-app',
  templateUrl: './about-app.page.html',
  styleUrls: ['./about-app.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, PersonCardComponent, PageHeaderComponent],
})
export class AboutAppPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}