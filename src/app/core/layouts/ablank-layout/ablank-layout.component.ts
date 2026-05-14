import { Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-ablank-layout',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './ablank-layout.component.html',
  styleUrl: './ablank-layout.component.css',
  standalone: true,
})
export class AblankLayoutComponent {

}
