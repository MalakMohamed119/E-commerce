import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mainn',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carousel-container">
      <div class="carousel-slides" [style.transform]="'translateX(' + (-currentIndex * 100) + '%)'">
        <div class="slide" *ngFor="let slide of slides">
          <img [src]="slide.img" [alt]="'Slide ' + slide.id" class="slide-image">
        </div>
      </div>
     
      <!-- <div class="carousel-dots">
        <span *ngFor="let slide of slides; let i = index"
              [class.active]="i === currentIndex"
              (click)="goToSlide(i)"></span>
      </div> -->
    </div>
  `,
  styles: [`
    .carousel-container {
      width: 100%;
      height: 500px;
      overflow: hidden;
    }
    
    .carousel-slides {
      display: flex;
      height: 100%;
      transition: transform 0.5s ease-in-out;
    }
    
    .slide {
      min-width: 100%;
      height: 100%;
    }
    
    .slide-image {
      width: 100%;
      height: 100%;
    }
    
    .carousel-button {
      position: absolute;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      padding: 15px;
      cursor: pointer;
      font-size: 18px;
      z-index: 10;
    }
    
    .carousel-button:hover {
      background: rgba(0, 0, 0, 0.8);
    }
    
    .prev {
      left: 10px;
    }
    
    .next {
      right: 10px;
    }
    
    .carousel-dots {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    
    .carousel-dots span {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .carousel-dots span.active {
      background-color: white;
    }
  `]
})
export class MainnComponent {
  currentIndex = 0;
  slides = [
    { id: 1, img: '/images/img1.avif' },
    { id: 2, img: '/images/img2.avif' },
    { id: 3, img: '/images/img3.avif' },
    { id: 4, img: '/images/img4.avif' },
    { id: 5, img: '/images/img5.avif' },
    { id: 6, img: '/images/img6.avif' },
    { id: 7, img: '/images/img7.avif' }
  ];

  constructor() {
    // Auto-advance slides every 3 seconds
    setInterval(() => {
      this.next();
    }, 3000);
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  previous(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }
}
