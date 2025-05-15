import { Component, Input } from '@angular/core';
 import { IonicModule } from '@ionic/angular';
 import { CommonModule, Location } from '@angular/common'; // Importe Location

 @Component({
   selector: 'app-page-header',
   templateUrl: './page-header.component.html',
   styleUrls: ['./page-header.component.scss'],
   standalone: true,
   imports: [IonicModule, CommonModule],
 })
 export class PageHeaderComponent {
   @Input() title: string = '';
   @Input() showBackButton: boolean = false;
   @Input() backButtonRoute: string = '/';
   constructor(private location: Location) {} // Injete o Location service

   goBack() {
     this.location.back();
   }
 }