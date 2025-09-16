import { Component, OnInit } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-slider',
  templateUrl: './main-slider.component.html',
  styleUrls: ['./main-slider.component.css'],
  standalone: true,
  imports: [CarouselModule, CommonModule]
})
export class MainSliderComponent implements OnInit {
  slides = [
    { id: 1, img: '/images/img1.avif' },
    { id: 2, img: '/images/img2.avif' },
    { id: 3, img: '/images/img3.avif' },
    { id: 4, img: '/images/img4.avif' },
    { id: 5, img: '/images/img5.avif' },
    { id: 6, img: '/images/img6.avif' },
    { id: 7, img: '/images/img7.avif' }
  ];

  mainOption: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    navText: ['', ''],
    items: 1,
    nav: false,
    responsive: {
      0: {
        items: 1
      },
      768: {
        items: 1
      },
      992: {
        items: 1
      }
    }
  };

  constructor() { }

  ngOnInit(): void {
    // Initialization code if needed
  }

}
