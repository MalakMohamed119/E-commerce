import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mainn',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="carousel-container">
      <div class="carousel-slides" [style.transform]="'translateX(' + (-currentIndex * 100) + '%)'">
        <div class="slide" *ngFor="let slide of slides">
          <img
            [src]="slide.img"
            [alt]="slide.alt"
            [style.object-position]="slide.position"
            loading="eager"
            decoding="async"
            class="slide-image">
        </div>
      </div>

      <div class="hero-shade"></div>

      <div class="hero-content">
        <p class="hero-kicker">Fresh finds, fast checkout</p>
        <h1>Shop smarter with EvoShop</h1>
        <p class="hero-copy">
          Discover everyday essentials, standout brands, and trending products in one clean shopping experience.
        </p>

        <div class="hero-actions">
          <a routerLink="/products" class="hero-primary">
            <i class="fas fa-bag-shopping"></i>
            Shop Products
          </a>
          <a routerLink="/categories" class="hero-secondary">
            Browse Categories
          </a>
        </div>

        <div class="hero-metrics" aria-label="Store highlights">
          <div>
            <strong>24/7</strong>
            <span>Shopping</span>
          </div>
          <div>
            <strong>Top</strong>
            <span>Brands</span>
          </div>
          <div>
            <strong>Fast</strong>
            <span>Delivery</span>
          </div>
        </div>
      </div>

      <button class="carousel-button prev" type="button" (click)="previous()" aria-label="Previous slide">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="carousel-button next" type="button" (click)="next()" aria-label="Next slide">
        <i class="fas fa-chevron-right"></i>
      </button>

      <div class="carousel-dots">
        <button
          *ngFor="let slide of slides; let i = index"
          type="button"
          [class.active]="i === currentIndex"
          (click)="goToSlide(i)"
          [attr.aria-label]="'Go to hero slide ' + (i + 1)">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .carousel-container {
      width: 100%;
      height: clamp(440px, 58vw, 650px);
      overflow: hidden;
      position: relative;
      background: #0f172a;
    }
    
    .carousel-slides {
      display: flex;
      height: 100%;
      transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
    }
    
    .slide {
      min-width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    
    .slide-image {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transform: none;
    }

    .hero-shade {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, rgba(9, 25, 44, 0.86) 0%, rgba(9, 25, 44, 0.58) 43%, rgba(9, 25, 44, 0.15) 100%),
        linear-gradient(0deg, rgba(9, 25, 44, 0.56) 0%, transparent 44%);
      pointer-events: none;
    }

    .hero-content {
      position: absolute;
      left: clamp(18px, 7vw, 96px);
      top: 50%;
      transform: translateY(-50%);
      width: min(620px, calc(100% - 36px));
      color: #fff;
      z-index: 2;
    }

    .hero-kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 14px;
      padding: 8px 12px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      color: #d5f4ee;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0;
      backdrop-filter: blur(10px);
    }

    .hero-content h1 {
      margin: 0;
      font-size: clamp(2.35rem, 6vw, 5rem);
      line-height: 0.98;
      max-width: 11ch;
      font-weight: 900;
      letter-spacing: 0;
    }

    .hero-copy {
      margin: 22px 0 0;
      max-width: 560px;
      color: rgba(255, 255, 255, 0.82);
      font-size: clamp(1rem, 1.5vw, 1.2rem);
      line-height: 1.7;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 30px;
    }

    .hero-primary,
    .hero-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 12px 18px;
      border-radius: 8px;
      font-weight: 800;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .hero-primary {
      gap: 9px;
      color: #102033;
      background: #ffffff;
      box-shadow: 0 18px 35px rgba(0, 0, 0, 0.22);
    }

    .hero-secondary {
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .hero-primary:hover,
    .hero-secondary:hover {
      transform: translateY(-2px);
    }

    .hero-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 34px;
      width: min(480px, 100%);
    }

    .hero-metrics div {
      padding: 14px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .hero-metrics strong,
    .hero-metrics span {
      display: block;
    }

    .hero-metrics strong {
      font-size: 1.22rem;
      line-height: 1;
    }

    .hero-metrics span {
      margin-top: 5px;
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.82rem;
      font-weight: 700;
    }
    
    .carousel-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.12);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      cursor: pointer;
      font-size: 15px;
      z-index: 10;
      backdrop-filter: blur(10px);
      transition: background 0.2s ease, transform 0.2s ease;
    }
    
    .carousel-button:hover {
      background: rgba(255, 255, 255, 0.22);
      transform: translateY(-50%) scale(1.04);
    }
    
    .prev {
      left: 18px;
    }
    
    .next {
      right: 18px;
    }
    
    .carousel-dots {
      position: absolute;
      bottom: 24px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 8px;
      z-index: 3;
    }
    
    .carousel-dots button {
      width: 9px;
      height: 9px;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background-color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: width 0.2s ease, background-color 0.2s ease;
    }
    
    .carousel-dots button.active {
      width: 30px;
      background-color: white;
    }

    @media (max-width: 768px) {
      .carousel-container {
        height: 610px;
      }

      .hero-shade {
        background:
          linear-gradient(180deg, rgba(9, 25, 44, 0.78) 0%, rgba(9, 25, 44, 0.72) 54%, rgba(9, 25, 44, 0.9) 100%);
      }

      .hero-content {
        left: 16px;
        right: 16px;
        top: 48%;
        width: auto;
      }

      .hero-content h1 {
        max-width: 12ch;
      }

      .hero-copy {
        margin-top: 16px;
        line-height: 1.55;
      }

      .hero-actions {
        align-items: stretch;
        gap: 10px;
        margin-top: 22px;
      }

      .hero-primary,
      .hero-secondary {
        width: 100%;
      }

      .hero-metrics {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: 22px;
        width: min(100%, calc(100vw - 32px));
      }

      .hero-metrics div {
        min-height: 64px;
        padding: 10px;
      }

      .hero-metrics strong {
        font-size: 1rem;
      }

      .hero-metrics span {
        font-size: 0.72rem;
      }

      .carousel-dots {
        bottom: 18px;
      }

      .carousel-button {
        display: none;
      }
    }

    @media (max-width: 380px) {
      .carousel-container {
        height: 640px;
      }

      .hero-content {
        left: 14px;
        right: 14px;
      }

      .hero-metrics {
        grid-template-columns: 1fr;
        width: min(100%, calc(100vw - 28px));
      }
    }
  `]
})
export class MainnComponent {
  currentIndex = 0;
  slides = [
    {
      id: 1,
      img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2200&h=900&q=85',
      alt: 'Modern laptop and digital shopping workspace',
      position: 'center center'
    },
    {
      id: 2,
      img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=2200&h=900&q=85',
      alt: 'Premium electronics and gadgets on a clean desk',
      position: 'center center'
    },
    {
      id: 3,
      img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2200&h=900&q=85',
      alt: 'Fashion retail store with clothing racks',
      position: 'center center'
    },
    {
      id: 4,
      img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=2200&h=900&q=85',
      alt: 'Modern home interior for home category shopping',
      position: 'center center'
    },
    {
      id: 5,
      img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=2200&h=900&q=85',
      alt: 'Beauty products and cosmetics for beauty category shopping',
      position: 'center center'
    }
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
