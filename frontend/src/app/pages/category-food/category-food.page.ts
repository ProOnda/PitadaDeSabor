import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-category-food',
  templateUrl: './category-food.page.html',
  styleUrls: ['./category-food.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CategoryFoodPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
