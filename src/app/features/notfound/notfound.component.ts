import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-notfound',
  imports: [NavbarComponent],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css',
  standalone: true,
})
export class NotfoundComponent {

}
