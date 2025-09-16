import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./shared/components/footer/footer.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.html', 
  styleUrls: ['./app.css'],   
  imports: [RouterOutlet,FooterComponent],
  standalone: true,
})
export class AppComponent implements AfterViewInit {
  title = 'web-app';

  ngAfterViewInit(): void {
    initFlowbite(); 
  }
}
